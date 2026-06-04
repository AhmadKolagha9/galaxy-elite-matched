import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { requireSuperAdmin } from "../../middleware/rbac.js";
import { listAdminActions } from "../../services/audit-service.js";

export const adminAuditLogRouter = Router();

adminAuditLogRouter.get(
  "/",
  requireSuperAdmin,
  asyncHandler(async (request, response) => {
    const limit = Number(request.query.limit ?? 250);
    const actions = await listAdminActions(Number.isFinite(limit) ? limit : 250);
    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, actions });
  })
);
