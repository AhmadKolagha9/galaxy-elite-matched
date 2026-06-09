import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest, forbidden } from "../http/errors.js";
import { interestMatchRequestRepository, type InterestMatchAdminStatus } from "../repositories/interest-match-request-repository.js";
import { notificationService } from "./notification-service.js";

const adminStatuses = new Set<InterestMatchAdminStatus>(["pending_review", "in_progress", "approved", "rejected", "closed"]);

const isVerified = (actor: AuthPrincipal) => actor.verificationLevel === "verified";

const redactMemberRequest = <T extends { requester?: unknown; owner?: unknown }>(request: T) => ({
  ...request,
  requester: undefined,
  owner: undefined
});

const safeDispatch = async (input: Parameters<typeof notificationService.dispatch>[0]) => {
  try {
    await notificationService.dispatch(input);
  } catch (error) {
    console.error("Interest match notification failed", error instanceof Error ? error.message : error);
  }
};

export const interestMatchRequestService = {
  listMyPosts: async (actor: AuthPrincipal) => ({ ok: true, posts: await interestMatchRequestRepository.listMyInterestPosts(actor.id) }),

  updateMyPostStatus: async (actor: AuthPrincipal, id: string, action: unknown) => {
    if (!["publish", "unpublish", "draft", "delete"].includes(String(action))) throw badRequest("action must be publish, unpublish, draft, or delete.");
    const post = await interestMatchRequestRepository.updateMyInterestStatus({ userId: actor.id, id, action: action as "publish" | "unpublish" | "draft" | "delete" });
    return { ok: true, post, message: "Interest post updated." };
  },

  create: async (actor: AuthPrincipal, body: Record<string, unknown>) => {
    if (!isVerified(actor)) throw forbidden("Verified account required before sending a matched request.");
    const interestId = typeof body.interestId === "string" ? body.interestId.trim() : typeof body.interest_id === "string" ? body.interest_id.trim() : "";
    if (!interestId) throw badRequest("interest_id is required.");
    const requesterRole = interestMatchRequestRepository.assertRole(body.requesterRole ?? body.requester_role);
    const message = interestMatchRequestRepository.cleanMessage(body.message);
    const request = await interestMatchRequestRepository.create({ actor, interestId, requesterRole, message });
    await safeDispatch({ userId: request.interestOwnerUserId, notificationType: "match_proposed", channel: "in_app", title: request.interest.title });
    return { ok: true, request: redactMemberRequest(request), message: "Matched request sent to the interest owner for review." };
  },

  listSent: async (actor: AuthPrincipal) => ({ ok: true, requests: (await interestMatchRequestRepository.listSent(actor.id)).map(redactMemberRequest) }),

  listReceived: async (actor: AuthPrincipal) => ({ ok: true, requests: (await interestMatchRequestRepository.listReceived(actor.id)).map(redactMemberRequest) }),

  cancel: async (actor: AuthPrincipal, id: string) => ({ ok: true, request: redactMemberRequest(await interestMatchRequestRepository.cancel({ id, userId: actor.id })), message: "Matched request cancelled." }),

  ownerDecision: async (actor: AuthPrincipal, id: string, body: Record<string, unknown>) => {
    const action = body.action === "approve" ? "approve" : body.action === "reject" ? "reject" : null;
    if (!action) throw badRequest("action must be approve or reject.");
    const note = typeof body.note === "string" ? body.note.trim() : null;
    const request = await interestMatchRequestRepository.ownerDecision({ id, ownerUserId: actor.id, action, note });
    await safeDispatch({ userId: request.requesterUserId, notificationType: "match_proposed", channel: "in_app", title: request.interest.title });
    return { ok: true, request: redactMemberRequest(request), message: action === "approve" ? "Matched request sent to admin for manual processing." : "Matched request rejected." };
  },

  listAdmin: async () => ({ ok: true, requests: await interestMatchRequestRepository.listAdmin() }),

  adminUpdate: async (actor: AuthPrincipal, id: string, body: Record<string, unknown>, ipAddress?: string) => {
    const adminStatus = typeof body.adminStatus === "string" ? body.adminStatus : typeof body.admin_status === "string" ? body.admin_status : "";
    if (!adminStatuses.has(adminStatus as InterestMatchAdminStatus)) throw badRequest("admin_status must be pending_review, in_progress, approved, rejected, or closed.");
    const note = typeof body.note === "string" ? body.note.trim() : typeof body.adminNote === "string" ? body.adminNote.trim() : typeof body.admin_note === "string" ? body.admin_note.trim() : null;
    const request = await interestMatchRequestRepository.adminUpdate({ id, actor, adminStatus: adminStatus as InterestMatchAdminStatus, note, ipAddress });
    await safeDispatch({ userId: request.requesterUserId, notificationType: "match_proposed", channel: "in_app", title: request.interest.title });
    return { ok: true, request, message: "Interest matched request status updated." };
  }
};
