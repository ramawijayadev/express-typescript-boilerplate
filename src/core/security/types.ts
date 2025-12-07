/**
 * Represents the distinct roles available in the system.
 */
export type Role = "admin" | "user";

/**
 * Represents the system resources that can be accessed or manipulated.
 * 'all' is a reserved keyword for global permissions.
 */
export type Resource = "all" | "users" | "jobs" | "examples" | "auth";

/**
 * Represents the actions that can be performed on a resource.
 * 'manage' is a reserved keyword that implies all actions.
 */
export type Action = "create" | "read" | "update" | "delete" | "manage";

/**
 * Contract for the Access Control mechanism.
 * Decouples the enforcement logic from the specific implementation (RBAC/PBAC/ABAC).
 */
export interface AccessControl {
  /**
   * Determines if a set of roles has permission to perform a specific action on a resource.
   *
   * @param roles - The list of roles assigned to the user.
   * @param resource - The target resource being accessed.
   * @param action - The action being attempted.
   * @returns `true` if permission is granted, `false` otherwise.
   */
  can(roles: Role[], resource: Resource, action: Action): boolean;
}

/**
 * Structure for defining permissions.
 * Maps Roles -> Resources -> Allowed Actions.
 * Using '*' indicates a wildcard permission.
 */
export type PermissionPolicy = Record<Role, Partial<Record<Resource, Action[] | "*">>>;
