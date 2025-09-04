'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useSubscription() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const subscriptionStatus = session?.user?.subscriptionStatus || 'inactive';
  const planName = session?.user?.planName || 'Free';
  const isActive = ['active', 'trialing'].includes(subscriptionStatus);
  const isPastDue = subscriptionStatus === 'past_due';
  const isCanceled = ['canceled', 'unpaid', 'incomplete_expired'].includes(subscriptionStatus);

  const redirectToCheckout = async (priceId: string) => {
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      toast.error('Failed to start checkout process');
    }
  };

  const manageSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast.error('Failed to open customer portal');
    }
  };

  return {
    subscriptionStatus,
    planName,
    isActive,
    isPastDue,
    isCanceled,
    redirectToCheckout,
    manageSubscription,
  };
}
