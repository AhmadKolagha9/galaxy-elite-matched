import type { UserRole } from "./status.js";

export const accountVerificationStatuses = ["unverified", "under_review", "action_required", "verified"] as const;
export type AccountVerificationStatus = (typeof accountVerificationStatuses)[number];

export const emailVerificationStatuses = ["pending", "verified"] as const;
export type EmailVerificationStatus = (typeof emailVerificationStatuses)[number];

export type NativeUserRecord = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  primaryRole: UserRole;
  verificationStatus: AccountVerificationStatus;
  emailVerificationStatus: EmailVerificationStatus;
  emailVerifiedAt?: string | null;
  isProfileLocked: boolean;
  verifiedAt?: string | null;
  verificationReviewNote?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NativeUserPrivateRecord = NativeUserRecord & {
  passwordHash: string;
  emailVerificationCodeHash?: string | null;
  emailVerificationExpiresAt?: string | null;
  emailVerificationAttempts: number;
};

const accountVerificationStatusSet = new Set<string>(accountVerificationStatuses);

export const isAccountVerificationStatus = (value: string): value is AccountVerificationStatus =>
  accountVerificationStatusSet.has(value);
