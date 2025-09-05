import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Paperclip, 
  Download, 
  Reply, 
  ReplyAll, 
  Trash2,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DevicePreview } from './DevicePreview';
import { ForwardButton } from './ForwardButton';
import type { EmailPreviewProps } from '../types';

export function EmailPreview({
  email,
  onForward,
  onReply,
  onDelete,
  className = '',
  isForwarding = false,
  isReplying = false,
  isDeleting = false,
}: EmailPreviewProps) {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!email) {
    return (
      <div className={cn("flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/20", className)}>
        <div className="text-center space-y-2 p-6">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">No email selected</h3>
          <p className="text-sm text-muted-foreground">
            Select an email to preview its contents
          </p>
        </div>
      </div>
    );
  }

  const handleForward = async () => {
    if (onForward) {
      await onForward(email.id);
    }
  };

  const handleReply = (replyAll = false) => {
    if (onReply) {
      onReply(email.id, replyAll);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(email.id);
    }
  };

  const renderEmailContent = () => {
    if (activeTab === 'source') {
      return (
        <pre className="p-4 bg-gray-900 text-gray-100 rounded text-xs overflow-auto">
          {email.html || email.body}
        </pre>
      );
    }

    if (email.html) {
      return (
        <div 
          className="prose max-w-none p-4"
          dangerouslySetInnerHTML={{ __html: email.html }} 
        />
      );
    }

    return (
      <div className="whitespace-pre-wrap p-4">
        {email.body}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{email.subject || '(No subject)'}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReply()}
            disabled={isReplying}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReply(true)}
            disabled={isReplying}
          >
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <ForwardButton
            onClick={handleForward}
            isForwarding={isForwarding}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-t-lg">
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{email.from}</h3>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(email.date), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                to: {email.to.join(', ')}
              </div>
            </div>
            {email.hasAttachments && (
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
          
          {email.labels && email.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {email.labels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'preview' | 'source')}
          className="flex-1 flex flex-col"
        >
          <div className="border-b px-4">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="preview" 
                className="relative px-4 py-2 h-auto data-[state=active]:shadow-none"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="source" 
                className="relative px-4 py-2 h-auto data-[state=active]:shadow-none"
              >
                Source
              </TabsTrigger>
              <div className="ml-auto flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveDevice('mobile')}
                  className={cn(
                    'h-8 w-8 p-0',
                    activeDevice === 'mobile' ? 'bg-muted' : ''
                  )}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveDevice('tablet')}
                  className={cn(
                    'h-8 w-8 p-0',
                    activeDevice === 'tablet' ? 'bg-muted' : ''
                  )}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveDevice('desktop')}
                  className={cn(
                    'h-8 w-8 p-0',
                    activeDevice === 'desktop' ? 'bg-muted' : ''
                  )}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </TabsList>
          </div>
          
          <TabsContent value="preview" className="mt-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                <DevicePreview device={activeDevice}>
                  {isMounted && renderEmailContent()}
                </DevicePreview>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="source" className="mt-0 flex-1 overflow-auto">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                {renderEmailContent()}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
