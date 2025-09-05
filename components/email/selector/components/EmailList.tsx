import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Mail, Trash2, Star, Archive, Tag, MoreVertical } from 'lucide-react';
import { Email } from '../../..';
import { EmailListProps } from '../types';

export function EmailList({
  emails,
  selectedEmails,
  onSelectEmail,
  onDeleteSelected,
  loading = false,
  error = null,
}: EmailListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading emails: {error}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No emails found</h3>
        <p className="text-muted-foreground text-sm">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      <div className="p-2 flex items-center space-x-2 bg-muted/50">
        <Checkbox
          checked={selectedEmails.length > 0 && selectedEmails.length === emails.length}
          onCheckedChange={(checked) => onSelectEmail('all', !!checked)}
          aria-label="Select all emails"
        />
        {selectedEmails.length > 0 ? (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onDeleteSelected()}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
            <Button variant="ghost" size="sm">
              <Tag className="h-4 w-4 mr-1" />
              Label
            </Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {emails.length} message{emails.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {emails.map((email) => (
        <div
          key={email.id}
          className={`flex items-start p-4 hover:bg-muted/50 cursor-pointer ${
            selectedEmails.includes(email.id) ? 'bg-muted/30' : ''
          }`}
        >
          <div className="flex items-start w-full">
            <div className="flex items-center mr-4">
              <Checkbox
                checked={selectedEmails.includes(email.id)}
                onCheckedChange={(checked) => onSelectEmail(email.id, !!checked)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${email.subject || 'email'}`}
              />
              <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
                <Star className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">
                  {email.from}
                </h3>
                <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {format(new Date(email.date), 'MMM d, yyyy')}
                </div>
              </div>
              <h4 className="font-medium truncate">
                {email.subject || '(No subject)'}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {email.body.substring(0, 100)}
                {email.body.length > 100 ? '...' : ''}
              </p>
              {email.labels && email.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {email.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
