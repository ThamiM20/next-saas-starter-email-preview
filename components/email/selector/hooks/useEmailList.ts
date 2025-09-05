import { useState, useEffect, useCallback } from 'react';
import { Email } from '../../..';
import { UseEmailListProps, UseEmailListReturn } from '../types';

export function useEmailList({
  initialEmails = [],
  pageSize = 20,
}: UseEmailListProps = {}): UseEmailListReturn {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchEmails = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would fetch from your API
      // const response = await fetch(`/api/emails?page=${page}&limit=${pageSize}&${new URLSearchParams(filters)}`);
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual API call
      const mockEmails: Email[] = [];
      
      if (reset) {
        setPage(1);
        setEmails(mockEmails);
      } else {
        setEmails(prev => [...prev, ...mockEmails]);
      }
      
      setTotalPages(1); // Update based on actual total
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError('Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchEmails(true);
  }, [filters]);

  const refresh = useCallback(() => fetchEmails(true), [fetchEmails]);
  const loadMore = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const selectEmail = useCallback((id: string, selected: boolean) => {
    setSelectedEmails(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(emailId => emailId !== id)
    );
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedEmails(emails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  }, [emails]);

  const deleteSelected = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, you would call your API to delete
      // await Promise.all(selectedEmails.map(id => 
      //   fetch(`/api/emails/${id}`, { method: 'DELETE' })
      // ));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setEmails(prev => prev.filter(email => !selectedEmails.includes(email.id)));
      setSelectedEmails([]);
    } catch (err) {
      console.error('Failed to delete emails:', err);
      setError('Failed to delete emails. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedEmails]);

  const markAsRead = useCallback(async (read: boolean) => {
    try {
      setLoading(true);
      // In a real app, you would call your API to mark as read/unread
      // await fetch('/api/emails/mark-read', {
      //   method: 'PATCH',
      //   body: JSON.stringify({ ids: selectedEmails, read })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setEmails(prev =>
        prev.map(email =>
          selectedEmails.includes(email.id)
            ? { ...email, status: read ? 'read' : 'unread' }
            : email
        )
      );
      
      setSelectedEmails([]);
    } catch (err) {
      console.error('Failed to update email status:', err);
      setError('Failed to update email status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedEmails]);

  const moveToFolder = useCallback(async (folderId: string) => {
    try {
      setLoading(true);
      // In a real app, you would call your API to move to folder
      // await fetch('/api/emails/move', {
      //   method: 'PATCH',
      //   body: JSON.stringify({ ids: selectedEmails, folderId })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state - remove from current view if not in "All" folder
      if (filters.folderId && filters.folderId !== 'all') {
        setEmails(prev => prev.filter(email => !selectedEmails.includes(email.id)));
      }
      
      setSelectedEmails([]);
    } catch (err) {
      console.error('Failed to move emails:', err);
      setError('Failed to move emails. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedEmails, filters.folderId]);

  const applyFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  return {
    emails,
    selectedEmails,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    refresh,
    loadMore,
    selectEmail,
    selectAll,
    deleteSelected,
    markAsRead,
    moveToFolder,
    applyFilters,
  };
}
