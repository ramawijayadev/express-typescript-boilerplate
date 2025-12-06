/**
 * Interface for File Storage operations.
 * Allows switching between Local and S3/Object Storage.
 */
export interface IFileStorage {
  /**
   * Upload a file buffer to storage.
   * @param key - The unique path/key for the file.
   * @param body - The file content buffer.
   * @param contentType - MIME type.
   * @returns The public URL of the uploaded file.
   */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;

  /**
   * Delete a file from storage.
   * @param key - The unique path/key of the file to delete.
   */
  delete(key: string): Promise<void>;

  /**
   * Get the public URL for a given key.
   * @param key - The unique path/key.
   */
  getUrl(key: string): string;
}

import { logger } from "@/core/logging/logger";

/**
 * Local file storage implementation (Default for Dev).
 */
export class LocalFileStorage implements IFileStorage {
  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    // TODO: Implement actual fs.writeFile logic here
    logger.info({ key, size: body.length, contentType }, "[LocalFileStorage] Uploading file");
    return `http://localhost:3000/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement actual fs.unlink logic here
    logger.info({ key }, "[LocalFileStorage] Deleting file");
  }

  getUrl(key: string): string {
    return `http://localhost:3000/uploads/${key}`;
  }
}
