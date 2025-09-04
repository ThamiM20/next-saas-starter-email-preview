'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // If not authenticated, redirect to sign-in
  if (status === 'unauthenticated') {
    redirect('/sign-in?callbackUrl=/subscribe');
  }

  // If already has active subscription, redirect to dashboard
  if (session?.user?.subscriptionStatus === 'active') {
    redirect('/dashboard');
  }

  const plans = [
    {
      name: 'Starter',
      id: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_xxx',
      description: 'Perfect for individuals getting started',
      price: '$9.99',
      features: [
        '10,000 emails/month',
        'Basic analytics',
        'Email support',
        '1 team member',
      ],
      cta: 'Get Started',
    },
    {
      name: 'Pro',
      id: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_yyy',
      description: 'For growing businesses',
      price: '$29.99',
      features: [
        '50,000 emails/month',
        'Advanced analytics',
        'Priority support',
        '5 team members',
        'API access',
      ],
      cta: 'Go Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      description: 'For large organizations',
      price: 'Custom',
      features: [
        'Unlimited emails',
        'Advanced analytics',
        '24/7 support',
        'Unlimited team members',
        'API access',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    if (!session?.user?.email) {
      console.error('User not authenticated');
      return;
    }

    if (priceId === 'enterprise') {
      // Handle enterprise contact form
      window.location.href = '/contact?plan=enterprise';
      return;
    }

    setIsLoading(true);
    setSelectedPlan(priceId);

    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        console.error('No session URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Select the plan that works best for you and your team.
          </p>
        </div>

        <div className="mt-12 grid gap-8 max-w-lg mx-auto md:max-w-none md:grid-cols-3 md:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular ? 'border-2 border-primary shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-lg font-medium text-gray-900 mt-2">
                  {plan.price}
                  <span className="text-base font-normal text-gray-500">
                    {plan.id !== 'enterprise' ? '/month' : ''}
                  </span>
                </CardDescription>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {isLoading && selectedPlan === plan.id ? 'Processing...' : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
