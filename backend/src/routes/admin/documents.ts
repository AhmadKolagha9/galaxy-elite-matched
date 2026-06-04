import { Router } from "express";

import { documentSignedUrlExpiresInSeconds } from "../../domain/documents.js";
import { asyncHandler } from "../../http/async-handler.js";
import { requireAdminOrCompliance, requireCompliance } from "../../middleware/rbac.js";
import { documentRepository } from "../../repositories/document-repository.js";
import { documentStorageService } from "../../services/document-storage-service.js";
import { parseVerificationStatus } from "../../utils/document-validation.js";
import { asOptionalString } from "../../utils/strings.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminDocumentsRouter = Router();

adminDocumentsRouter.get(
  "/",
  requireAdminOrCompliance,
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, documents: await documentRepository.list() });
  })
);

adminDocumentsRouter.get(
  "/:id/view",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    const document = await documentRepository.findPrivateById(request.params.id);
    const signedUrl = await documentStorageService.createSignedViewUrl(document.storagePath);
    await documentRepository.logView({ actor: request.user!, document, ipAddress: request.ip });
    const { storageBucket: _storageBucket, storagePath: _storagePath, ...safeDocument } = document;

    response.json({
      ok: true,
      document: safeDocument,
      signedUrl,
      expiresIn: documentSignedUrlExpiresInSeconds
    });
  })
);

adminDocumentsRouter.post(
  "/:id/verify",
  requireCompliance,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const status = parseVerificationStatus(body.status);
    const rejectionReason = asOptionalString(body.rejection_reason ?? body.rejectionReason);
    const document = await documentRepository.verify({
      actor: request.user!,
      id: request.params.id,
      status,
      rejectionReason,
      ipAddress: request.ip
    });
    response.json({ ok: true, document });
  })
);
