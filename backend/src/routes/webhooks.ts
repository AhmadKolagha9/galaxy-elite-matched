import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { notificationService } from "../services/notification-service.js";
import { assertValidWebhookSignature } from "../utils/webhook-signature.js";
import { requireObjectBody } from "../utils/validation.js";

export const webhooksRouter = Router();

const handleNotificationWebhook = asyncHandler(async (request, response) => {
  assertValidWebhookSignature(request);
  const notifications = await notificationService.processWebhook(requireObjectBody(request.body));
  response.status(202).json({ ok: true, processed: notifications.length });
});

webhooksRouter.post("/firestore-trigger", handleNotificationWebhook);
webhooksRouter.post("/mysql-db-trigger", handleNotificationWebhook);
