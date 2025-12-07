import type { PermissionPolicy } from "./types";

/**
 * The central source of truth for Role-Based Access Control (RBAC) policies.
 * Defines which actions are permitted for each role on specific resources.
 */
export const rbacPolicy: PermissionPolicy = {
  admin: {
    all: "*",
  },
  user: {
    examples: ["read", "create", "update", "delete"],
    users: ["read", "update"],
    auth: ["read"],
  },
};
