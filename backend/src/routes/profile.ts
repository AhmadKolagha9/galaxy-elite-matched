import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, (request, response) => {
  response.json({ ok: true, user: request.user });
});
