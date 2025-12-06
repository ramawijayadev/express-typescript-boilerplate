/**
 * Primitive Role types based on Convention.
 */
export type Role = 'admin' | 'user';

/**
 * Interface for Access Control Logic (RBAC).
 * Determines if a user can perform an action on a resource.
 */
export interface IAccessControl {
  /**
   * Check if a user with given roles can perform the action.
   * @param roles - List of roles the user has.
   * @param resource - The resource identifier (e.g., 'user', 'post').
   * @param action - The action (e.g., 'create', 'read', 'update', 'delete').
   */
  can(roles: Role[], resource: string, action: string): boolean;
}

export const accessControl: IAccessControl = {
  can(roles, _resource, _action) {
    if (roles.includes('admin')) {
      return true; // Admin can do anything
    }
    // TODO: Implement fine-grained permission logic
    return false;
  },
};
