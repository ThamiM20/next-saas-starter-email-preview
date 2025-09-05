'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Mail, Trash2 } from 'lucide-react';

type Email = {
  id: string;
  subject: string;
  from: string;
  date: Date;
  status: 'Completed' | 'Processing' | 'Failed';
  selected?: boolean;
};

type EmailListProps = {
  emails: Email[];
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
};

export function EmailList({ emails, onSelect, onDelete, onPreview }: EmailListProps) {
  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <div
          key={email.id}
          className="flex items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center space-x-4 flex-1">
            <Checkbox
              checked={email.selected}
              onCheckedChange={(checked) => onSelect(email.id, checked as boolean)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium truncate">{email.subject || 'No subject'}</p>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(email.date), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                From: {email.from}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                email.status === 'Completed' ? 'bg-green-100 text-green-800' :
                email.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {email.status}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(email.id);
                }}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(email.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
