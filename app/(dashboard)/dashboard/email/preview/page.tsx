'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Copy, Check, Smartphone, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { EmailUploader } from "@/components/email/EmailUploader";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DeviceSelector } from "@/components/DeviceSelector";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailPreviewPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("upload");
  const [isCopied, setIsCopied] = useState(false);
  const [forwardingEmail, setForwardingEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['desktop']);

  const hasActiveSubscription = subscriptionStatus === 'active';

  // Check user's subscription status and get/create forwarding email
  useEffect(() => {
    if (status === 'loading') return;

    const initializeEmailForwarding = async () => {
      setIsLoading(true);
      try {
        // First, check subscription status
        const subResponse = await fetch('/api/user/subscription', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        });

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscriptionStatus(subData.status);
          
          if (subData.status !== 'active') {
            setIsLoading(false);
            return; // Don't proceed with email setup for non-subscribers
          }
        }

        // Check for existing forwarding email
        const existingResponse = await fetch('/api/email/forwarding', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (existingResponse.ok) {
          const data = await existingResponse.json();
          if (data?.email) {
            setForwardingEmail(data.email);
            setIsLoading(false);
            return;
          }
        }
        
        // Generate new forwarding email for active subscribers
        const generateResponse = await fetch('/api/email/generate-address', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!generateResponse.ok) {
          const error = await generateResponse.json().catch(() => ({}));
          throw new Error('Failed to generate email address');
        }
        
        const newEmailData = await generateResponse.json();
        setForwardingEmail(newEmailData.email);
      } catch (error) {
        console.error('Email forwarding error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`Failed to set up email forwarding: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeEmailForwarding();
  }, [status]);



  const handleCopyEmail = () => {
    if (!forwardingEmail) return;
    navigator.clipboard.writeText(forwardingEmail);
    setIsCopied(true);
    toast.success('Email address copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Alias for backward compatibility with existing code
  const copyToClipboard = handleCopyEmail;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Required</AlertTitle>
          <AlertDescription>
            You need an active subscription to use email forwarding features.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Get access to email forwarding and other premium features by upgrading your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/pricing">
              <Button>View Plans</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Email Preview</h2>
            <p className="text-muted-foreground">
              Test how your email renders across different devices
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Test on:</span>
              <DeviceSelector 
                defaultValue={selectedDevices}
                onSelectionChange={(devices) => {
                  setSelectedDevices(devices.map(d => d.value));
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs 
        defaultValue="upload" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "upload" | "forward")}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload email
          </TabsTrigger>
          <TabsTrigger value="forward">
            <Mail className="w-4 h-4 mr-2" />
            Provide Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload email</CardTitle>
              <CardDescription>
                Upload your email file to preview how it will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailUploader />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forward" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Provide Email</CardTitle>
              <CardDescription>
                Forward your email to the address below to preview it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-lg items-center gap-1.5">
                <Label>Your unique forwarding address</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type="email"
                      value={forwardingEmail}
                      readOnly
                      className="pr-10 font-mono"
                      placeholder="Generating your address..."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={copyToClipboard}
                      disabled={!forwardingEmail}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Send your email to this address to preview it. Make sure to send from your registered email address.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
