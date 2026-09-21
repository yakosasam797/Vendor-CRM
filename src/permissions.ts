export type OrgRole = "Owner" | "Admin" | "Member";

export type VendorPermission =
  | "vendor.view"
  | "vendor.add"
  | "vendor.edit"
  | "vendor.deactivate"
  | "vendor.archive"
  | "vendor.manage_access";

const ROLE_PERMISSIONS: Record<OrgRole, ReadonlySet<VendorPermission>> = {
  Owner: new Set([
    "vendor.view",
    "vendor.add",
    "vendor.edit",
    "vendor.deactivate",
    "vendor.archive",
    "vendor.manage_access",
  ]),
  Admin: new Set([
    "vendor.view",
    "vendor.add",
    "vendor.edit",
    "vendor.deactivate",
  ]),
  Member: new Set(["vendor.view"]),
};

export function can(role: OrgRole, permission: VendorPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(role: OrgRole, permission: VendorPermission): void {
  if (!can(role, permission)) {
    throw new ForbiddenError(`403 Forbidden — missing ${permission}`);
  }
}
