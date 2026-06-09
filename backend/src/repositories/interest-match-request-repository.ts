import { randomUUID } from "node:crypto";

import { query, withTransaction, type Queryable } from "../db/pool.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest, forbidden, notFound } from "../http/errors.js";
import { recordAdminAction } from "./admin-action-repository.js";

export const interestMatchRequesterRoles = ["the owner", "the landlord", "an agent", "Buyer", "tenant", "prospective tenant"] as const;
export type InterestMatchRequesterRole = (typeof interestMatchRequesterRoles)[number];
export type InterestMatchStatus = "pending_owner" | "owner_approved" | "owner_rejected" | "cancelled" | "admin_review" | "admin_processing" | "admin_approved" | "admin_rejected" | "closed";
export type InterestMatchAdminStatus = "not_sent" | "pending_review" | "in_progress" | "approved" | "rejected" | "closed";

export type InterestMatchRequestRecord = {
  id: string;
  interestSignalId: string;
  interestOwnerUserId: string;
  requesterUserId: string;
  requesterRole: InterestMatchRequesterRole;
  message: string;
  status: InterestMatchStatus;
  adminStatus: InterestMatchAdminStatus;
  ownerNote: string | null;
  adminNote: string | null;
  ownerReviewedAt: string | null;
  adminReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  interest: {
    title: string;
    referenceCode: string;
    country: string;
    areaCity: string;
    propertyType: string;
    marketSegment: string;
    publicStatus: string;
    approvalStatus: string;
  };
  requester?: {
    email?: string | null;
    fullName?: string | null;
    verificationStatus?: string | null;
  };
  owner?: {
    email?: string | null;
    fullName?: string | null;
  };
};

type InterestRow = {
  id: string;
  user_id: string;
  title: string;
  reference_code: string;
  country: string;
  area_city: string;
  property_type: string;
  market_segment: string;
  approval_status: string;
  public_status: string;
  verification_status: string;
  created_at: string | Date;
  updated_at: string | Date;
};

type InterestMatchRequestRow = {
  id: string;
  interest_signal_id: string;
  interest_owner_user_id: string;
  requester_user_id: string;
  requester_role: InterestMatchRequesterRole;
  message: string;
  status: InterestMatchStatus;
  admin_status: InterestMatchAdminStatus;
  owner_note: string | null;
  admin_note: string | null;
  owner_reviewed_at: string | Date | null;
  admin_reviewed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  interest_title: string;
  interest_reference_code: string;
  interest_country: string;
  interest_area_city: string;
  interest_property_type: string;
  interest_market_segment: string;
  interest_public_status: string;
  interest_approval_status: string;
  requester_email?: string | null;
  requester_full_name?: string | null;
  requester_verification_status?: string | null;
  owner_email?: string | null;
  owner_full_name?: string | null;
};

type MyInterestRow = InterestRow & {
  incoming_request_count: string | number;
};

const interestColumns = "id, user_id, title, reference_code, country, area_city, property_type, market_segment, approval_status, public_status, verification_status, created_at, updated_at";
const requestColumns = `
  imr.id,
  imr.interest_signal_id,
  imr.interest_owner_user_id,
  imr.requester_user_id,
  imr.requester_role,
  imr.message,
  imr.status,
  imr.admin_status,
  imr.owner_note,
  imr.admin_note,
  imr.owner_reviewed_at,
  imr.admin_reviewed_at,
  imr.created_at,
  imr.updated_at,
  i.title as interest_title,
  i.reference_code as interest_reference_code,
  i.country as interest_country,
  i.area_city as interest_area_city,
  i.property_type as interest_property_type,
  i.market_segment as interest_market_segment,
  i.public_status as interest_public_status,
  i.approval_status as interest_approval_status,
  requester.email as requester_email,
  requester.full_name as requester_full_name,
  requester.verification_status as requester_verification_status,
  owner.email as owner_email,
  owner.full_name as owner_full_name
`;

const requestFrom = `
  from interest_match_requests imr
  join interest_signals i on i.id = imr.interest_signal_id
  left join users requester on requester.id = imr.requester_user_id
  left join users owner on owner.id = imr.interest_owner_user_id
`;

const toIso = (value: string | Date | null | undefined) => value ? new Date(value).toISOString() : null;

const toInterestSummary = (row: MyInterestRow) => ({
  id: row.id,
  title: row.title,
  referenceCode: row.reference_code,
  country: row.country,
  areaCity: row.area_city,
  propertyType: row.property_type,
  marketSegment: row.market_segment,
  approvalStatus: row.approval_status,
  publicStatus: row.public_status,
  verificationStatus: row.verification_status,
  incomingRequestCount: Number(row.incoming_request_count ?? 0),
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at)
});

const toRecord = (row: InterestMatchRequestRow): InterestMatchRequestRecord => ({
  id: row.id,
  interestSignalId: row.interest_signal_id,
  interestOwnerUserId: row.interest_owner_user_id,
  requesterUserId: row.requester_user_id,
  requesterRole: row.requester_role,
  message: row.message,
  status: row.status,
  adminStatus: row.admin_status,
  ownerNote: row.owner_note,
  adminNote: row.admin_note,
  ownerReviewedAt: toIso(row.owner_reviewed_at),
  adminReviewedAt: toIso(row.admin_reviewed_at),
  createdAt: toIso(row.created_at)!,
  updatedAt: toIso(row.updated_at)!,
  interest: {
    title: row.interest_title,
    referenceCode: row.interest_reference_code,
    country: row.interest_country,
    areaCity: row.interest_area_city,
    propertyType: row.interest_property_type,
    marketSegment: row.interest_market_segment,
    publicStatus: row.interest_public_status,
    approvalStatus: row.interest_approval_status
  },
  requester: {
    email: row.requester_email ?? null,
    fullName: row.requester_full_name ?? null,
    verificationStatus: row.requester_verification_status ?? null
  },
  owner: {
    email: row.owner_email ?? null,
    fullName: row.owner_full_name ?? null
  }
});

const loadInterestForUpdate = async (client: Queryable, id: string) => {
  const result = await client.query<InterestRow>(`select ${interestColumns} from interest_signals where id = ? limit 1 for update`, [id]);
  const interest = result.rows[0];
  if (!interest) throw notFound("Interest post not found.");
  return interest;
};

const loadRequestForUpdate = async (client: Queryable, id: string) => {
  const result = await client.query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.id = ? limit 1 for update`, [id]);
  const row = result.rows[0];
  if (!row) throw notFound("Interest match request not found.");
  return row;
};

const assertRole = (value: unknown): InterestMatchRequesterRole => {
  if (typeof value === "string" && interestMatchRequesterRoles.includes(value as InterestMatchRequesterRole)) return value as InterestMatchRequesterRole;
  throw badRequest(`requester_role must be one of: ${interestMatchRequesterRoles.join(", ")}.`);
};

const cleanMessage = (value: unknown) => {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < 10) throw badRequest("message must be at least 10 characters.");
  if (text.length > 2000) throw badRequest("message must be 2000 characters or less.");
  return text;
};

export const interestMatchRequestRepository = {
  assertRole,
  cleanMessage,

  listMyInterestPosts: async (userId: string) => {
    const result = await query<MyInterestRow>(
      `select i.${interestColumns.replace(/, /g, ", i.")}, count(imr.id) as incoming_request_count
       from interest_signals i
       left join interest_match_requests imr on imr.interest_signal_id = i.id and imr.status not in ('cancelled', 'owner_rejected', 'closed')
       where i.user_id = ?
       group by i.id, i.user_id, i.title, i.reference_code, i.country, i.area_city, i.property_type, i.market_segment, i.approval_status, i.public_status, i.verification_status, i.created_at, i.updated_at
       order by i.updated_at desc
       limit 250`,
      [userId]
    );
    return result.rows.map(toInterestSummary);
  },

  updateMyInterestStatus: async (input: { userId: string; id: string; action: "publish" | "unpublish" | "draft" | "delete" }) =>
    withTransaction(async (client) => {
      const interest = await loadInterestForUpdate(client, input.id);
      if (interest.user_id !== input.userId) throw forbidden("You can only manage your own interest posts.");

      if (input.action === "publish" && interest.approval_status !== "approved") {
        throw badRequest("Only admin-approved interest posts can be published.");
      }

      const patch: Record<string, string> = input.action === "publish"
        ? { public_status: "open" }
        : input.action === "unpublish"
          ? { public_status: "hidden" }
          : input.action === "draft"
            ? { approval_status: "pending_review", public_status: "hidden", verification_status: "unverified" }
            : { approval_status: "archived", public_status: "archived" };

      const assignments = Object.keys(patch).map((key) => `${key} = ?`).join(", ");
      const values = [...Object.values(patch), input.userId, input.id];
      const result = await client.query<MyInterestRow>(
        `update interest_signals set ${assignments}, updated_at = current_timestamp where user_id = ? and id = ? returning ${interestColumns}, 0 as incoming_request_count`,
        values
      );
      return toInterestSummary(result.rows[0]);
    }),

  create: async (input: { actor: AuthPrincipal; interestId: string; requesterRole: InterestMatchRequesterRole; message: string }) =>
    withTransaction(async (client) => {
      const interest = await loadInterestForUpdate(client, input.interestId);
      if (interest.approval_status !== "approved" || !["open", "matching", "matched"].includes(interest.public_status)) {
        throw badRequest("This interest post is not open for match requests.");
      }
      if (!interest.user_id) throw badRequest("This interest post is missing an owner account.");
      if (interest.user_id === input.actor.id) throw badRequest("You cannot send a match request to your own interest post.");

      const duplicate = await client.query<{ id: string }>(
        `select id from interest_match_requests
         where interest_signal_id = ? and requester_user_id = ? and status in ('pending_owner', 'owner_approved', 'admin_review', 'admin_processing')
         limit 1`,
        [interest.id, input.actor.id]
      );
      if (duplicate.rows[0]) throw badRequest("You already have an active match request for this interest post.");

      const id = randomUUID();
      const result = await client.query<InterestMatchRequestRow>(
        `insert into interest_match_requests (id, interest_signal_id, interest_owner_user_id, requester_user_id, requester_role, message, status, admin_status)
         values (?, ?, ?, ?, ?, ?, 'pending_owner', 'not_sent') returning *`,
        [id, interest.id, interest.user_id, input.actor.id, input.requesterRole, input.message]
      );

      const created = result.rows[0];
      const joined = await client.query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.id = ? limit 1`, [created.id]);
      return toRecord(joined.rows[0]);
    }),

  listSent: async (userId: string) => {
    const result = await query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.requester_user_id = ? order by imr.created_at desc limit 250`, [userId]);
    return result.rows.map(toRecord);
  },

  listReceived: async (userId: string) => {
    const result = await query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.interest_owner_user_id = ? order by imr.created_at desc limit 250`, [userId]);
    return result.rows.map(toRecord);
  },

  cancel: async (input: { id: string; userId: string }) =>
    withTransaction(async (client) => {
      const current = await loadRequestForUpdate(client, input.id);
      if (current.requester_user_id !== input.userId) throw forbidden("You can only cancel your own match requests.");
      if (!["pending_owner", "owner_approved", "admin_review"].includes(current.status)) throw badRequest("This match request can no longer be cancelled.");

      const result = await client.query<InterestMatchRequestRow>(
        `update interest_match_requests set status = 'cancelled', admin_status = 'closed', updated_at = current_timestamp where requester_user_id = ? and id = ? returning *`,
        [input.userId, input.id]
      );
      const joined = await client.query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.id = ? limit 1`, [result.rows[0].id]);
      return toRecord(joined.rows[0]);
    }),

  ownerDecision: async (input: { id: string; ownerUserId: string; action: "approve" | "reject"; note?: string | null }) =>
    withTransaction(async (client) => {
      const current = await loadRequestForUpdate(client, input.id);
      if (current.interest_owner_user_id !== input.ownerUserId) throw forbidden("Only the interest owner can review this match request.");
      if (current.status !== "pending_owner") throw badRequest("This match request has already been reviewed by the interest owner.");

      const nextStatus = input.action === "approve" ? "admin_review" : "owner_rejected";
      const nextAdminStatus = input.action === "approve" ? "pending_review" : "closed";
      const result = await client.query<InterestMatchRequestRow>(
        `update interest_match_requests
         set status = ?, admin_status = ?, owner_note = ?, owner_reviewed_at = current_timestamp, updated_at = current_timestamp
         where interest_owner_user_id = ? and id = ? returning *`,
        [nextStatus, nextAdminStatus, input.note ?? null, input.ownerUserId, input.id]
      );
      const joined = await client.query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.id = ? limit 1`, [result.rows[0].id]);
      return toRecord(joined.rows[0]);
    }),

  listAdmin: async () => {
    const result = await query<InterestMatchRequestRow>(
      `select ${requestColumns} ${requestFrom}
       where imr.status in ('admin_review', 'admin_processing', 'admin_approved', 'admin_rejected') or imr.admin_status in ('pending_review', 'in_progress')
       order by imr.updated_at desc, imr.created_at desc
       limit 250`
    );
    return result.rows.map(toRecord);
  },

  adminUpdate: async (input: { id: string; actor: AuthPrincipal; adminStatus: InterestMatchAdminStatus; note?: string | null; ipAddress?: string }) =>
    withTransaction(async (client) => {
      const before = await loadRequestForUpdate(client, input.id);
      if (before.status === "pending_owner") throw badRequest("The interest owner must approve this request before admin processing.");

      const nextStatus: InterestMatchStatus = input.adminStatus === "in_progress"
        ? "admin_processing"
        : input.adminStatus === "approved"
          ? "admin_approved"
          : input.adminStatus === "rejected"
            ? "admin_rejected"
            : input.adminStatus === "closed"
              ? "closed"
              : "admin_review";

      const result = await client.query<InterestMatchRequestRow>(
        `update interest_match_requests
         set status = ?, admin_status = ?, admin_note = ?, admin_reviewed_at = current_timestamp, updated_at = current_timestamp
         where id = ? returning *`,
        [nextStatus, input.adminStatus, input.note ?? null, input.id]
      );

      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "interest_match_request_status_update",
        objectType: "interest_match_request",
        objectId: input.id,
        previousStatus: `${before.status}/${before.admin_status}`,
        newStatus: `${nextStatus}/${input.adminStatus}`,
        note: input.note ?? undefined,
        ipAddress: input.ipAddress
      });

      const joined = await client.query<InterestMatchRequestRow>(`select ${requestColumns} ${requestFrom} where imr.id = ? limit 1`, [result.rows[0].id]);
      return toRecord(joined.rows[0]);
    })
};
