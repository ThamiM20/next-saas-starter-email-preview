'use client';

import { Session } from 'next-auth';
import { TeamWithSubscription } from '@/lib/db/schema';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

type ClientProvidersProps = {
  children: ReactNode;
  session: Session | null;
  teamData: TeamWithSubscription | null;
};

export function ClientProviders({ 
  children, 
  session: initialSession, 
  teamData: initialTeamData 
}: ClientProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider session={initialSession}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SubscriptionProvider>
            <SWRConfig
              value={{
                fallback: {
                  '/api/team': initialTeamData,
                },
              }}
            >
              {children}
              <Toaster />
            </SWRConfig>
          </SubscriptionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
