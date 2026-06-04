import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { badRequest, notFound } from "../http/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/rbac.js";
import { matchRoomRepository } from "../repositories/match-repository.js";
import { asOptionalString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const matchRoomsRouter = Router();

matchRoomsRouter.use(requireAuth);

matchRoomsRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    response.json({ ok: true, rooms: await matchRoomRepository.listForParticipant(request.user!.id) });
  })
);

matchRoomsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const matchRequestId = asOptionalString(body.match_request_id ?? body.matchRequestId);
    if (!matchRequestId) throw badRequest("match_request_id is required.");
    response.status(201).json({ ok: true, room: await matchRoomRepository.createForMatchRequest({ matchRequestId, actor: request.user!, ipAddress: request.ip }) });
  })
);

matchRoomsRouter.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const rooms = await matchRoomRepository.listForParticipant(request.user!.id);
    const room = rooms.find((item) => item.id === request.params.id);
    if (!room) throw notFound("Match room not found.");
    response.json({ ok: true, room });
  })
);

matchRoomsRouter.post(
  "/:id/unlock-contact",
  asyncHandler(async (request, response) => {
    const result = await matchRoomRepository.unlockContact({ id: request.params.id, userId: request.user!.id });
    response.json({ ok: true, ...result });
  })
);
