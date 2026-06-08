import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../http/async-handler.js";
import { userRepository } from "../repositories/user-repository.js";
import { nativeAuthService } from "../services/native-auth-service.js";
import { asString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const profileRouter = Router();

profileRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const storedUser = await userRepository.findById(request.user!.id);
    const user = storedUser
      ? {
          ...storedUser,
          roles: request.user!.roles,
          primaryRole: storedUser.primaryRole,
          verificationLevel: storedUser.verificationStatus,
          profile: {
            id: storedUser.id,
            userId: storedUser.id,
            fullName: storedUser.fullName,
            email: storedUser.email,
            primaryRole: storedUser.primaryRole,
            verificationLevel: storedUser.verificationStatus
          },
          customClaims: request.user!.customClaims
        }
      : request.user;

    response.json({ ok: true, user });
  })
);

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
