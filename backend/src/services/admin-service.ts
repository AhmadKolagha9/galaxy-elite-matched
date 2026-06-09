import { withTransaction } from "../db/pool.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import type { ApprovalStatus, PublicStatus, VerificationStatus } from "../domain/status.js";
import { badRequest } from "../http/errors.js";
import { recordAdminAction } from "../repositories/admin-action-repository.js";
import {
  findSubmissionById,
  getAdminSummary,
  listAdminCollections,
  listAdminSubmissions,
  normalizeAdminApproval,
  normalizePublicStatus,
  normalizeVerificationStatus,
  updateSubmissionStatus
} from "../repositories/submission-repository.js";


const listPrivateOpportunitySubmissions = async (filters: { approvalStatus?: string }) => {
  const [availability, investor] = await Promise.all([
    listAdminSubmissions({ type: "availability", approvalStatus: filters.approvalStatus }),
    listAdminSubmissions({ type: "investor", approvalStatus: filters.approvalStatus })
  ]);
  return [...availability, ...investor].sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
};

const actionPatch: Record<string, Partial<{ approvalStatus: ApprovalStatus; publicStatus: PublicStatus; verificationStatus: VerificationStatus }>> = {
  approve: { approvalStatus: "approved" },
  reject: { approvalStatus: "rejected", publicStatus: "hidden" },
  "request-documents": { approvalStatus: "documents_requested", publicStatus: "hidden", verificationStatus: "under_review" },
  "compliance-hold": { approvalStatus: "compliance_hold", publicStatus: "hidden", verificationStatus: "under_review" },
  archive: { approvalStatus: "archived", publicStatus: "archived" },
  "under-verification": { approvalStatus: "under_verification", publicStatus: "hidden", verificationStatus: "under_review" },
  "mark-verified": { approvalStatus: "approved", verificationStatus: "verified" }
};

export const adminService = {
  summary: getAdminSummary,
  collections: listAdminCollections,
  list: listAdminSubmissions,
  privateOpportunities: listPrivateOpportunitySubmissions,
  detail: findSubmissionById,
  decide: async (input: {
    actor: AuthPrincipal;
    id: string;
    approvalStatus: string;
    publicStatus: string;
    verificationLevel: string;
    note?: string;
    ipAddress?: string;
  }) => {
    const approvalStatus = normalizeAdminApproval(input.approvalStatus);
    const publicStatus = normalizePublicStatus(input.publicStatus);
    const verificationStatus = normalizeVerificationStatus(input.verificationLevel, input.approvalStatus);
    return withTransaction(async (client) => {
      const before = await findSubmissionById(input.id);
      const record = await updateSubmissionStatus(client, input.id, { approvalStatus, publicStatus, verificationStatus });
      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "decision",
        objectType: before.type,
        objectId: input.id,
        previousStatus: String(before.record.approvalStatusRaw),
        newStatus: approvalStatus,
        note: input.note,
        ipAddress: input.ipAddress
      });
      return { ok: true, id: input.id, record };
    });
  },
  action: async (input: { actor: AuthPrincipal; id: string; action: string; note?: string; publicStatus?: string; ipAddress?: string }) => {
    const patch = { ...actionPatch[input.action] };
    if (input.action === "approve" && input.publicStatus) patch.publicStatus = normalizePublicStatus(input.publicStatus);
    if (!patch) throw badRequest("Unsupported admin action.");
    return withTransaction(async (client) => {
      const before = await findSubmissionById(input.id);
      const record = await updateSubmissionStatus(client, input.id, patch);
      await recordAdminAction(client, {
        actor: input.actor,
        actionType: input.action,
        objectType: before.type,
        objectId: input.id,
        previousStatus: String(before.record.approvalStatusRaw),
        newStatus: String(patch.approvalStatus ?? before.record.approvalStatusRaw),
        note: input.note,
        ipAddress: input.ipAddress
      });
      return { ok: true, id: input.id, record };
    });
  }
};
