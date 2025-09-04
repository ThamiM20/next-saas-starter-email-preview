import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return new NextResponse(
        JSON.stringify({ error: 'Price ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the user from the database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If user already has a Stripe customer ID, use it, otherwise create a new customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      
      // Save the Stripe customer ID to the user
      await db.update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, user.id));
      
      customerId = customer.id;
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
      customer: customerId,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
