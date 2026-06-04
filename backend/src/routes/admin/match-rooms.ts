import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { badRequest } from "../../http/errors.js";
import { requireAdmin, requireAdminOrCompliance } from "../../middleware/rbac.js";
import { matchRoomRepository } from "../../repositories/match-repository.js";
import { parseDealFlowStage } from "../../utils/match-scoring.js";
import { asOptionalString } from "../../utils/strings.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminMatchRoomsRouter = Router();

adminMatchRoomsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const matchRequestId = asOptionalString(body.match_request_id ?? body.matchRequestId);
    if (!matchRequestId) throw badRequest("match_request_id is required.");
    const room = await matchRoomRepository.createForMatchRequest({ matchRequestId, actor: request.user!, ipAddress: request.ip });
    response.status(201).json({ ok: true, room });
  })
);

adminMatchRoomsRouter.patch(
  "/:id/stage",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const nextStage = parseDealFlowStage(body.next_stage ?? body.nextStage);
    const room = await matchRoomRepository.advanceStage({
      id: request.params.id,
      actor: request.user!,
      nextStage,
      note: asOptionalString(body.note),
      ipAddress: request.ip
    });
    response.json({ ok: true, room });
  })
);
