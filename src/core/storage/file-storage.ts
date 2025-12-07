export interface FileStorage {
  upload(key: string, body: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

import { logger } from "@/core/logging/logger";

/**
 * Local file storage implementation (Default for Dev).
 */
export class LocalFileStorage implements FileStorage {
  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    logger.info({ key, size: body.length, contentType }, "[LocalFileStorage] Uploading file");
    return `http://localhost:3000/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    logger.info({ key }, "[LocalFileStorage] Deleting file");
  }

  getUrl(key: string): string {
    return `http://localhost:3000/uploads/${key}`;
  }
}
