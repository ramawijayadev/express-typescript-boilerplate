export interface UploadedFile {
  key: string;
  url: string;
}

/**
 * Abstract contract for File Storage operations.
 * Allows switching between Local Filesystem (Dev) and Cloud Storage like S3 (Prod).
 */
export interface FileStorage {
  /**
   * Uploads a file buffer to the storage provider.
   * @param key - Unique identifier/path for the file (e.g., "users/avatar-123.jpg")
   * @param body - The file content as Buffer
   * @param contentType - MIME type of the file (e.g., "image/jpeg")
   * @returns The public URL of the uploaded file.
   */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;

  /**
   * Permanently deletes a file from storage.
   * Should not throw error if file doesn't exist (idempotent).
   */
  delete(key: string): Promise<void>;

  /**
   * Generates a public URL for accessing the file.
   */
  getUrl(key: string): string;
}
