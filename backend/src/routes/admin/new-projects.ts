import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { requireAdmin, requireAdminOrCompliance } from "../../middleware/rbac.js";
import { newProjectService } from "../../services/new-project-service.js";
import { parseAdminNewProjectFilters, parseNewProjectMutation, parseNewProjectStatus } from "../../utils/new-project-validation.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminNewProjectsRouter = Router();

adminNewProjectsRouter.get(
  "/summary",
  requireAdminOrCompliance,
  asyncHandler(async (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, summary: await newProjectService.summary() });
  })
);

adminNewProjectsRouter.get(
  "/",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, projects: await newProjectService.listAdmin(parseAdminNewProjectFilters(request)) });
  })
);

adminNewProjectsRouter.get(
  "/:id",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, project: await newProjectService.detailAdmin(request.params.id) });
  })
);

adminNewProjectsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const project = await newProjectService.create(request.user!, parseNewProjectMutation(request.body, "create"), request.ip);
    response.status(201).json({ ok: true, project });
  })
);

adminNewProjectsRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const project = await newProjectService.update(request.user!, request.params.id, parseNewProjectMutation(request.body, "update"), request.ip);
    response.json({ ok: true, project });
  })
);

adminNewProjectsRouter.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const project = await newProjectService.setStatus(request.user!, request.params.id, parseNewProjectStatus(body.status), request.ip);
    response.json({ ok: true, project });
  })
);

adminNewProjectsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const project = await newProjectService.archive(request.user!, request.params.id, request.ip);
    response.json({ ok: true, project });
  })
);
