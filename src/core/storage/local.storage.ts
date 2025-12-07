import fs from "node:fs/promises";
import path from "node:path";

import { appConfig } from "@/config/app";
import { logger } from "@/core/logging/logger";

import type { FileStorage } from "./types";

/**
 * Local filesystem storage driver.
 * Stores files in the 'uploads' directory in the project root.
 * NOT RECOMMENDED for production (use S3/GCS instead).
 */
export class LocalFileStorage implements FileStorage {
  private readonly uploadDir = "uploads";
  private readonly baseUrl: string;

  constructor() {
    // Best effort base URL detection. In prod, this should be an env var like ASSET_URL.
    const port = appConfig.port || 3000;
    this.baseUrl = `http://localhost:${port}/${this.uploadDir}`;

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // Ignore if exists
    }
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    const filePath = path.join(this.uploadDir, key);

    // Ensure parent folder exists (e.g. uploads/users/)
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    await fs.writeFile(filePath, body);

    logger.info({ key, size: body.length, contentType }, "[LocalFileStorage] File uploaded");

    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filePath);
      logger.info({ key }, "[LocalFileStorage] File deleted");
    } catch (err) {
      logger.warn({ key, err }, "[LocalFileStorage] Delete failed (file might not exist)");
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
