import { Router } from "express";

import { requireAdminOrCompliance } from "../../middleware/rbac.js";
import { adminDocumentsRouter } from "./documents.js";
import { adminSubmissionsRouter } from "./submissions.js";
import { adminTaxonomyRouter } from "./taxonomy.js";
import { adminUsersRouter } from "./users.js";
import { adminVerificationQueueRouter } from "./verification-queue.js";
import { adminMatchesRouter } from "./matches.js";
import { adminMatchRoomsRouter } from "./match-rooms.js";
import { adminAuditLogRouter } from "./audit-log.js";
import { adminAgentApplicationsRouter } from "./agent-applications.js";

export const adminRouter = Router();

adminRouter.get("/", requireAdminOrCompliance, (_request, response) => {
  response.json({ ok: true, area: "admin" });
});

adminRouter.use("/submissions", adminSubmissionsRouter);
adminRouter.use("/agent-applications", adminAgentApplicationsRouter);
adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/verification-queue", adminVerificationQueueRouter);
adminRouter.use("/documents", adminDocumentsRouter);
adminRouter.use("/taxonomy", adminTaxonomyRouter);
adminRouter.use("/matches", adminMatchesRouter);
adminRouter.use("/match-rooms", adminMatchRoomsRouter);
adminRouter.use("/audit-log", adminAuditLogRouter);
