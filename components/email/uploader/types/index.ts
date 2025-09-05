export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: string;
  uploadedAt?: Date;
}

export interface EmailUploaderProps {
  onUploadComplete?: (file: File) => Promise<void> | void;
  className?: string;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

export interface UploadProgress {
  total: number;
  loaded: number;
  percent: number;
}
