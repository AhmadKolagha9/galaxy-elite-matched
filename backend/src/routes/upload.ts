import { Router } from "express";

import { documentSignedUrlExpiresInSeconds } from "../domain/documents.js";
import { asyncHandler } from "../http/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { documentRepository } from "../repositories/document-repository.js";
import { documentStorageService } from "../services/document-storage-service.js";
import { buildPrivateDocumentStoragePath, parseAllowedMimeType, parseDocumentType, parseFileSize, parseRelatedObject } from "../utils/document-validation.js";
import { asString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const uploadRouter = Router();

uploadRouter.post(
  "/sign-url",
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const documentType = parseDocumentType(body.document_type ?? body.documentType);
    const mimeType = parseAllowedMimeType(body.mime_type ?? body.mimeType);
    const fileSize = parseFileSize(body.file_size ?? body.fileSize);
    const filename = asString(body.filename);
    const { relatedObjectType, relatedObjectId } = parseRelatedObject(body);

    const storagePath = buildPrivateDocumentStoragePath({
      userId: request.user!.id,
      documentType,
      filename,
      mimeType
    });
    const signedUpload = await documentStorageService.createSignedUploadUrl(storagePath);
    const document = await documentRepository.createUploadRecord({
      ownerUserId: request.user!.id,
      relatedObjectType,
      relatedObjectId,
      documentType,
      storagePath,
      originalFilename: filename,
      mimeType,
      fileSize
    });

    response.status(201).json({
      ok: true,
      id: document.id,
      documentType,
      status: document.verificationStatus,
      bucket: document.storageBucket,
      storagePath,
      signedUrl: signedUpload.signedUrl,
      token: signedUpload.token,
      expiresIn: documentSignedUrlExpiresInSeconds,
      message: "Signed upload URL created for a private document path."
    });
  })
);
