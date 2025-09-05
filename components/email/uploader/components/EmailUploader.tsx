'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { FileText, UploadCloud } from 'lucide-react';

interface EmailUploaderProps {
  onUploadComplete?: (file: File) => void;
  className?: string;
}

export function EmailUploader({ onUploadComplete, className = '' }: EmailUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Handle file upload logic here
      if (onUploadComplete) {
        await onUploadComplete(file);
      }
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'message/rfc822': ['.eml'],
      'application/vnd.ms-outlook': ['.msg'],
      'application/vnd.ms-outlook-pst': ['.pst'],
      'application/mbox': ['.mbox'],
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-border'
      } ${className}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="space-y-2">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">Uploading...</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      ) : (
        <div className="space-y-2">
          <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the email file here'
              : 'Drag & drop an email file here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: .eml, .msg, .pst, .mbox, .html, .txt
          </p>
        </div>
      )}
    </div>
  );
}
