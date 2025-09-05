import { Email } from '../..';

export interface EmailPreviewProps {
  email: Email | null;
  onForward?: (emailId: string) => Promise<void> | void;
  onReply?: (emailId: string, replyAll?: boolean) => void;
  onDelete?: (emailId: string) => void;
  className?: string;
  isForwarding?: boolean;
  isReplying?: boolean;
  isDeleting?: boolean;
}

export interface DevicePreviewProps {
  children: React.ReactNode;
  device: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

export interface ForwardButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isForwarding?: boolean;
  className?: string;
}

export interface UseEmailPreviewProps {
  emailId: string | null;
  onError?: (error: Error) => void;
}

export interface UseEmailPreviewReturn {
  email: Email | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  forwardEmail: () => Promise<void>;
  replyToEmail: (replyAll?: boolean) => Promise<void>;
  deleteEmail: () => Promise<void>;
  downloadAttachments: () => Promise<void>;
}
