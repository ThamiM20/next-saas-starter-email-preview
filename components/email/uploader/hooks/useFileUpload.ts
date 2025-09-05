import { useState, useCallback } from 'react';
import { UploadedFile, UploadProgress } from '../types';
import { validateEmailFile } from '../utils/fileValidation';

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    const validation = validateEmailFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return null;
    }

    const fileId = crypto.randomUUID();
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date()
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Upload progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 90); // Cap at 90% until complete
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, progress, status: 'uploading' as const }
                : f
            )
          );
        }
      };

      const uploadPromise = new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/email/process', true);
      xhr.send(formData);

      const response = await uploadPromise;
      const result = await response.json();

      // Update file status to completed
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'completed', progress: 100, url: result.url }
            : f
        )
      );

      return result;
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file');
      
      // Update file status to error
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
      
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
  }, []);

  return {
    uploadedFiles,
    isUploading,
    error,
    uploadFile,
    removeFile,
    clearFiles,
  };
}
