'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('AuthProvider - Session status:', status);
    if (session) {
      console.log('AuthProvider - User session:', {
        id: session.user?.id,
        email: session.user?.email,
        expires: session.expires
      });
    }
  }, [session, status]);

  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
