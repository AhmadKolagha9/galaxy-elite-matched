import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { requireStaffRole } from "../middleware/require-staff.js";
import { notificationService } from "../services/notification-service.js";
import { parseDispatchPayload } from "../utils/notification-validation.js";
import { requireObjectBody } from "../utils/validation.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const userId = request.user!.id;
    const notifications = await notificationService.listForUser(userId);
    response.json({ ok: true, notifications });
  })
);

notificationsRouter.post(
  "/dispatch",
  requireStaffRole,
  asyncHandler(async (request, response) => {
    const payload = parseDispatchPayload(requireObjectBody(request.body));
    const notifications = await notificationService.dispatchMany({
      userIds: payload.userIds,
      notificationType: payload.notificationType,
      channels: payload.channels,
      title: payload.title
    });
    response.status(202).json({ ok: true, notifications });
  })
);
