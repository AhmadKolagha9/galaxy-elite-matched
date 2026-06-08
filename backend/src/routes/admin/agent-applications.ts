import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { badRequest } from "../../http/errors.js";
import { requireAdminOrCompliance } from "../../middleware/rbac.js";
import { agentApplicationService } from "../../services/agent-application-service.js";
import { asOptionalString, asString } from "../../utils/strings.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminAgentApplicationsRouter = Router();

const uuidPattern = /^[0-9a-fA-F-]{36}$/;

adminAgentApplicationsRouter.get(
  "/",
  requireAdminOrCompliance,
  asyncHandler(async (_request, response) => {
    response.json(await agentApplicationService.listPendingForAdmin());
  })
);

adminAgentApplicationsRouter.get(
  "/:id",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    if (!uuidPattern.test(request.params.id)) throw badRequest("Agent application id must be a UUID.");
    response.json(await agentApplicationService.getAdminDetail(request.params.id));
  })
);

adminAgentApplicationsRouter.post(
  "/:id/review",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    if (!uuidPattern.test(request.params.id)) throw badRequest("Agent application id must be a UUID.");
    const body = requireObjectBody(request.body);
    const action = asString(body.action);
    if (action !== "approve" && action !== "reject") throw badRequest("action must be approve or reject.");
    response.json(await agentApplicationService.review({
      actor: request.user!,
      id: request.params.id,
      action,
      note: asOptionalString(body.rejection_reason ?? body.rejectionReason ?? body.note),
      ipAddress: request.ip
    }));
  })
);
