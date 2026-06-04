import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { requireAdmin, requireSuperAdmin } from "../../middleware/rbac.js";
import { taxonomyService, getTaxonomyCacheVersion } from "../../services/taxonomy-service.js";
import { parseTaxonomyListQuery, parseTaxonomyMutation } from "../../utils/taxonomy-validation.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminTaxonomyRouter = Router();

const markTaxonomyMutationResponse = (response: import("express").Response) => {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Cache-Tag", "taxonomy");
  response.setHeader("X-Cache-Invalidated", "taxonomy");
  response.setHeader("X-Taxonomy-Version", String(getTaxonomyCacheVersion()));
};

adminTaxonomyRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const filters = parseTaxonomyListQuery(request);
    const { items, tree } = await taxonomyService.getAdminTree(filters);
    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, tree, items });
  })
);

adminTaxonomyRouter.post(
  "/",
  requireSuperAdmin,
  asyncHandler(async (request, response) => {
    const item = await taxonomyService.create(request.user!, parseTaxonomyMutation(requireObjectBody(request.body), "create"), request.ip);
    markTaxonomyMutationResponse(response);
    response.status(201).json({ ok: true, item });
  })
);

adminTaxonomyRouter.put(
  "/:id",
  requireSuperAdmin,
  asyncHandler(async (request, response) => {
    const item = await taxonomyService.update(request.user!, request.params.id, parseTaxonomyMutation(requireObjectBody(request.body), "update"), request.ip);
    markTaxonomyMutationResponse(response);
    response.json({ ok: true, item });
  })
);

adminTaxonomyRouter.patch(
  "/:id",
  requireSuperAdmin,
  asyncHandler(async (request, response) => {
    const item = await taxonomyService.update(request.user!, request.params.id, parseTaxonomyMutation(requireObjectBody(request.body), "update"), request.ip);
    markTaxonomyMutationResponse(response);
    response.json({ ok: true, item });
  })
);

adminTaxonomyRouter.post(
  "/import",
  requireSuperAdmin,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const csv = typeof body.csv === "string" ? body.csv : "";
    const items = await taxonomyService.importCsv(request.user!, csv, request.ip);
    markTaxonomyMutationResponse(response);
    response.status(201).json({ ok: true, imported: items.length, items });
  })
);

adminTaxonomyRouter.delete(
  "/:id",
  requireSuperAdmin,
  asyncHandler(async (request, response) => {
    const item = await taxonomyService.archive(request.user!, request.params.id, request.ip);
    markTaxonomyMutationResponse(response);
    response.json({ ok: true, item });
  })
);
