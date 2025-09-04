import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function updateUserSubscription(
  userId: string,
  subscription: {
    status: string;
    planName?: string;
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
  }
) {
  try {
    await db
      .update(users)
      .set({
        subscriptionStatus: subscription.status,
        ...(subscription.planName && { planName: subscription.planName }),
        ...(subscription.stripeSubscriptionId && {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        }),
        ...(subscription.stripeCustomerId && {
          stripeCustomerId: subscription.stripeCustomerId,
        }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return { success: false, error: 'Failed to update subscription' };
  }
}

export function getPlanName(priceId: string): string {
  // Map Stripe price IDs to plan names
  const planMap: Record<string, string> = {
    [process.env.STRIPE_STARTER_PRICE_ID || '']: 'Starter',
    [process.env.STRIPE_PRO_PRICE_ID || '']: 'Pro',
  };
  
  return planMap[priceId] || 'Custom';
}

export function isSubscriptionActive(status: string): boolean {
  return ['active', 'trialing'].includes(status);
}

export function isSubscriptionPastDue(status: string): boolean {
  return status === 'past_due';
}

export function isSubscriptionCanceled(status: string): boolean {
  return ['canceled', 'unpaid', 'incomplete_expired'].includes(status);
}
