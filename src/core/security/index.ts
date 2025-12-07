import { AclService } from "./acl.service";

export * from "./types";

/**
 * Singleton instance of the Access Control Service.
 * Serves as the central point for permission enforcement across the application.
 */
export const accessControl = new AclService();
