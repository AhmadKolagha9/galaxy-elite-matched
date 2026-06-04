import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { taxonomyService, getTaxonomyCacheVersion } from "../services/taxonomy-service.js";
import { parseTaxonomyListQuery } from "../utils/taxonomy-validation.js";

export const taxonomyRouter = Router();

taxonomyRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const filters = parseTaxonomyListQuery(request);
    const items = await taxonomyService.listPublic(filters);

    response.setHeader("Cache-Control", "public, max-age=3600");
    response.setHeader("Cache-Tag", "taxonomy");
    response.setHeader("X-Taxonomy-Version", String(getTaxonomyCacheVersion()));
    response.json({ ok: true, items });
  })
);
