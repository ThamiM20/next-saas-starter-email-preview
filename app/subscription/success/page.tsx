'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscriptionSuccess() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a session_id in the URL
    const sessionIdParam = searchParams.get('session_id');
    
    if (!sessionIdParam) {
      setError('No session ID found in URL');
      setIsLoading(false);
      return;
    }

    setSessionId(sessionIdParam);
    
    // Here you would typically verify the session with your backend
    // and update the user's subscription status
    const verifySession = async () => {
      try {
        const response = await fetch('/api/subscription/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: sessionIdParam }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify subscription');
        }

        // Refresh the session to get the latest subscription status
        await fetch('/api/auth/session?update', { method: 'POST' });
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('Failed to verify your subscription. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
              Back to Pricing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Subscription Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for subscribing to our service. Your subscription is now active.
        </p>
        <div className="space-y-3">
          <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/subscription'}>
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
