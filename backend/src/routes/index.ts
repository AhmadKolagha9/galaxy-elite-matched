import { Router } from "express";

import { optionalAuth } from "../middleware/auth.js";
import { verifyClaims } from "../middleware/verify-claims.js";
import { adminRouter } from "./admin/index.js";
import { agentApplicationsRouter } from "./agent-applications.js";
import { authRouter } from "./auth.js";
import { healthRouter } from "./health.js";
import { matchRoomsRouter } from "./match-rooms.js";
import { matchesRouter } from "./matches.js";
import { notificationsRouter } from "./notifications.js";
import { profileRouter } from "./profile.js";
import { submissionsRouter } from "./submissions.js";
import { taxonomyRouter } from "./taxonomy.js";
import { uploadRouter } from "./upload.js";
import { usersRouter } from "./users.js";
import { webhooksRouter } from "./webhooks.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/agent-applications", optionalAuth, agentApplicationsRouter);
apiRouter.use(submissionsRouter);
apiRouter.use("/profile", optionalAuth, profileRouter);
apiRouter.use("/users", optionalAuth, usersRouter);
apiRouter.use("/admin", verifyClaims, adminRouter);
apiRouter.use("/taxonomy", taxonomyRouter);
apiRouter.use("/matches", optionalAuth, matchesRouter);
apiRouter.use("/match-rooms", optionalAuth, matchRoomsRouter);
apiRouter.use("/notifications", optionalAuth, notificationsRouter);
apiRouter.use("/upload", optionalAuth, uploadRouter);
apiRouter.use("/webhooks", webhooksRouter);
