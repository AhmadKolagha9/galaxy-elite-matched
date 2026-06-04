import type { RequestHandler } from "express";

import { hasAnyRole, type UserRole } from "../domain/status.js";
import { forbidden, unauthorized } from "../http/errors.js";

export const requireStaffRole: RequestHandler = (request, _response, next) => {
  if (!request.user) return next(unauthorized());
  const hasRole = hasAnyRole(request.user.roles, ["admin", "compliance", "super_admin"] satisfies UserRole[]);
  if (hasRole) return next();
  return next(forbidden("Admin, compliance, or super_admin role is required."));
};
