import { LocalFileStorage } from "./local.storage";

import type { FileStorage } from "./types";

export * from "./types";

/**
 * Singleton Instance Factory.
 * Currently defaults to Local Storage, but ready for S3 switch.
 */
export const fileStorage: FileStorage = new LocalFileStorage();
