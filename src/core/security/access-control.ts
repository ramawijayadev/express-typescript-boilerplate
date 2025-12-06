/**
 * Primitive Role types based on Convention.
 */
export type Role = "admin" | "user";

/**
 * Interface for Access Control Logic (RBAC).
 */
export interface AccessControl {
  /**
   * Check if a user with given roles can perform the action.
   */
  can(roles: Role[], resource: string, action: string): boolean;
}

export const accessControl: AccessControl = {
  can(roles, _resource, _action) {
    if (roles.includes("admin")) {
      return true;
    }
    // TODO: Implement fine-grained permission logic
    return false;
  },
};
