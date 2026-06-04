export const approvalStatuses = [
  "draft",
  "pending_review",
  "documents_requested",
  "under_verification",
  "compliance_hold",
  "approved",
  "rejected",
  "archived"
] as const;

export const publicStatuses = ["hidden", "open", "matching", "matched", "archived"] as const;

export const verificationStatuses = [
  "unverified",
  "basic_checked",
  "documents_submitted",
  "under_review",
  "verified",
  "failed",
  "expired"
] as const;

export const userRoles = [
  "user",
  "buyer",
  "tenant",
  "investor",
  "owner",
  "landlord",
  "developer",
  "agent",
  "property_manager",
  "representative",
  "corporate_client",
  "family_office",
  "admin",
  "compliance",
  "super_admin"
] as const;

export type ApprovalStatus = (typeof approvalStatuses)[number];
export type PublicStatus = (typeof publicStatuses)[number];
export type VerificationStatus = (typeof verificationStatuses)[number];
export type UserRole = (typeof userRoles)[number];

const roleSet = new Set<string>(userRoles);

export const isUserRole = (role: string): role is UserRole => roleSet.has(role);
export const normalizeRole = (role: string | undefined): UserRole => (role && isUserRole(role) ? role : "user");
export const highPrivilegeRoles = ["admin", "compliance", "super_admin"] as const;
export const adminDecisionRoles = ["admin", "super_admin"] as const;
export const complianceDecisionRoles = ["compliance", "super_admin"] as const;

export const isPlatformStaffRole = (role: string) => highPrivilegeRoles.includes(role as never);
export const hasAnyRole = (roles: readonly string[], allowed: readonly string[]) => roles.some((role) => allowed.includes(role));
export const canReviewSubmissions = (roles: readonly string[]) => hasAnyRole(roles, adminDecisionRoles);
export const canReviewDocuments = (roles: readonly string[]) => hasAnyRole(roles, complianceDecisionRoles);
export const canManageTaxonomy = (roles: readonly string[]) => roles.includes("super_admin");
