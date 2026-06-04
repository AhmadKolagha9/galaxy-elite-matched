import bcrypt from "bcrypt";

import { signAppJwt } from "../auth/jwt.js";
import { env } from "../config/env.js";
import { withTransaction } from "../db/pool.js";
import { isPlatformStaffRole, normalizeRole, type UserRole } from "../domain/status.js";
import type { NativeUserPrivateRecord, NativeUserRecord } from "../domain/users.js";
import { badRequest, serviceUnavailable, unauthorized } from "../http/errors.js";
import { userRepository } from "../repositories/user-repository.js";

const emailPattern = /^\S+@\S+\.\S+$/;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const rolesFor = (primaryRole: UserRole) =>
  Array.from(new Set<UserRole>(primaryRole === "user" ? ["user"] : ["user", primaryRole]));

const isDuplicateKey = (error: unknown) =>
  Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY");

const requireJwtSecret = () => {
  if (!env.authJwtSecret) throw serviceUnavailable("AUTH_JWT_SECRET is required for native authentication.");
  return env.authJwtSecret;
};

const safeUser = (user: NativeUserPrivateRecord | NativeUserRecord): NativeUserRecord => {
  const { passwordHash: _passwordHash, ...record } = user as NativeUserPrivateRecord;
  return record;
};

const signUserToken = (user: NativeUserRecord) => {
  const now = Math.floor(Date.now() / 1000);
  const roles = rolesFor(user.primaryRole);
  const token = signAppJwt(
    {
      sub: user.id,
      email: user.email,
      roles,
      role: user.primaryRole,
      primary_role: user.primaryRole,
      verification_level: user.verificationStatus,
      verification_status: user.verificationStatus,
      verification_review_note: user.verificationReviewNote ?? undefined,
      iat: now,
      exp: now + env.authJwtExpiresInSeconds
    },
    requireJwtSecret()
  );

  return { token, expiresIn: env.authJwtExpiresInSeconds };
};

export const nativeAuthService = {
  register: async (input: { email: string; password: string; fullName?: string; phone?: string; primaryRole?: string }) => {
    const email = normalizeEmail(input.email);
    if (!emailPattern.test(email)) throw badRequest("Email must be valid.");
    if (input.password.length < 12) throw badRequest("Password must be at least 12 characters.");

    const primaryRole = normalizeRole(input.primaryRole);
    if (isPlatformStaffRole(primaryRole)) throw badRequest("Staff roles cannot self-register.");
    const passwordHash = await bcrypt.hash(input.password, env.bcryptSaltRounds);

    try {
      const user = await withTransaction(async (client) => {
        const created = await userRepository.createNativeUser(client, {
          email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone,
          primaryRole
        });
        const publicUser = safeUser(created);
        await userRepository.upsertProfile(client, publicUser);
        await userRepository.ensureRoles(client, publicUser.id, publicUser.primaryRole);
        return publicUser;
      });

      return { ok: true, user, ...signUserToken(user) };
    } catch (error) {
      if (isDuplicateKey(error)) throw badRequest("A user with this email already exists.");
      throw error;
    }
  },

  login: async (input: { email: string; password: string }) => {
    const email = normalizeEmail(input.email);
    const user = await userRepository.findPrivateByEmail(email);
    if (!user) throw unauthorized("Invalid email or password.");

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) throw unauthorized("Invalid email or password.");

    const publicUser = await withTransaction(async (client) => {
      const touched = await userRepository.touchLogin(client, user.id);
      await userRepository.upsertProfile(client, touched);
      await userRepository.ensureRoles(client, touched.id, touched.primaryRole);
      return touched;
    });

    return { ok: true, user: publicUser, ...signUserToken(publicUser) };
  }
};
