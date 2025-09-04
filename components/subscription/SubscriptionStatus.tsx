'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Clock, XCircle, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface TeamSubscription {
  id: number;
  name: string;
  subscriptionStatus: string | null;
  planName: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export function SubscriptionStatus() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [teamSubscription, setTeamSubscription] = useState<TeamSubscription | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/subscription');
        if (!response.ok) throw new Error('Failed to fetch subscription');
        
        const data = await response.json();
        
        setTeamSubscription({
          id: data.teamId,
          name: data.teamName || 'Your Team',
          subscriptionStatus: data.status,
          planName: data.planName,
          stripeCustomerId: null,
          stripeSubscriptionId: null
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [session?.user?.id]);

  const subscriptionStatus = teamSubscription?.subscriptionStatus || 'inactive';
  const planName = teamSubscription?.planName || 'Free';
  const teamName = teamSubscription?.name || 'Your Team';
  const isActive = subscriptionStatus === 'active';
  const isPastDue = subscriptionStatus === 'past_due';
  const isCanceled = ['canceled', 'unpaid', 'incomplete_expired'].includes(subscriptionStatus);

  const getStatusIcon = () => {
    if (isActive) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (isPastDue) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (isCanceled) return <XCircle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isActive) return 'Active';
    if (isPastDue) return 'Payment Required';
    if (isCanceled) return subscriptionStatus === 'unpaid' ? 'Payment Failed' : 'Canceled';
    return 'Inactive';
  };

  const handleManageBilling = async () => {
    if (!teamSubscription) {
      toast.error('No team subscription found');
      return;
    }

    setIsManagingBilling(true);

    try {
      const response = await fetch('/api/subscription/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const data = await response.json();
      
      if (!data?.url) throw new Error('No URL returned from server');
      
      window.location.href = data.url;
    } catch (error) {
      console.error('Error managing billing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open customer portal');
    } finally {
      setIsManagingBilling(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
        <CardDescription>
          Manage your team's subscription and billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{teamName}</h3>
              <p className="text-sm text-muted-foreground">Team Plan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Current Plan</h4>
                <p className="text-sm text-muted-foreground">
                  {planName} Plan
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span className="text-sm font-medium">
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>

            {isPastDue && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Payment Required</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your team's subscription is past due. Please update your payment method to avoid service interruption.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(isCanceled || subscriptionStatus === 'unpaid') && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      {subscriptionStatus === 'unpaid' ? 'Payment Failed' : 'Subscription Canceled'}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        {subscriptionStatus === 'unpaid 
                          ? 'The payment for your team subscription failed. Please update your payment method to continue.'
                          : 'Your team subscription has been canceled. You\'ll continue to have access until the end of your billing period.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 md:flex-row md:justify-between md:space-x-0 md:space-y-0">
        {isActive || isPastDue ? (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={isManagingBilling}
            className="w-full md:w-auto"
          >
            {isManagingBilling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Billing'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleUpgrade} 
            className="w-full md:w-auto"
          >
            Upgrade Team Plan
          </Button>
        )}
        
        {isActive && (
          <p className="text-sm text-muted-foreground text-center md:text-right w-full md:w-auto">
            Next billing date: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
