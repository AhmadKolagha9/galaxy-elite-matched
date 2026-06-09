import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { requireAdminOrCompliance } from "../../middleware/rbac.js";
import { interestMatchRequestService } from "../../services/interest-match-request-service.js";
import { requireObjectBody } from "../../utils/validation.js";

export const adminInterestMatchRequestsRouter = Router();

adminInterestMatchRequestsRouter.use(requireAdminOrCompliance);

adminInterestMatchRequestsRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    response.json(await interestMatchRequestService.listAdmin());
  })
);

adminInterestMatchRequestsRouter.patch(
  "/:id",
  asyncHandler(async (request, response) => {
    response.json(await interestMatchRequestService.adminUpdate(request.user!, request.params.id, requireObjectBody(request.body), request.ip));
  })
);
