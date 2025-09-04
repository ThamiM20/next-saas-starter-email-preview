'use client';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Subscription Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your subscription was not completed. You have not been charged.
        </p>
        <div className="space-y-3">
          <Button onClick={() => window.location.href = '/pricing'}>
            Back to Pricing
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
