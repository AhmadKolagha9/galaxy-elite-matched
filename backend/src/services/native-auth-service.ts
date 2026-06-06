import crypto from "node:crypto";

import bcrypt from "bcrypt";

import { signAppJwt } from "../auth/jwt.js";
import { env } from "../config/env.js";
import { withTransaction } from "../db/pool.js";
import { isPlatformStaffRole, normalizeRole, type UserRole } from "../domain/status.js";
import type { NativeUserPrivateRecord, NativeUserRecord } from "../domain/users.js";
import { badRequest, forbidden, serviceUnavailable, unauthorized } from "../http/errors.js";
import { userRepository } from "../repositories/user-repository.js";
import { emailService } from "./email-service.js";

const emailPattern = /^\S+@\S+\.\S+$/;
const maxVerificationAttempts = 5;

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
  const {
    passwordHash: _passwordHash,
    emailVerificationCodeHash: _emailVerificationCodeHash,
    emailVerificationExpiresAt: _emailVerificationExpiresAt,
    emailVerificationAttempts: _emailVerificationAttempts,
    ...record
  } = user as NativeUserPrivateRecord;
  return record;
};

const codeHash = (email: string, code: string) =>
  crypto.createHash("sha256").update(`${normalizeEmail(email)}:${code}:${requireJwtSecret()}`).digest("hex");

const generateVerificationCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

const expiresAt = () => new Date(Date.now() + env.emailVerificationTtlMinutes * 60 * 1000);

const safeHashEquals = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
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
      email_verification_status: user.emailVerificationStatus,
      email_verified: user.emailVerificationStatus === "verified",
      iat: now,
      exp: now + env.authJwtExpiresInSeconds
    },
    requireJwtSecret()
  );

  return { token, expiresIn: env.authJwtExpiresInSeconds };
};

const sendCode = async (user: NativeUserRecord, code: string) => {
  await emailService.sendEmailVerificationCode({
    to: user.email,
    code,
    fullName: user.fullName,
    expiresInMinutes: env.emailVerificationTtlMinutes
  });
};

const ensureEmailVerifiedForLogin = (user: NativeUserPrivateRecord) => {
  if (isPlatformStaffRole(user.primaryRole)) return;
  if (user.emailVerificationStatus !== "verified") {
    throw forbidden("Email verification is required before login.");
  }
};

export const nativeAuthService = {
  register: async (input: { email: string; password: string; fullName?: string; phone?: string; primaryRole?: string }) => {
    const email = normalizeEmail(input.email);
    if (!emailPattern.test(email)) throw badRequest("Email must be valid.");
    if (input.password.length < 12) throw badRequest("Password must be at least 12 characters.");

    const primaryRole = normalizeRole(input.primaryRole);
    if (isPlatformStaffRole(primaryRole)) throw badRequest("Staff roles cannot self-register.");
    emailService.assertConfigured();

    const passwordHash = await bcrypt.hash(input.password, env.bcryptSaltRounds);
    const code = generateVerificationCode();
    const hashedCode = codeHash(email, code);

    try {
      const user = await withTransaction(async (client) => {
        const created = await userRepository.createNativeUser(client, {
          email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone,
          primaryRole,
          emailVerificationCodeHash: hashedCode,
          emailVerificationExpiresAt: expiresAt()
        });
        const publicUser = safeUser(created);
        await userRepository.upsertProfile(client, publicUser);
        await userRepository.ensureRoles(client, publicUser.id, publicUser.primaryRole);
        return publicUser;
      });

      await sendCode(user, code);
      return { ok: true, user, requiresEmailVerification: true as const };
    } catch (error) {
      if (isDuplicateKey(error)) throw badRequest("A user with this email already exists.");
      throw error;
    }
  },

  verifyEmail: async (input: { email: string; code: string }) => {
    const email = normalizeEmail(input.email);
    const code = input.code.trim();
    if (!emailPattern.test(email)) throw badRequest("Email must be valid.");
    if (!/^\d{6}$/.test(code)) throw badRequest("Verification code must be six digits.");

    const publicUser = await withTransaction(async (client) => {
      const user = await userRepository.findPrivateByEmailForUpdate(client, email);
      if (!user) throw unauthorized("Invalid verification code.");
      if (user.emailVerificationStatus === "verified") return safeUser(user);
      if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) throw badRequest("Verification code expired. Request a new code.");
      if (user.emailVerificationAttempts >= maxVerificationAttempts) throw badRequest("Too many verification attempts. Request a new code.");
      if (new Date(user.emailVerificationExpiresAt).getTime() < Date.now()) throw badRequest("Verification code expired. Request a new code.");

      const matches = safeHashEquals(user.emailVerificationCodeHash, codeHash(email, code));
      if (!matches) {
        await userRepository.incrementEmailVerificationAttempts(client, user.id);
        throw badRequest("Invalid verification code.");
      }

      const verified = await userRepository.markEmailVerified(client, user.id);
      await userRepository.upsertProfile(client, verified);
      await userRepository.ensureRoles(client, verified.id, verified.primaryRole);
      return verified;
    });

    return { ok: true, user: publicUser, ...signUserToken(publicUser) };
  },

  resendVerification: async (input: { email: string }) => {
    const email = normalizeEmail(input.email);
    if (!emailPattern.test(email)) throw badRequest("Email must be valid.");
    emailService.assertConfigured();

    const code = generateVerificationCode();
    const user = await withTransaction(async (client) => {
      const existing = await userRepository.findPrivateByEmailForUpdate(client, email);
      if (!existing || existing.emailVerificationStatus === "verified") return null;
      return safeUser(await userRepository.setEmailVerificationChallenge(client, {
        id: existing.id,
        codeHash: codeHash(email, code),
        expiresAt: expiresAt()
      }));
    });

    if (user) await sendCode(user, code);
    return { ok: true, message: "If the account is pending verification, a new code has been sent." };
  },

  login: async (input: { email: string; password: string }) => {
    const email = normalizeEmail(input.email);
    const user = await userRepository.findPrivateByEmail(email);
    if (!user) throw unauthorized("Invalid email or password.");

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) throw unauthorized("Invalid email or password.");
    ensureEmailVerifiedForLogin(user);

    const publicUser = await withTransaction(async (client) => {
      const touched = await userRepository.touchLogin(client, user.id);
      await userRepository.upsertProfile(client, touched);
      await userRepository.ensureRoles(client, touched.id, touched.primaryRole);
      return touched;
    });

    return { ok: true, user: publicUser, ...signUserToken(publicUser) };
  },

  loginStaff: async (input: { email: string; password: string }) => {
    const result = await nativeAuthService.login(input);
    if (!isPlatformStaffRole(result.user.primaryRole)) throw forbidden("This account is not authorized for the corporate control platform.");
    return result;
  }
};
