export const documentTypes = [
  "title_deed",
  "owner_id",
  "power_of_attorney",
  "authority_letter",
  "broker_licence",
  "company_licence",
  "ad_permit",
  "project_approval",
  "floor_plan",
  "proof_of_funds"
] as const;

export const allowedDocumentMimeTypes = ["application/pdf", "image/jpeg", "image/png"] as const;
export const documentVerificationStatuses = ["under_review", "verified", "failed", "expired"] as const;

export type DocumentType = (typeof documentTypes)[number];
export type AllowedDocumentMimeType = (typeof allowedDocumentMimeTypes)[number];
export type DocumentVerificationStatus = (typeof documentVerificationStatuses)[number];

export const maxDocumentFileSizeBytes = 10 * 1024 * 1024;
export const documentSignedUrlExpiresInSeconds = 15 * 60;

export type DocumentUploadRecord = {
  id: string;
  ownerUserId: string;
  relatedObjectType: string;
  relatedObjectId: string;
  documentType: DocumentType;
  storageBucket: string;
  storagePath: string;
  originalFilename: string;
  mimeType: AllowedDocumentMimeType;
  fileSize: number;
  expiryDate?: string;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
};

export type PublicDocumentUploadRecord = Omit<DocumentUploadRecord, "storageBucket" | "storagePath">;
