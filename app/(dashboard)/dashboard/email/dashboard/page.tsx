'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Upload, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '../components/data-table';
import { columns } from '../components/columns';
import type { Email } from '../components/columns';
import { Skeleton } from '@/components/ui/skeleton';

// Status filter options
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'forwarded' },
  { label: 'Processing', value: 'received' },
  { label: 'Failed', value: 'failed' },
];

type EmailWithStringDate = Omit<Email, 'dateProcessed'> & {
  id: string;
  title: string;
  from?: string;
  to?: string[];
  dateProcessed: string;
  status: 'forwarded' | 'received' | 'failed';
};

export default function EmailDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [emails, setEmails] = useState<EmailWithStringDate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActiveSubscription = subscriptionStatus === 'active';

  // Check user's subscription status
  useEffect(() => {
    if (status === 'loading') return;

    const checkSubscription = async () => {
      try {
        const subResponse = await fetch('/api/user/subscription', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        });

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscriptionStatus(subData.status);
          
          if (subData.status === 'active') {
            fetchEmails();
          } else {
            setIsLoading(false);
          }
        } else {
          console.error('Failed to fetch subscription status');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [status]);

  const fetchEmails = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `/api/emails${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/emails/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload email');
      }
      
      toast.success('Email uploaded and is being processed');
      await fetchEmails(); // Refresh the email list
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload email');
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [fetchEmails]);

  // Handle delete email
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this email? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/emails', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete email');
        }
        
        // Refresh the email list
        await fetchEmails();
        toast.success('Email deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete email');
      }
    }
  }, [fetchEmails]);

  // Listen for delete events from the data table
  useEffect(() => {
    const handleDeleteEmail = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      handleDelete(customEvent.detail.id);
    };

    window.addEventListener('deleteEmail', handleDeleteEmail as EventListener);
    return () => {
      window.removeEventListener('deleteEmail', handleDeleteEmail as EventListener);
    };
  }, [handleDelete]);

  // Set up file input
  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;
    
    input.type = 'file';
    input.accept = '.html,.htm,.eml';
    input.style.display = 'none';

    const handleInputChange = (e: Event) => {
      handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
    };

    input.addEventListener('change', handleInputChange);
    document.body.appendChild(input);

    return () => {
      input.removeEventListener('change', handleInputChange);
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };
  }, [handleFileUpload]);

  // Load emails when component mounts or status filter changes
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Subscription Required</CardTitle>
            </div>
            <CardDescription className="pt-2">
              You need an active subscription to use email forwarding features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get access to email forwarding and other premium features by upgrading your account.
            </p>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/pricing'}
            >
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and view your processed emails
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".eml,.msg"
            className="hidden"
            id="email-upload"
          />
          <Button asChild>
            <label htmlFor="email-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> Upload Email
            </label>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processed Emails</CardTitle>
          <CardDescription>
            View and manage your processed email history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            <DataTable<Email, unknown>
              columns={columns}
              data={emails}
              searchKey="title"
              filterOptions={[
                {
                  columnId: "status",
                  title: "Status",
                  options: statusOptions.filter(opt => opt.value !== 'all').map(opt => ({
                    label: opt.label,
                    value: opt.value,
                  }))
                }
              ]}
              onFilterChange={(columnId: string, value: string) => {
                if (columnId === 'status') {
                  setStatusFilter(value);
                }
              }}
              filterValues={{
                status: statusFilter === 'all' ? undefined : statusFilter
              }}
              isLoading={isLoading}
              emptyState={
                <div className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No emails found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    {statusFilter === 'all' 
                      ? "You don't have any emails yet. Upload an email to get started."
                      : "No emails match the selected filter."}
                  </p>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
