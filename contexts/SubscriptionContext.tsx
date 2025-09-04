'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionContextType {
  subscriptionStatus: string;
  planName: string;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  redirectToCheckout: (priceId: string) => Promise<void>;
  manageSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscription = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscriptionContext must be used within a SubscriptionProvider'
    );
  }
  return context;
}
