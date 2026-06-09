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

const privateOpportunityTypeSchema = z.enum(["availability", "investor"]);

const asText = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const toTextArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map(asText).filter((item): item is string => Boolean(item));
  const text = asText(value);
  return text ? [text] : [];
};

const yes = (value: unknown) => value === true || value === "true" || value === "on" || value === 1 || value === "1";

const rangeLabel = (minimum: unknown, maximum: unknown) => {
  const min = asText(String(minimum ?? ""));
  const max = asText(String(maximum ?? ""));
  if (min && max) return `${min} - ${max}`;
  return min ?? max;
};

const respondentPreference = (data: Record<string, unknown>) => {
  const options = [];
  if (yes(data.accepts_direct_owner)) options.push("Direct owners");
  if (yes(data.accepts_developer)) options.push("Developers");
  if (yes(data.accepts_agent)) options.push("Licensed agents");
  return options.length ? options.join(", ") : "Verified responders only";
};

const firstOf = (values: string[]) => values[0];

const normalizeInvestorOpportunityPayload = (data: Record<string, unknown>, user: AuthPrincipal | undefined) => {
  const countries = toTextArray(data.countries ?? data.country);
  const propertyTypes = toTextArray(data.property_types ?? data.propertyTypes ?? data.propertyType);
  const marketSegments = toTextArray(data.market_segments ?? data.marketSegments ?? data.marketSegment);
  const email = asText(data.email) ?? asText(user?.email);
  if (!email) throw badRequest("Authenticated email is required for investor opportunities.");

  return {
    ...data,
    name: asText(data.name) ?? user?.profile?.fullName ?? email,
    email,
    phone: asText(data.phone) ?? user?.profile?.phone ?? "Not provided",
    investorProfile: asText(data.investor_type) ?? asText(data.investorProfile),
    investorGoal: asText(data.investment_goal) ?? asText(data.investorGoal),
    marketSegment: firstOf(marketSegments) ?? asText(data.marketSegment),
    marketSegments,
    country: firstOf(countries) ?? asText(data.country),
    countries,
    cityArea: asText(data.area_city) ?? asText(data.cityArea),
    propertyType: firstOf(propertyTypes) ?? asText(data.propertyType),
    propertyTypes,
    ticketSize: rangeLabel(data.ticket_min, data.ticket_max) ?? asText(data.ticketSize),
    budgetVisibility: asText(data.budget_visibility) ?? asText(data.budgetVisibility),
    targetYield: asText(data.target_yield) ?? asText(data.targetYield),
    riskPreference: asText(data.risk_preference) ?? asText(data.riskPreference),
    description: asText(data.private_description) ?? asText(data.description),
    agentPreference: asText(data.agentPreference) ?? respondentPreference(data)
  };
};

submissionsRouter.use(optionalAuth);

submissionsRouter.post(
  "/private-opportunities",
  publicSubmissionRateLimit,
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const opportunityType = parsePayload(privateOpportunityTypeSchema, body.opportunity_type ?? body.opportunityType);

    if (opportunityType === "availability") {
      const payload = parsePayload(privateAvailabilitySchema, body);
      const result = await createPrivateAvailability({ payload, userId: requestUserId(request.user) });
      response.status(201).json({ ok: true, ...result });
      return;
    }

    const type = parseSubmissionType("investor");
    const normalized = normalizeInvestorOpportunityPayload(body, request.user);
    const data = sanitizeSubmissionPayload(type, normalized);
    validateSubmission(type, data);
    await validateSubmissionTaxonomy(type, data);
    const result = await submissionService.create({
      type,
      data,
      uploadedDocuments: Array.isArray(data.uploadedDocuments) ? (data.uploadedDocuments as never) : undefined,
      userId: request.user?.isServiceAccount ? undefined : request.user?.id
    });
    response.status(201).json(result);
  })
);

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
      records: records.map((record) => {
        const sanitized = sanitizeOutput(record) as Record<string, unknown>;
        const data = record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : {};
        return {
          ...sanitized,
          public_interest_id: record.id,
          reference_code: typeof data.reference_code === "string" ? data.reference_code : undefined
        };
      })
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

submissionsRouter.post(
  "/investor-post",
  publicSubmissionRateLimit,
  requireAuth,
  asyncHandler(async (request, response) => {
    const type = parseSubmissionType("investor");
    const normalized = normalizeInvestorOpportunityPayload(requireObjectBody(request.body), request.user);
    const data = sanitizeSubmissionPayload(type, normalized);
    validateSubmission(type, data);
    await validateSubmissionTaxonomy(type, data);
    const result = await submissionService.create({
      type,
      data,
      uploadedDocuments: Array.isArray(data.uploadedDocuments) ? (data.uploadedDocuments as never) : undefined,
      userId: request.user?.isServiceAccount ? undefined : request.user?.id
    });
    response.status(201).json(result);
  })
);
submissionsRouter.get(
  "/investor-post",
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, records: sanitizePublicRecords(await listPublicRecords("investor")) });
  })
);

submissionsRouter.post("/agent", createSubmissionHandler("agent"));
submissionsRouter.post("/newsletter", createSubmissionHandler("newsletter"));
