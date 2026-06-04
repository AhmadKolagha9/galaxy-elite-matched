import type { RequestHandler } from "express";

import { buildPrincipalFromJwtPayload } from "../auth/profile.js";
import { verifyAppJwt } from "../auth/jwt.js";
import { env } from "../config/env.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { hasAnyRole, type UserRole } from "../domain/status.js";
import { forbidden, unauthorized } from "../http/errors.js";

const readBearer = (header: string | undefined) => {
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
};

const adminRoles = ["admin", "compliance", "super_admin"] satisfies UserRole[];

const servicePrincipal = (): AuthPrincipal => ({
  id: "00000000-0000-0000-0000-000000000000",
  email: "service@galaxy-elite.local",
  roles: ["super_admin"],
  primaryRole: "super_admin",
  verificationLevel: "verified",
  isServiceAccount: true
});

export const verifyClaims: RequestHandler = async (request, _response, next) => {
  try {
    const internalKey = request.header("x-internal-api-key");
    if (env.internalApiKey && internalKey === env.internalApiKey) {
      request.user = servicePrincipal();
      return next();
    }

    if (env.enableDevAuth && request.header("x-dev-user-id")) {
      const roles = String(request.header("x-dev-roles") ?? "user").split(",").map((role) => role.trim()) as UserRole[];
      if (!hasAnyRole(roles, adminRoles)) return next(forbidden("Admin, compliance, or super_admin role is required."));
      request.user = {
        id: String(request.header("x-dev-user-id")),
        email: request.header("x-dev-user-email") ?? undefined,
        roles,
        primaryRole: roles[0] ?? "admin",
        verificationLevel: request.header("x-dev-verification-level") ?? "verified"
      };
      return next();
    }

    const token = readBearer(request.header("authorization"));
    if (!token) return next(unauthorized("Backend bearer token is required for admin routes."));
    if (!env.authJwtSecret) return next(unauthorized("AUTH_JWT_SECRET is required to verify backend bearer tokens."));

    const principal = buildPrincipalFromJwtPayload(verifyAppJwt(token, env.authJwtSecret));
    if (!hasAnyRole(principal.roles, adminRoles)) return next(forbidden("Admin, compliance, or super_admin role is required."));
    request.user = principal;
    return next();
  } catch (error) {
    if (error instanceof Error && "status" in error) return next(error);
    return next(unauthorized("Invalid or expired backend bearer token."));
  }
};

