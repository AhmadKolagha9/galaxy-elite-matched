import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { requireAdmin } from "../../middleware/rbac.js";
import { matchScoringService } from "../../services/match-scoring-service.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminMatchesRouter = Router();

adminMatchesRouter.post(
  "/evaluate",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const body = request.body && typeof request.body === "object" ? requireObjectBody(request.body) : {};
    const result = await matchScoringService.evaluate({
      actor: request.user!,
      minimumScore: body.minimumScore ?? body.minimum_score,
      limit: body.limit,
      ipAddress: request.ip
    });
    response.json({ ok: true, ...result });
  })
);
