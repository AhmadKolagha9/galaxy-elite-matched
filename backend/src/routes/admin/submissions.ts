import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { badRequest } from "../../http/errors.js";
import { requireAdmin, requireAdminOrCompliance } from "../../middleware/rbac.js";
import { adminService } from "../../services/admin-service.js";
import { parseSubmissionType, requireObjectBody } from "../../utils/validation.js";

export const adminSubmissionsRouter = Router();

adminSubmissionsRouter.get(
  "/summary",
  requireAdminOrCompliance,
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, summary: await adminService.summary() });
  })
);

adminSubmissionsRouter.get(
  "/collections",
  requireAdminOrCompliance,
  asyncHandler(async (_request, response) => {
    response.json({ ok: true, collections: await adminService.collections() });
  })
);

adminSubmissionsRouter.get(
  "/",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    const type = request.query.type ? parseSubmissionType(String(request.query.type)) : undefined;
    response.json({ ok: true, records: await adminService.list({ type, approvalStatus: request.query.approvalStatus ? String(request.query.approvalStatus) : undefined }) });
  })
);


adminSubmissionsRouter.get(
  "/private-opportunities",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    response.json({
      ok: true,
      records: await adminService.privateOpportunities({
        approvalStatus: request.query.approvalStatus ? String(request.query.approvalStatus) : undefined
      })
    });
  })
);

adminSubmissionsRouter.get(
  "/:id",
  requireAdminOrCompliance,
  asyncHandler(async (request, response) => {
    const detail = await adminService.detail(request.params.id);
    response.json({ ok: true, record: detail.record, type: detail.type });
  })
);

adminSubmissionsRouter.post(
  "/:id/decision",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const result = await adminService.decide({
      actor: request.user!,
      id: request.params.id,
      approvalStatus: String(body.approvalStatus ?? "pending_review"),
      publicStatus: String(body.publicStatus ?? "hidden"),
      verificationLevel: String(body.verificationLevel ?? "unverified"),
      note: body.note ? String(body.note) : body.complianceNotes ? String(body.complianceNotes) : undefined,
      ipAddress: request.ip
    });
    response.json(result);
  })
);

for (const action of ["approve", "reject", "request-documents", "compliance-hold", "archive", "under-verification", "mark-verified"] as const) {
  adminSubmissionsRouter.post(
    `/:id/${action}`,
    action === "compliance-hold" ? requireAdminOrCompliance : requireAdmin,
    asyncHandler(async (request, response) => {
      const body = request.body && typeof request.body === "object" ? (request.body as Record<string, unknown>) : {};
      const result = await adminService.action({ actor: request.user!, id: request.params.id, action, note: body.note ? String(body.note) : undefined, publicStatus: body.publicStatus ? String(body.publicStatus) : undefined, ipAddress: request.ip });
      response.json(result);
    })
  );
}

adminSubmissionsRouter.all("/:id", (_request, _response, next) => next(badRequest("Unsupported admin submission action.")));
