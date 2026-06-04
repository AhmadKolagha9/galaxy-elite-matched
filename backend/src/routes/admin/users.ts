import { Router } from "express";

import { accountVerificationStatuses, type AccountVerificationStatus } from "../../domain/users.js";
import { asyncHandler } from "../../http/async-handler.js";
import { badRequest } from "../../http/errors.js";
import { requireCompliance } from "../../middleware/rbac.js";
import { userVerificationService } from "../../services/user-verification-service.js";
import { asOptionalString, asString } from "../../utils/strings.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminUsersRouter = Router();

const uuidPattern = /^[0-9a-fA-F-]{36}$/;

const parseStatus = (body: Record<string, unknown>): AccountVerificationStatus => {
  const action = asString(body.action);
  if (action === "approve") return "verified";
  if (action === "reject") return "action_required";

  const status = asString(body.status ?? body.verification_status ?? body.verificationStatus);
  if (accountVerificationStatuses.includes(status as AccountVerificationStatus)) return status as AccountVerificationStatus;
  throw badRequest(`status must be one of: ${accountVerificationStatuses.join(", ")}, or action must be approve/reject.`);
};

adminUsersRouter.post(
  "/:id/verify-identity",
  requireCompliance,
  asyncHandler(async (request, response) => {
    if (!uuidPattern.test(request.params.id)) throw badRequest("User id must be a UUID.");
    const body = requireObjectBody(request.body);
    const status = parseStatus(body);
    const note = asOptionalString(body.rejection_reason ?? body.rejectionReason ?? body.note ?? body.review_note ?? body.reviewNote);
    if (status === "action_required" && !note) throw badRequest("rejection_reason is required when rejecting identity files.");

    const result = await userVerificationService.reviewIdentity({
      actor: request.user!,
      userId: request.params.id,
      status,
      note,
      ipAddress: request.ip
    });

    response.json(result);
  })
);
