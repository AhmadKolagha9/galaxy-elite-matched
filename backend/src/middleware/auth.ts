import type { RequestHandler } from "express";

import { buildPrincipalFromJwtPayload } from "../auth/profile.js";
import { verifyAppJwt } from "../auth/jwt.js";
import { env } from "../config/env.js";
import { normalizeRole, type UserRole } from "../domain/status.js";
import { unauthorized } from "../http/errors.js";

const readBearer = (header: string | undefined) => {
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
};

const parseDevRoles = (value: string | undefined): UserRole[] => {
  const roles = (value ?? "user")
    .split(",")
    .map((role) => normalizeRole(role.trim()))
    .filter(Boolean);
  return Array.from(new Set<UserRole>(roles.length ? roles : ["user"]));
};

const servicePrincipal = () => ({
  id: "00000000-0000-0000-0000-000000000000",
  email: "service@galaxy-elite.local",
  roles: ["super_admin" as const],
  primaryRole: "super_admin" as const,
  verificationLevel: "verified",
  isServiceAccount: true
});

export const optionalAuth: RequestHandler = async (request, _response, next) => {
  try {
    const internalKey = request.header("x-internal-api-key");
    if (env.internalApiKey && internalKey === env.internalApiKey) {
      request.user = servicePrincipal();
      return next();
    }

    const token = readBearer(request.header("authorization"));
    if (token && env.authJwtSecret) {
      const payload = verifyAppJwt(token, env.authJwtSecret);
      request.user = buildPrincipalFromJwtPayload(payload);
      return next();
    }

    if (token && !env.authJwtSecret) {
      return next(unauthorized("AUTH_JWT_SECRET is required to verify backend bearer tokens."));
    }

    if (env.enableDevAuth && request.header("x-dev-user-id")) {
      const roles = parseDevRoles(request.header("x-dev-roles"));
      request.user = {
        id: String(request.header("x-dev-user-id")),
        email: request.header("x-dev-user-email") ?? undefined,
        roles,
        primaryRole: roles[0] ?? "user",
        verificationLevel: request.header("x-dev-verification-level") ?? "unverified"
      };
    }

    return next();
  } catch {
    return next(unauthorized("Invalid or expired backend bearer token."));
  }
};

export const requireAuth: RequestHandler = (request, _response, next) => {
  if (!request.user) return next(unauthorized());
  return next();
};

