import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
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

    if (!user.stripeCustomerId) {
      return new NextResponse(
        JSON.stringify({ error: 'No subscription found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    if (!portalSession.url) {
      throw new Error('Failed to create portal session');
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create portal session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
