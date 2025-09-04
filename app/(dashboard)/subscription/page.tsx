'use client';

import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

export default function SubscriptionPage() {
  const { isActive, isPastDue, isCanceled, manageSubscription } = useSubscription();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        <div className="space-y-6">
          <SubscriptionStatus />

          {(isActive || isPastDue) && (
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Update your payment method or view your billing history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={manageSubscription}
                  disabled={isCanceled}
                  className="w-full sm:w-auto"
                >
                  {isCanceled ? (
                    'Subscription Canceled'
                  ) : (
                    'Manage Billing'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {!isActive && !isPastDue && !isCanceled && (
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Subscribe to a plan to unlock all features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={manageSubscription}
                  className="w-full sm:w-auto"
                >
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
