import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../http/async-handler.js";
import { nativeAuthService } from "../services/native-auth-service.js";
import { asString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, (request, response) => {
  response.json({ ok: true, user: request.user });
});

profileRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const result = await nativeAuthService.updateProfile({
      userId: request.user!.id,
      fullName: asString(body.full_name ?? body.fullName ?? body.name),
      email: asString(body.email)
    });

    response.json(result);
  })
);
