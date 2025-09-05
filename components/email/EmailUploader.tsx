'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { FileText, UploadCloud } from 'lucide-react';

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
        throw new Error('Upload failed');
      }

      setUploadProgress(100);
      // Handle successful upload
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
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
      }`}
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
