import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/payments/stripe';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers, teams } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return new NextResponse(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's team
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find the user's team
    const userTeam = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, user.id),
      with: {
        team: true
      }
    });

    if (!userTeam) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Team not found',
          message: 'You need to be part of a team to complete this action.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!checkoutSession.subscription) {
      return new NextResponse(
        JSON.stringify({ error: 'No subscription found in session' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscription = checkoutSession.subscription as any;
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer?.id;

    if (!customerId) {
      return new NextResponse(
        JSON.stringify({ error: 'No customer ID found in subscription' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the plan name from the subscription items
    const planName = subscription.items.data[0]?.price.nickname || 'Pro';
    
    // Update the team's subscription status in the database
    await db
      .update(teams)
      .set({
        subscriptionStatus: subscription.status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        planName,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, userTeam.team.id));

    // Update the user's role to owner if not already set
    if (user.role !== 'owner') {
      await db
        .update(users)
        .set({
          role: 'owner',
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ 
      success: true,
      subscription: {
        status: subscription.status,
        planName,
        customerId,
        subscriptionId: subscription.id,
        teamId: userTeam.team.id,
        teamName: userTeam.team.name
      }
    });

  } catch (error) {
    console.error('Error verifying subscription session:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to verify subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
