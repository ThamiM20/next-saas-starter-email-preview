import { Session } from 'next-auth';

export const checkSubscription = (session: Session | null) => {
  return session?.user?.subscriptionStatus === 'active';
};

export const requireActiveSubscription = (session: Session | null) => {
  if (!checkSubscription(session)) {
    throw new Error('Active subscription required');
  }
};
