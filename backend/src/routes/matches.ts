import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { notFound } from "../http/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/rbac.js";
import { matchRepository } from "../repositories/match-repository.js";
import { requireObjectBody } from "../utils/validation.js";

export const matchesRouter = Router();

matchesRouter.use(requireAuth);

matchesRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, matches: await matchRepository.list() });
  })
);

matchesRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (request, response) => {
    response.status(201).json({ ok: true, match: await matchRepository.create(requireObjectBody(request.body), request.user?.id) });
  })
);

matchesRouter.get(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const match = await matchRepository.get(request.params.id);
    if (!match) throw notFound("Match not found.");
    response.json({ ok: true, match });
  })
);

matchesRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const match = await matchRepository.updateStatus(request.params.id, requireObjectBody(request.body));
    if (!match) throw notFound("Match not found.");
    response.json({ ok: true, match });
  })
);
