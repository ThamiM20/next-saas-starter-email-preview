import { useState, useCallback, useEffect } from 'react';
import { Email } from '../..';
import { forwardEmail } from '../services/emailForwardingService';

interface UseEmailPreviewProps {
  emailId: string | null;
  onError?: (error: Error) => void;
}

export function useEmailPreview({ emailId, onError }: UseEmailPreviewProps) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmail = useCallback(async () => {
    if (!emailId) {
      setEmail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would fetch the email from your API
      // const response = await fetch(`/api/emails/${emailId}`);
      // if (!response.ok) throw new Error('Failed to fetch email');
      // const data = await response.json();
      
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockEmail: Email = {
        id: emailId,
        subject: 'Sample Email',
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        date: new Date().toISOString(),
        body: 'This is a sample email body.',
        html: '<p>This is a sample email body.</p>',
        status: 'received',
        labels: ['inbox'],
        hasAttachments: false,
      };
      
      setEmail(mockEmail);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch email');
      setError(error.message);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [emailId, onError]);

  // Load email when emailId changes
  useEffect(() => {
    fetchEmail();
  }, [fetchEmail]);

  const handleForward = useCallback(async (to: string) => {
    if (!emailId) return false;
    
    setIsForwarding(true);
    setError(null);

    try {
      // In a real app, you would get the current user's ID from your auth context
      const userId = 'current-user-id';
      await forwardEmail(emailId, userId, to);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to forward email');
      setError(error.message);
      onError?.(error);
      return false;
    } finally {
      setIsForwarding(false);
    }
  }, [emailId, onError]);

  const handleReply = useCallback(async (replyAll = false) => {
    if (!emailId) return false;
    
    setIsReplying(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Replying to email ${emailId}`, { replyAll });
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send reply');
      setError(error.message);
      onError?.(error);
      return false;
    } finally {
      setIsReplying(false);
    }
  }, [emailId, onError]);

  const handleDelete = useCallback(async () => {
    if (!emailId) return false;
    
    setIsDeleting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmail(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete email');
      setError(error.message);
      onError?.(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [emailId, onError]);

  const refresh = useCallback(() => {
    return fetchEmail();
  }, [fetchEmail]);

  return {
    email,
    loading,
    error,
    isForwarding,
    isReplying,
    isDeleting,
    refresh,
    forwardEmail: handleForward,
    replyToEmail: handleReply,
    deleteEmail: handleDelete,
  };
}
