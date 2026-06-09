import { Router } from "express";
import { z } from "zod";

import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { publicSubmissionRateLimit } from "../middleware/rate-limit.js";
import { asyncHandler } from "../http/async-handler.js";
import { badRequest, unauthorized } from "../http/errors.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { createInterestSignal, createPrivateAvailability } from "../repositories/mysql-submission-field-repository.js";
import { listPublicRecords } from "../repositories/submission-repository.js";
import { submissionService } from "../services/submission-service.js";
import { interestMatchRequestService } from "../services/interest-match-request-service.js";
import { interestSignalSchema, privateAvailabilitySchema } from "../schemas/submission-fields.js";
import { validateSubmissionTaxonomy } from "../utils/submission-taxonomy-validation.js";
import { sanitizeSubmissionPayload } from "../utils/submission-payload.js";
import { sanitizeOutput, sanitizePublicRecords } from "../utils/output-sanitizer.js";
import { parseSubmissionType, requireObjectBody, validateSubmission } from "../utils/validation.js";

export const submissionsRouter = Router();

const formatZodError = (error: z.ZodError) =>
  error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

const parsePayload = <T>(parser: { parse: (payload: unknown) => T }, payload: unknown) => {
  try {
    return parser.parse(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw badRequest(formatZodError(error));
    }

    throw error;
  }
};

const requestUserId = (user: (AuthPrincipal & { uid?: string }) | undefined) => {
  const userId = user?.uid ?? user?.id;
  if (!userId) throw unauthorized("Authenticated user id is required.");
  return userId;
};

const createSubmissionHandler = (typeName: string) =>
  asyncHandler(async (request, response) => {
    const type = parseSubmissionType(typeName);
    const data = sanitizeSubmissionPayload(type, requireObjectBody(request.body));
    validateSubmission(type, data);
    await validateSubmissionTaxonomy(type, data);
    const result = await submissionService.create({
      type,
      data,
      uploadedDocuments: Array.isArray(data.uploadedDocuments) ? (data.uploadedDocuments as never) : undefined,
      userId: request.user?.isServiceAccount ? undefined : request.user?.id
    });
    response.status(type === "newsletter" ? 200 : 201).json(result);
  });

submissionsRouter.use(optionalAuth);

submissionsRouter.post(
  "/interest",
  publicSubmissionRateLimit,
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = parsePayload(interestSignalSchema, requireObjectBody(request.body));
    const result = await createInterestSignal({ payload, userId: requestUserId(request.user) });
    response.status(201).json({ ok: true, ...result });
  })
);

submissionsRouter.get(
  "/interest",
  asyncHandler(async (_request, response) => {
    const records = await listPublicRecords("interest");
    response.json({
      ok: true,
      records: records.map((record) => ({
        ...(sanitizeOutput(record) as Record<string, unknown>),
        public_interest_id: record.id
      }))
    });
  })
);

submissionsRouter.get(
  "/interest/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json(await interestMatchRequestService.listMyPosts(request.user!));
  })
);

submissionsRouter.patch(
  "/interest/me/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    response.json(await interestMatchRequestService.updateMyPostStatus(request.user!, request.params.id, body.action));
  })
);

submissionsRouter.post(
  "/availability",
  publicSubmissionRateLimit,
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = parsePayload(privateAvailabilitySchema, requireObjectBody(request.body));
    const result = await createPrivateAvailability({ payload, userId: requestUserId(request.user) });
    response.status(201).json({ ok: true, ...result });
  })
);

submissionsRouter.post("/verified-listing", publicSubmissionRateLimit, createSubmissionHandler("verifiedListing"));
submissionsRouter.get(
  "/verified-listing",
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, records: sanitizePublicRecords(await listPublicRecords("verifiedListing")) });
  })
);

submissionsRouter.post("/investor-post", publicSubmissionRateLimit, createSubmissionHandler("investor"));
submissionsRouter.get(
  "/investor-post",
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, records: sanitizePublicRecords(await listPublicRecords("investor")) });
  })
);

submissionsRouter.post("/agent", createSubmissionHandler("agent"));
submissionsRouter.post("/newsletter", createSubmissionHandler("newsletter"));
