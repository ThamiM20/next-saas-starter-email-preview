# Email Components

This directory contains all the email-related components for the application, organized into three main sections: uploader, selector, and preview.

## Structure

```
/email
  /uploader              # Email upload functionality
    /components          # UI components
    /api                 # API routes
    /hooks               # Custom hooks
    /types               # TypeScript types
    /utils               # Utility functions

  /selector             # Email listing and selection
    /components          # UI components
    /api                 # API routes
    /hooks               # Custom hooks
    /types               # TypeScript types

  /preview              # Email preview functionality
    /components          # UI components
    /api                 # API routes
    /services            # Business logic
    /hooks               # Custom hooks
    /types               # TypeScript types
```

## Features

### Uploader
- Drag-and-drop interface for email files
- Supports multiple file formats (.eml, .msg, .pst, .mbox, .html, .txt)
- File validation and error handling
- Upload progress tracking

### Selector
- Email list with selection
- Search and filter functionality
- Bulk actions (delete, mark as read, move to folder)
- Pagination and infinite loading

### Preview
- Attachment handling
- Loading and error states
- Forward, reply, and delete actions
- Source code viewing
- Responsive device preview (desktop, tablet, mobile)
- Email content rendering with HTML and plain text support
## Usage

### Importing Components

```tsx
// Import from specific module
import { EmailUploader } from '@/components/email/uploader';
import { EmailList, EmailFilters } from '@/components/email/selector';

// Or import all email components
import { EmailUploader, EmailList, EmailFilters } from '@/components/email';
```

### Example: Email Inbox Page

```tsx
'use client';

import { useState } from 'react';
import { EmailList, EmailFilters, useEmailList } from '@/components/email';

export default function EmailInbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('inbox');
  
  const {
    emails,
    selectedEmails,
    loading,
    selectEmail,
    selectAll,
    deleteSelected,
    markAsRead,
    moveToFolder,
  } = useEmailList();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Apply search filter
  };

  const handleFilterChange = (filter: string, value: string) => {
    setActiveFilter(value);
    // Apply filter
  };

  return (
    <div className="flex flex-col h-full">
      <EmailFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
        availableFolders={[
          { id: 'inbox', name: 'Inbox', count: 42 },
          { id: 'sent', name: 'Sent', count: 23 },
          { id: 'drafts', name: 'Drafts', count: 5 },
        ]}
      />
      
      <div className="flex-1 overflow-auto">
        <EmailList
          emails={emails}
          selectedEmails={selectedEmails}
          onSelectEmail={selectEmail}
          onSelectAll={selectAll}
          onDeleteSelected={deleteSelected}
          onMarkAsRead={markAsRead}
          onMoveToFolder={moveToFolder}
          loading={loading}
        />
      </div>
    </div>
  );
}
```

## API Routes

### Uploader
- `POST /api/email/process` - Process uploaded email files

### Selector
- `GET /api/emails` - List emails with pagination and filtering
- `POST /api/emails` - Create a new email
- `PATCH /api/emails/:id` - Update an email
- `DELETE /api/emails/:id` - Delete an email

## Development

### Adding a New Component

1. Create a new directory under the appropriate section (uploader/selector/preview)
2. Add your component files following the existing structure
3. Export your component in the section's `index.ts` file
4. Update the main `index.ts` if needed

### Testing

Run the test suite:

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

### Preview Component Example



### Preview Component Example

```tsx
'use client';

import { EmailPreview, useEmailPreview } from '@/components/email/preview';

export default function EmailPreviewPage({ params }: { params: { id: string } }) {
  const { email, loading, error, isForwarding, isReplying, isDeleting, forwardEmail, replyToEmail, deleteEmail } = 
    useEmailPreview({ emailId: params.id });

  const handleForward = async (to: string) => {
    const success = await forwardEmail(to);
    if (success) {
      console.log('Email forwarded successfully');
    }
  };

  const handleReply = async (replyAll = false) => {
    const success = await replyToEmail(replyAll);
    if (success) {
      console.log('Reply initiated');
    }
  };

  const handleDelete = async () => {
    const success = await deleteEmail();
    if (success) {
      console.log('Email deleted');
      // Navigate away or update UI
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Email Preview</h1>
      <EmailPreview
        email={email}
        onForward={handleForward}
        onReply={handleReply}
        onDelete={handleDelete}
        isForwarding={isForwarding}
        isReplying={isReplying}
        isDeleting={isDeleting}
      />
    </div>
  );
}
```
