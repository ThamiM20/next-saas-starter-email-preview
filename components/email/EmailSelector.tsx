'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Mail, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface Email {
  id: string;
  title: string;
  from: string;
  dateProcessed: Date | string;
  status: 'Completed' | 'Processing' | 'Failed';
}

export function EmailSelector({ onSelect }: { onSelect: (emailId: string) => void }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/emails');
        if (response.ok) {
          const data = await response.json();
          setEmails(data);
          if (data.length > 0) {
            setSelectedEmail(data[0]);
            onSelect(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch emails:', error);
        toast.error('Failed to load emails');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen, onSelect]);

  const handleSelect = (email: Email) => {
    setSelectedEmail(email);
    onSelect(email.id);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {selectedEmail ? selectedEmail.title : 'Select email'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <ScrollArea className="max-h-[400px]">
          <div className="p-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : emails.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No emails found
              </div>
            ) : (
              emails.map((email) => (
                <button
                  key={email.id}
                  className={`w-full text-left p-3 rounded hover:bg-accent hover:text-accent-foreground transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleSelect(email)}
                >
                  <div className="font-medium truncate">{email.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    From: {email.from}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {new Date(email.dateProcessed).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      email.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      email.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {email.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
