import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { interestMatchRequestService } from "../services/interest-match-request-service.js";
import { requireObjectBody } from "../utils/validation.js";

export const interestMatchRequestsRouter = Router();

interestMatchRequestsRouter.use(requireAuth);

interestMatchRequestsRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    response.status(201).json(await interestMatchRequestService.create(request.user!, requireObjectBody(request.body)));
  })
);

interestMatchRequestsRouter.get(
  "/sent",
  asyncHandler(async (request, response) => {
    response.json(await interestMatchRequestService.listSent(request.user!));
  })
);

interestMatchRequestsRouter.get(
  "/received",
  asyncHandler(async (request, response) => {
    response.json(await interestMatchRequestService.listReceived(request.user!));
  })
);

interestMatchRequestsRouter.patch(
  "/:id/cancel",
  asyncHandler(async (request, response) => {
    response.json(await interestMatchRequestService.cancel(request.user!, request.params.id));
  })
);

interestMatchRequestsRouter.patch(
  "/:id/owner-decision",
  asyncHandler(async (request, response) => {
    response.json(await interestMatchRequestService.ownerDecision(request.user!, request.params.id, requireObjectBody(request.body)));
  })
);
