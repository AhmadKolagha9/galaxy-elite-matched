import type { RequestHandler } from "express";

import { hasAnyRole, type UserRole } from "../domain/status.js";
import { forbidden, unauthorized } from "../http/errors.js";

export const requireAnyRole = (...roles: UserRole[]): RequestHandler => (request, _response, next) => {
  if (!request.user) return next(unauthorized());
  if (hasAnyRole(request.user.roles, roles)) return next();
  return next(forbidden(`Requires one of these roles: ${roles.join(", ")}.`));
};

export const requireAllRoles = (...roles: UserRole[]): RequestHandler => (request, _response, next) => {
  if (!request.user) return next(unauthorized());
  if (roles.every((role) => request.user!.roles.includes(role))) return next();
  return next(forbidden(`Requires all of these roles: ${roles.join(", ")}.`));
};

export const requireVerifiedProfile: RequestHandler = (request, _response, next) => {
  if (!request.user) return next(unauthorized());
  if (["verified", "basic_checked", "documents_submitted"].includes(request.user.verificationLevel)) return next();
  return next(forbidden("Verified profile required."));
};

export const requireAdmin = requireAnyRole("admin", "super_admin");
export const requireAdminOrCompliance = requireAnyRole("admin", "compliance", "super_admin");
export const requireCompliance = requireAnyRole("compliance", "super_admin");
export const requireSuperAdmin = requireAnyRole("super_admin");
