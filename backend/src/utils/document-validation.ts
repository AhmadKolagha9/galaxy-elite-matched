import crypto from "node:crypto";

import {
  allowedDocumentMimeTypes,
  documentTypes,
  maxDocumentFileSizeBytes,
  type AllowedDocumentMimeType,
  type DocumentType,
  type DocumentVerificationStatus
} from "../domain/documents.js";
import { badRequest } from "../http/errors.js";
import { asOptionalString, asString } from "./strings.js";

const safeExtensionByMimeType: Record<AllowedDocumentMimeType, string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"]
};

export const parseDocumentType = (value: unknown): DocumentType => {
  const text = asString(value);
  if (documentTypes.includes(text as DocumentType)) return text as DocumentType;
  throw badRequest(`Invalid document_type. Allowed values: ${documentTypes.join(", ")}.`);
};

export const parseAllowedMimeType = (value: unknown): AllowedDocumentMimeType => {
  const text = asString(value).toLowerCase();
  if (allowedDocumentMimeTypes.includes(text as AllowedDocumentMimeType)) return text as AllowedDocumentMimeType;
  throw badRequest(`Invalid mime_type. Allowed values: ${allowedDocumentMimeTypes.join(", ")}.`);
};

export const parseFileSize = (value: unknown) => {
  const size = Number(value);
  if (!Number.isInteger(size) || size < 1) throw badRequest("file_size must be a positive integer in bytes.");
  if (size > maxDocumentFileSizeBytes) throw badRequest("File size exceeds the 10MB document upload limit.");
  return size;
};

const sanitizeFilename = (filename: string) => {
  const cleaned = filename.trim().replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  if (!cleaned || cleaned === "." || cleaned === "..") throw badRequest("filename is required.");
  return cleaned.slice(0, 180);
};

const extensionOf = (filename: string) => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
};

export const buildPrivateDocumentStoragePath = (input: { userId: string; documentType: DocumentType; filename: string; mimeType: AllowedDocumentMimeType }) => {
  const filename = sanitizeFilename(input.filename);
  const extension = extensionOf(filename);
  if (!extension || !safeExtensionByMimeType[input.mimeType].includes(extension)) {
    throw badRequest("File extension does not match the allowed mime type.");
  }
  return `private/${input.userId}/${input.documentType}/${crypto.randomUUID()}-${filename}`;
};

export const parseRelatedObject = (body: Record<string, unknown>) => {
  const relatedObjectType = asOptionalString(body.related_object_type ?? body.relatedObjectType) ?? "unassigned";
  const relatedObjectId = asOptionalString(body.related_object_id ?? body.relatedObjectId);
  if (!relatedObjectId) throw badRequest("related_object_id is required.");
  if (!/^[0-9a-fA-F-]{36}$/.test(relatedObjectId)) throw badRequest("related_object_id must be a UUID.");
  return { relatedObjectType, relatedObjectId };
};

export const parseVerificationStatus = (value: unknown): Extract<DocumentVerificationStatus, "verified" | "failed"> => {
  const text = asString(value);
  if (text === "verified" || text === "failed") return text;
  throw badRequest('status must be "verified" or "failed".');
};
