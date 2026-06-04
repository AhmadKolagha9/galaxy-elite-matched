import { Router } from "express";

import { asyncHandler } from "../http/async-handler.js";
import { nativeAuthService } from "../services/native-auth-service.js";
import { asOptionalString, asString } from "../utils/strings.js";
import { requireObjectBody } from "../utils/validation.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const result = await nativeAuthService.register({
      email: asString(body.email),
      password: typeof body.password === "string" ? body.password : "",
      fullName: asOptionalString(body.full_name ?? body.fullName ?? body.name),
      phone: asOptionalString(body.phone),
      primaryRole: asOptionalString(body.primary_role ?? body.primaryRole ?? body.role)
    });

    response.status(201).json({
      ok: true,
      user: result.user,
      token: result.token,
      expiresIn: result.expiresIn,
      message: "Account registered with deferred verification."
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (request, response) => {
    const body = requireObjectBody(request.body);
    const result = await nativeAuthService.login({
      email: asString(body.email),
      password: typeof body.password === "string" ? body.password : ""
    });

    response.json({
      ok: true,
      user: result.user,
      token: result.token,
      expiresIn: result.expiresIn,
      message: "Login successful."
    });
  })
);
