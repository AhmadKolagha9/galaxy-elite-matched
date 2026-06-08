import { Router } from "express";

import { env } from "../config/env.js";
import { parseAllowedMimeType, parseFileSize } from "../utils/document-validation.js";
import { asyncHandler } from "../http/async-handler.js";
import { badRequest } from "../http/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { agentApplicationService } from "../services/agent-application-service.js";
import { asOptionalString, asString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const agentApplicationsRouter = Router();

const allowedAgentDocumentTypes = new Set(["owner_id", "broker_licence"]);

const parsePayload = (body: Record<string, unknown>) => ({
  companyName: asString(body.company_name ?? body.companyName),
  brokerLicenceNumber: asString(body.broker_licence_number ?? body.brokerLicenceNumber),
  country: asString(body.country),
  notes: asOptionalString(body.notes)
});

const parseStoragePath = (value: unknown, userId: string) => {
  const storagePath = asString(value);
  if (!storagePath) throw badRequest("storage_path is required for each document.");
  if (storagePath.startsWith("/") || storagePath.includes("..")) throw badRequest("storage_path is not valid.");
  if (!storagePath.startsWith(`private/${userId}/`)) throw badRequest("storage_path must belong to the authenticated user.");
  return storagePath;
};

const parseDocuments = (body: Record<string, unknown>, userId: string) => {
  const documents = Array.isArray(body.documents) ? body.documents : [];
  return documents.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw badRequest(`documents[${index}] must be a JSON object.`);
    const document = item as Record<string, unknown>;
    const documentType = asString(document.document_type ?? document.documentType);
    if (!allowedAgentDocumentTypes.has(documentType)) throw badRequest("documents must contain only owner_id and broker_licence files.");
    const mimeType = parseAllowedMimeType(document.mime_type ?? document.mimeType);
    const fileSize = parseFileSize(document.file_size ?? document.fileSize);
    const originalFilename = asString(document.original_filename ?? document.originalFilename ?? document.filename);
    if (!originalFilename) throw badRequest("original_filename is required for each document.");

    return {
      documentType,
      storageBucket: env.uploadBucket,
      storagePath: parseStoragePath(document.storage_path ?? document.storagePath, userId),
      originalFilename,
      mimeType,
      fileSize
    };
  });
};

agentApplicationsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json(await agentApplicationService.getMine(request.user!));
  })
);

agentApplicationsRouter.post(
  "/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    response.json(await agentApplicationService.saveMine(request.user!, parsePayload(body)));
  })
);

agentApplicationsRouter.post(
  "/submit",
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    response.status(202).json(await agentApplicationService.submitMine(request.user!, {
      ...parsePayload(body),
      documents: parseDocuments(body, request.user!.id)
    }));
  })
);
