import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { newProjectService } from "../services/new-project-service.js";
import { parsePublicNewProjectFilters } from "../utils/new-project-validation.js";

export const newProjectsRouter = Router();

newProjectsRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const projects = await newProjectService.listPublic(parsePublicNewProjectFilters(request));
    response.setHeader("Cache-Control", "public, max-age=120");
    response.json({ ok: true, projects });
  })
);

newProjectsRouter.get(
  "/:reference",
  asyncHandler(async (request, response) => {
    const project = await newProjectService.detailPublic(request.params.reference);
    response.setHeader("Cache-Control", "public, max-age=120");
    response.json({ ok: true, project });
  })
);
