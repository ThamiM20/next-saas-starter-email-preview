const ALLOWED_FILE_TYPES = [
  'message/rfc822', // .eml
  'application/vnd.ms-outlook', // .msg
  'application/vnd.ms-outlook-pst', // .pst
  'application/mbox', // .mbox
  'text/html', // .html, .htm
  'text/plain' // .txt
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(file: File, allowedTypes: string[] = ALLOWED_FILE_TYPES): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size <= maxSize;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileTypeFromExtension(extension: string): string {
  const extensionMap: Record<string, string> = {
    'eml': 'message/rfc822',
    'msg': 'application/vnd.ms-outlook',
    'pst': 'application/vnd.ms-outlook-pst',
    'mbox': 'application/mbox',
    'html': 'text/html',
    'htm': 'text/html',
    'txt': 'text/plain'
  };
  
  return extensionMap[extension] || 'application/octet-stream';
}

export function validateEmailFile(file: File): { isValid: boolean; error?: string } {
  if (!validateFileType(file)) {
    return {
      isValid: false,
      error: `Unsupported file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  if (!validateFileSize(file)) {
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { isValid: true };
}
