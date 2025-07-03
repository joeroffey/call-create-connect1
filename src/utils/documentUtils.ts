import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a public URL for a completion document file
 * @param filePath - The file path in storage
 * @returns The public URL for the document
 */
export const getCompletionDocumentUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('project-completion-documents')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if a file type is an image
 * @param fileType - MIME type of the file
 * @returns True if the file is an image
 */
export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

/**
 * Get file extension from MIME type
 * @param fileType - MIME type of the file
 * @returns File extension or 'FILE' as fallback
 */
export const getFileExtension = (fileType: string): string => {
  const extension = fileType.split('/')[1];
  return extension ? extension.toUpperCase() : 'FILE';
};