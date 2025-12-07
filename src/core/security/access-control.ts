export type Role = "admin" | "user";

export interface AccessControl {
  can(roles: Role[], resource: string, action: string): boolean;
}

export const accessControl: AccessControl = {
  can(roles, _resource, _action) {
    if (roles.includes("admin")) {
      return true;
    }
    return false;
  },
};
