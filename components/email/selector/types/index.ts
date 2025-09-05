import { Email } from '../..';

export interface EmailListProps {
  emails: Email[];
  selectedEmails: string[];
  onSelectEmail: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDeleteSelected: () => void;
  onMarkAsRead: (read: boolean) => void;
  onMoveToFolder: (folderId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export interface EmailFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: string, value: any) => void;
  activeFilter: string;
  availableFolders: Array<{ id: string; name: string; count: number }>;
}

export interface UseEmailListProps {
  initialEmails?: Email[];
  pageSize?: number;
}

export interface UseEmailListReturn {
  emails: Email[];
  selectedEmails: string[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  selectEmail: (id: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  deleteSelected: () => Promise<void>;
  markAsRead: (read: boolean) => Promise<void>;
  moveToFolder: (folderId: string) => Promise<void>;
  applyFilters: (filters: Record<string, any>) => void;
}
