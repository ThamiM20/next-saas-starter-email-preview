'use client';

import { SessionProvider, signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession as useNextAuthSession, getSession as getNextAuthSession } from 'next-auth/react';
import type { Session } from 'next-auth';

export { SessionProvider };

export const useSession = () => {
  return useNextAuthSession();
};

export const getSession = async () => {
  try {
    return await getNextAuthSession();
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const signIn = async (provider?: string, options?: any) => {
  try {
    return await nextAuthSignIn(provider, {
      ...options,
      callbackUrl: options?.callbackUrl || '/dashboard',
    });
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await nextAuthSignOut({
      callbackUrl: '/sign-in',
      redirect: true,
    });
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};
