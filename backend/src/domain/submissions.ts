import type { ApprovalStatus, PublicStatus, UserRole, VerificationStatus } from "./status.js";

export const submissionTypes = ["interest", "availability", "verifiedListing", "investor", "agent", "newsletter"] as const;
export type SubmissionType = (typeof submissionTypes)[number];

export type ProfileRecord = {
  id: string;
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  primaryRole: UserRole;
  verificationLevel: string;
};

export type AuthPrincipal = {
  id: string;
  email?: string;
  roles: UserRole[];
  primaryRole: UserRole;
  verificationLevel: string;
  profile?: ProfileRecord;
  isServiceAccount?: boolean;
  customClaims?: Record<string, unknown>;
};

export type UploadedDocumentSummary = {
  field: string;
  name: string;
  size: number;
  type: string;
};

export type SubmissionInput = {
  type: SubmissionType;
  data: Record<string, unknown>;
  uploadedDocuments?: UploadedDocumentSummary[];
  userId?: string;
};

export type SubmissionRecord = {
  id: string;
  type: SubmissionType;
  approvalStatus: ApprovalStatus;
  publicStatus: PublicStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt?: string;
  data: Record<string, unknown>;
};

export type AdminSubmissionRecord = Record<string, unknown> & {
  id: string;
  submittedAt: string;
  submissionType: SubmissionType;
  approvalStatus: string;
  publicStatus: string;
  status: string;
  verificationLevel: string;
  approvalStatusRaw: ApprovalStatus;
  publicStatusRaw: PublicStatus;
  verificationStatusRaw: VerificationStatus;
};
