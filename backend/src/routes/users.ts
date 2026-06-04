import { Router } from "express";

import { env } from "../config/env.js";
import { parseAllowedMimeType, parseDocumentType, parseFileSize } from "../utils/document-validation.js";
import { asyncHandler } from "../http/async-handler.js";
import { badRequest } from "../http/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { userVerificationService } from "../services/user-verification-service.js";
import { asDateOrNull, asString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const usersRouter = Router();

const parseStoragePath = (value: unknown, userId: string) => {
  const storagePath = asString(value);
  if (!storagePath) throw badRequest("storage_path is required for each verification document.");
  if (storagePath.startsWith("/") || storagePath.includes("..")) throw badRequest("storage_path is not valid.");
  if (!storagePath.startsWith(`private/${userId}/`)) {
    throw badRequest("storage_path must belong to the authenticated user's private document namespace.");
  }
  return storagePath;
};

const parseDocuments = (body: Record<string, unknown>, userId: string) => {
  const source = Array.isArray(body.documents) ? body.documents : [body];
  if (source.length > 10) throw badRequest("A maximum of 10 verification documents can be submitted at once.");

  return source.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw badRequest(`documents[${index}] must be a JSON object.`);
    }

    const document = item as Record<string, unknown>;
    const documentType = parseDocumentType(document.document_type ?? document.documentType);
    const mimeType = parseAllowedMimeType(document.mime_type ?? document.mimeType);
    const fileSize = parseFileSize(document.file_size ?? document.fileSize);
    const storagePath = parseStoragePath(document.storage_path ?? document.storagePath, userId);
    const originalFilename = asString(document.original_filename ?? document.originalFilename ?? document.filename);
    if (!originalFilename) throw badRequest("original_filename is required for each verification document.");

    return {
      documentType,
      storageBucket: env.uploadBucket,
      storagePath,
      originalFilename,
      mimeType,
      fileSize,
      expiryDate: asDateOrNull(document.expiry_date ?? document.expiryDate)
    };
  });
};

usersRouter.post(
  "/verification/submit",
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const result = await userVerificationService.submit({
      actor: request.user!,
      documents: parseDocuments(body, request.user!.id)
    });

    response.status(202).json(result);
  })
);
