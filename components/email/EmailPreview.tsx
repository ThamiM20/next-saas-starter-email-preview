'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Forward } from 'lucide-react';

type Email = {
  id: string;
  subject: string;
  from: string;
  to: string[];
  date: Date;
  html: string;
  text: string;
  hasAttachments: boolean;
};

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type EmailPreviewProps = {
  email: Email | null;
  onForward: (emailId: string) => Promise<void>;
  isForwarding: boolean;
};

export function EmailPreview({ email, onForward, isForwarding }: EmailPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!email) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Select an email to preview</p>
      </div>
    );
  }

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto',
  };

  const deviceFrames = {
    desktop: 'rounded-lg',
    tablet: 'rounded-[20px] border-8 border-black',
    mobile: 'rounded-[40px] border-8 border-black h-[600px] overflow-y-auto',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{email.subject || 'No Subject'}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onForward(email.id)}
              disabled={isForwarding}
            >
              <Forward className="h-4 w-4 mr-2" />
              {isForwarding ? 'Forwarding...' : 'Forward'}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>From: {email.from}</p>
          <p>To: {email.to.join(', ')}</p>
          <p>Date: {new Date(email.date).toLocaleString()}</p>
          {email.hasAttachments && <p className="text-blue-600">Has Attachments</p>}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'source')}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((d) => (
                    <Button
                      key={d}
                      variant={device === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDevice(d)}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Button>
                  ))}
                </div>
                
                <div className={`${deviceSizes[device]} ${deviceFrames[device]} overflow-hidden bg-white`}>
                  {isMounted && (
                    <iframe
                      srcDoc={email.html || `<pre>${email.text}</pre>`}
                      className="w-full h-[600px] border-0"
                      title="Email Preview"
                    />
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'source' && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
                <pre>{email.html || email.text}</pre>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
