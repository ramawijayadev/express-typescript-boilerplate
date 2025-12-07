import { rbacPolicy } from "./policy";

import type { AccessControl, Action, Resource, Role } from "./types";

/**
 * Service responsible for evaluating access permissions against the defined policy.
 * Implements a Policy-Based Access Control (PBAC) strategy.
 */
export class AclService implements AccessControl {
  private readonly policy = rbacPolicy;

  /**
   * Evaluates permissions based on the provided roles.
   * Checks for global wildcards ('all'), resource wildcards ('*'), and action-specific grants.
   * Grants access if ANY of the user's roles allow the action.
   */
  can(roles: Role[], resource: Resource, action: Action): boolean {
    for (const role of roles) {
      const rolePermissions = this.policy[role];
      if (!rolePermissions) continue;

      if (rolePermissions.all === "*") return true;

      const resourcePermissions = rolePermissions[resource];
      if (!resourcePermissions) continue;

      if (resourcePermissions === "*") return true;

      if (Array.isArray(resourcePermissions)) {
        if (resourcePermissions.includes("manage") || resourcePermissions.includes(action)) {
          return true;
        }
      }
    }

    return false;
  }
}
