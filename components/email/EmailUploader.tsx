'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export function EmailUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch('/api/email/process', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process email');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      toast.success('Email processed successfully', {
        description: `Processed email from ${data.data?.email?.from || 'unknown sender'}`,
      });

      // Handle successful upload (e.g., redirect or update state)
      if (data.data?.id) {
        window.location.href = `/dashboard/email/preview/${data.data.id}`;
      }
      
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Error processing email', {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'message/rfc822': ['.eml'],
      'application/vnd.ms-outlook': ['.msg'],
      'application/vnd.ms-outlook-pst': ['.pst'],
      'application/mbox': ['.mbox'],
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt'],
    },
    disabled: isUploading,
    multiple: false,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
        transition-colors
      `}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">Processing email...</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      ) : isDragActive ? (
        <p className="text-muted-foreground">Drop the email file here...</p>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Drag & drop an email file here, or click to select
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: .eml, .msg, .pst, .mbox, .html, .txt
          </p>
        </div>
      )}
    </div>
  );
}
