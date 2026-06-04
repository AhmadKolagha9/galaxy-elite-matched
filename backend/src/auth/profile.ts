import type { AuthPrincipal } from "../domain/submissions.js";
import { normalizeRole, type UserRole } from "../domain/status.js";

const uniqueRoles = (roles: UserRole[]): UserRole[] => Array.from(new Set<UserRole>(roles.length ? roles : ["user"]));

export const buildPrincipalFromJwtPayload = (payload: Record<string, unknown>): AuthPrincipal => {
  const rawRoles = Array.isArray(payload.roles) ? payload.roles : typeof payload.role === "string" ? [payload.role] : [];
  const roles = uniqueRoles(rawRoles.map((role) => normalizeRole(String(role))));
  const primaryRole = normalizeRole(typeof payload.primary_role === "string" ? payload.primary_role : roles[0]);
  const id = String(payload.sub ?? payload.id ?? payload.uid ?? "").trim();

  return {
    id,
    email: typeof payload.email === "string" ? payload.email : undefined,
    roles: roles.includes(primaryRole) ? roles : uniqueRoles([...roles, primaryRole]),
    primaryRole,
    verificationLevel: typeof payload.verification_level === "string" ? payload.verification_level : "unverified",
    customClaims: payload
  };
};

