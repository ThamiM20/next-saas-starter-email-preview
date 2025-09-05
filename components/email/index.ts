// Export all email-related components and utilities
export * from "./uploader";
export * from "./selector";
export * from "./preview";

// Common types
export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string[];
  date: Date;
  body: string;
  html?: string;
  status: "draft" | "sent" | "received" | "archived";
  labels?: string[];
  hasAttachments?: boolean;
}

export interface EmailFolder {
  id: string;
  name: string;
  icon?: React.ReactNode;
  count?: number;
}
