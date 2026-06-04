import { randomUUID } from "node:crypto";

import { query, withTransaction, type Queryable } from "../db/pool.js";
import { canRevealContactAtStage, stageRank, type DealFlowStage, type MatchDemandCandidate, type MatchRequestRecord, type MatchRoomRecord, type MatchSupplyCandidate } from "../domain/matches.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest, forbidden, notFound } from "../http/errors.js";
import { recordAdminAction } from "./admin-action-repository.js";
import { assertStageTransition } from "../utils/match-scoring.js";

type MatchRequestRow = {
  id: string;
  source_object_type: string;
  source_object_id: string;
  target_object_type: string;
  target_object_id: string;
  match_score: string | number | null;
  match_reason: string | null;
  requested_by: string | null;
  status: string;
  admin_status: string;
  created_at: string;
  updated_at: string;
};

type MatchRoomRow = {
  id: string;
  match_request_id: string;
  status: string;
  opened_by: string | null;
  opened_at: string | null;
  contact_unlocked: boolean;
  documents_unlocked: boolean;
  current_stage: DealFlowStage;
  created_at: string;
  updated_at: string;
};

type ContactRow = { user_id: string | null; contact_name: string | null; contact_email: string | null; contact_phone: string | null };

type ParticipantRow = {
  id: string;
  match_room_id: string;
  user_id: string;
  role_in_room: string;
  approval_status: string;
  contact_unlock_approved: boolean;
  contact_unlock_approved_at: string | null;
  approved_at: string | null;
  created_at: string;
};

const toMatchRequest = (row: MatchRequestRow): MatchRequestRecord => ({
  id: row.id,
  sourceObjectType: row.source_object_type as never,
  sourceObjectId: row.source_object_id,
  targetObjectType: row.target_object_type as never,
  targetObjectId: row.target_object_id,
  matchScore: row.match_score === null ? null : Number(row.match_score),
  matchReason: row.match_reason,
  requestedBy: row.requested_by,
  status: row.status,
  adminStatus: row.admin_status,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString()
});

const toMatchRoom = (row: MatchRoomRow): MatchRoomRecord => ({
  id: row.id,
  matchRequestId: row.match_request_id,
  status: row.status,
  openedBy: row.opened_by ?? undefined,
  openedAt: row.opened_at ? new Date(row.opened_at).toISOString() : undefined,
  contactUnlocked: row.contact_unlocked,
  documentsUnlocked: row.documents_unlocked,
  currentStage: row.current_stage,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString()
});

const matchRequestSelect = `id, source_object_type, source_object_id, target_object_type, target_object_id, match_score, match_reason, requested_by, status, admin_status, created_at, updated_at`;
const matchRoomSelect = `id, match_request_id, status, opened_by, opened_at, contact_unlocked, documents_unlocked, current_stage, created_at, updated_at`;
const participantSelect = `id, match_room_id, user_id, role_in_room, approval_status, contact_unlock_approved, contact_unlock_approved_at, approved_at, created_at`;

const demandSql = `
  select 'interest_signal' as object_type, id, user_id, country, area_city, category as property_category, property_type, market_segment,
         price_min as budget_min, price_max as budget_max, null as budget_label, availability_date as timeline,
         true as accepts_direct_owner, true as accepts_landlord, true as accepts_developer, true as accepts_agent,
         null as contact_name, null as contact_email, null as contact_phone
  from interest_signals
  where approval_status = 'approved'
  union all
  select 'investor_post' as object_type, id, user_id, json_unquote(json_extract(countries, '$[0]')) as country, area_city,
         json_unquote(json_extract(property_categories, '$[0]')) as property_category,
         json_unquote(json_extract(property_types, '$[0]')) as property_type,
         json_unquote(json_extract(market_segments, '$[0]')) as market_segment,
         null as budget_min, null as budget_max, ticket_label as budget_label, timeline,
         accepts_direct_owner, false as accepts_landlord, accepts_developer, accepts_agent,
         contact_name, contact_email, contact_phone
  from investor_posts
  where approval_status = 'approved'
`;

const supplySql = `
  select 'private_availability' as object_type, id, user_id, user_role as submitter_role, country, area_city, category as property_category, property_type, market_segment,
         price_min, price_max, null as price_label, availability_date, null as contact_name, null as contact_email, null as contact_phone
  from private_availability
  where approval_status = 'approved'
  union all
  select 'verified_listing_request' as object_type, id, user_id, submitter_role, country, area_city, property_category, property_type, market_segment,
         null as price_min, null as price_max, price_label, availability_date, contact_name, contact_email, contact_phone
  from verified_listing_requests
  where approval_status = 'approved'
`;

const toDemand = (row: Record<string, unknown>): MatchDemandCandidate => ({
  objectType: row.object_type as MatchDemandCandidate["objectType"],
  id: String(row.id),
  userId: row.user_id ? String(row.user_id) : null,
  country: row.country as string | null,
  areaCity: row.area_city as string | null,
  propertyCategory: row.property_category as string | null,
  propertyType: row.property_type as string | null,
  marketSegment: row.market_segment as string | null,
  budgetMin: row.budget_min === null ? null : Number(row.budget_min),
  budgetMax: row.budget_max === null ? null : Number(row.budget_max),
  budgetLabel: row.budget_label as string | null,
  timeline: row.timeline as string | null,
  acceptsDirectOwner: Boolean(row.accepts_direct_owner),
  acceptsLandlord: Boolean(row.accepts_landlord),
  acceptsDeveloper: Boolean(row.accepts_developer),
  acceptsAgent: Boolean(row.accepts_agent),
  contactName: row.contact_name as string | null,
  contactEmail: row.contact_email as string | null,
  contactPhone: row.contact_phone as string | null
});

const toSupply = (row: Record<string, unknown>): MatchSupplyCandidate => ({
  objectType: row.object_type as MatchSupplyCandidate["objectType"],
  id: String(row.id),
  userId: row.user_id ? String(row.user_id) : null,
  submitterRole: row.submitter_role as string | null,
  country: row.country as string | null,
  areaCity: row.area_city as string | null,
  propertyCategory: row.property_category as string | null,
  propertyType: row.property_type as string | null,
  marketSegment: row.market_segment as string | null,
  priceMin: row.price_min === null ? null : Number(row.price_min),
  priceMax: row.price_max === null ? null : Number(row.price_max),
  priceLabel: row.price_label as string | null,
  availabilityDate: row.availability_date as string | null,
  contactName: row.contact_name as string | null,
  contactEmail: row.contact_email as string | null,
  contactPhone: row.contact_phone as string | null
});

const contactSql = (objectType: string) => {
  if (objectType === "interest_signal") return "select user_id, null as contact_name, null as contact_email, null as contact_phone from interest_signals where id = ?";
  if (objectType === "investor_post") return "select user_id, contact_name, contact_email, contact_phone from investor_posts where id = ?";
  if (objectType === "private_availability") return "select user_id, null as contact_name, null as contact_email, null as contact_phone from private_availability where id = ?";
  if (objectType === "verified_listing_request") return "select user_id, contact_name, contact_email, contact_phone from verified_listing_requests where id = ?";
  throw badRequest("Unsupported match object type.");
};

const loadContact = async (client: Queryable, objectType: string, objectId: string) => {
  const result = await client.query(contactSql(objectType), [objectId]);
  const row = result.rows[0] as { user_id: string | null; contact_name: string | null; contact_email: string | null; contact_phone: string | null } | undefined;
  if (!row) throw notFound(`Matched ${objectType} record not found.`);
  return row;
};

const participantPublic = (row: ParticipantRow) => ({
  id: row.id,
  matchRoomId: row.match_room_id,
  userId: row.user_id,
  roleInRoom: row.role_in_room,
  approvalStatus: row.approval_status,
  contactUnlockApproved: row.contact_unlock_approved,
  contactUnlockApprovedAt: row.contact_unlock_approved_at ? new Date(row.contact_unlock_approved_at).toISOString() : undefined,
  approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : undefined,
  createdAt: new Date(row.created_at).toISOString()
});

const redactContact = (contact: { contact_name: string | null; contact_email: string | null; contact_phone: string | null }, reveal: boolean) => reveal
  ? { name: contact.contact_name, email: contact.contact_email, phone: contact.contact_phone }
  : { name: null, email: null, phone: null };

export const matchRepository = {
  list: async () => (await query<MatchRequestRow>(`select ${matchRequestSelect} from match_requests order by created_at desc limit 250`)).rows.map(toMatchRequest),
  listCandidates: async () => {
    const [demand, supply] = await Promise.all([query<Record<string, unknown>>(demandSql), query<Record<string, unknown>>(supplySql)]);
    return { demand: demand.rows.map(toDemand), supply: supply.rows.map(toSupply) };
  },
  create: async (data: Record<string, unknown>, requestedBy?: string) => {
    const existing = await query<MatchRequestRow>(
      `select ${matchRequestSelect} from match_requests
       where source_object_type = ? and source_object_id = ? and target_object_type = ? and target_object_id = ?
       limit 1`,
      [data.sourceObjectType, data.sourceObjectId, data.targetObjectType, data.targetObjectId]
    );
    if (existing.rows[0]) {
      const result = await query<MatchRequestRow>(
        `update match_requests set match_score = ?, match_reason = ?, updated_at = current_timestamp where id = ? returning ${matchRequestSelect}`,
        [data.matchScore ?? null, data.matchReason ?? null, existing.rows[0].id]
      );
      return toMatchRequest(result.rows[0]);
    }

    const result = await query<MatchRequestRow>(
      `insert into match_requests (id, source_object_type, source_object_id, target_object_type, target_object_id, match_score, match_reason, requested_by, status, admin_status)
       values (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending_review') returning ${matchRequestSelect}`,
      [randomUUID(), data.sourceObjectType, data.sourceObjectId, data.targetObjectType, data.targetObjectId, data.matchScore ?? null, data.matchReason ?? null, requestedBy ?? null]
    );
    return toMatchRequest(result.rows[0]);
  },
  get: async (id: string) => {
    const row = (await query<MatchRequestRow>(`select ${matchRequestSelect} from match_requests where id = ?`, [id])).rows[0];
    return row ? toMatchRequest(row) : undefined;
  },
  updateStatus: async (id: string, data: Record<string, unknown>) => {
    const result = await query<MatchRequestRow>(
      `update match_requests set status = coalesce(?, status), admin_status = coalesce(?, admin_status), updated_at = current_timestamp where id = ? returning ${matchRequestSelect}`,
      [data.status ?? null, data.adminStatus ?? null, id]
    );
    return result.rows[0] ? toMatchRequest(result.rows[0]) : undefined;
  }
};

export const matchRoomRepository = {
  list: async () => (await query<MatchRoomRow>(`select ${matchRoomSelect} from match_rooms order by created_at desc limit 250`)).rows.map(toMatchRoom),
  createForMatchRequest: async (input: { matchRequestId: string; actor: AuthPrincipal; ipAddress?: string }) =>
    withTransaction(async (client) => {
      const matchResult = await client.query<MatchRequestRow>(`select ${matchRequestSelect} from match_requests where id = ? for update`, [input.matchRequestId]);
      const match = matchResult.rows[0];
      if (!match) throw notFound("Match request not found.");

      const source = await loadContact(client, match.source_object_type, match.source_object_id);
      const target = await loadContact(client, match.target_object_type, match.target_object_id);
      if (!source.user_id || !target.user_id) throw badRequest("Both matched records must have owner user IDs before opening a match room.");
      if (source.user_id === target.user_id) throw badRequest("A match room requires two distinct participant users.");

      const existingRoom = await client.query<MatchRoomRow>(`select ${matchRoomSelect} from match_rooms where match_request_id = ? limit 1`, [input.matchRequestId]);
      const room = existingRoom.rows[0] ?? (await client.query<MatchRoomRow>(
        `insert into match_rooms (id, match_request_id, status, opened_by, opened_at, current_stage)
         values (?, ?, 'active', ?, current_timestamp, 'interest_received') returning ${matchRoomSelect}`,
        [randomUUID(), input.matchRequestId, input.actor.isServiceAccount ? null : input.actor.id]
      )).rows[0];

      await client.query(
        `insert into match_room_participants (match_room_id, user_id, role_in_room, approval_status)
         values (?, ?, 'demand', 'pending'), (?, ?, 'supply', 'pending')
         on duplicate key update user_id = values(user_id)`,
        [room.id, source.user_id, room.id, target.user_id]
      );

      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "match_room_create",
        objectType: "match_room",
        objectId: room.id,
        newStatus: "interest_received",
        note: `Opened room for match request ${input.matchRequestId}.`,
        ipAddress: input.ipAddress
      });

      return toMatchRoom(room);
    }),
  get: async (id: string) => {
    const row = (await query<MatchRoomRow>(`select ${matchRoomSelect} from match_rooms where id = ?`, [id])).rows[0];
    return row ? toMatchRoom(row) : undefined;
  },
  listForParticipant: async (userId: string) => {
    const rooms = await query<MatchRoomRow & MatchRequestRow & { participant_id: string }>(
      `select mr.id, mr.match_request_id, mr.status, mr.opened_by, mr.opened_at, mr.contact_unlocked, mr.documents_unlocked, mr.current_stage, mr.created_at, mr.updated_at, mrp.id as participant_id
       from match_rooms mr
       join match_room_participants mrp on mrp.match_room_id = mr.id
       where mrp.user_id = ?
       order by mr.updated_at desc`,
      [userId]
    );

    const output = [];
    for (const row of rooms.rows) {
      const room = toMatchRoom(row);
      const match = await matchRepository.get(room.matchRequestId);
      if (!match) continue;
      const reveal = room.contactUnlocked && canRevealContactAtStage(room.currentStage);
      const [participants, sourceContact, targetContact] = await Promise.all([
        query<ParticipantRow>(`select ${participantSelect} from match_room_participants where match_room_id = ? order by role_in_room`, [room.id]),
        query<ContactRow>(contactSql(match.sourceObjectType), [match.sourceObjectId]),
        query<ContactRow>(contactSql(match.targetObjectType), [match.targetObjectId])
      ]);
      output.push({
        ...room,
        contactUnlocked: reveal,
        matchRequest: match,
        participants: participants.rows.map(participantPublic),
        contacts: {
          source: redactContact(sourceContact.rows[0], reveal),
          target: redactContact(targetContact.rows[0], reveal)
        }
      });
    }
    return output;
  },
  advanceStage: async (input: { id: string; actor: AuthPrincipal; nextStage: DealFlowStage; note?: string; ipAddress?: string }) =>
    withTransaction(async (client) => {
      const currentResult = await client.query<MatchRoomRow>(`select ${matchRoomSelect} from match_rooms where id = ? for update`, [input.id]);
      const current = currentResult.rows[0];
      if (!current) throw notFound("Match room not found.");
      assertStageTransition(current.current_stage, input.nextStage);

      const result = await client.query<MatchRoomRow>(
        `update match_rooms set current_stage = ?, updated_at = current_timestamp where id = ? returning ${matchRoomSelect}`,
        [input.nextStage, input.id]
      );
      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "match_room_stage_change",
        objectType: "match_room",
        objectId: input.id,
        previousStatus: current.current_stage,
        newStatus: input.nextStage,
        note: input.note,
        ipAddress: input.ipAddress
      });
      return toMatchRoom(result.rows[0]);
    }),
  unlockContact: async (input: { id: string; userId: string }) =>
    withTransaction(async (client) => {
      const roomResult = await client.query<MatchRoomRow>(`select ${matchRoomSelect} from match_rooms where id = ? for update`, [input.id]);
      const room = roomResult.rows[0];
      if (!room) throw notFound("Match room not found.");
      if (!canRevealContactAtStage(room.current_stage)) throw badRequest("Contact unlock is available only from mutual_approval stage onward.");

      const participantResult = await client.query<ParticipantRow>(`select ${participantSelect} from match_room_participants where match_room_id = ? and user_id = ? for update`, [input.id, input.userId]);
      if (!participantResult.rows[0]) throw forbidden("You are not a participant in this match room.");

      await client.query(
        `update match_room_participants
         set contact_unlock_approved = true,
             contact_unlock_approved_at = coalesce(contact_unlock_approved_at, current_timestamp),
             approval_status = 'approved',
             approved_at = coalesce(approved_at, current_timestamp)
         where match_room_id = ? and user_id = ?`,
        [input.id, input.userId]
      );

      const approvalCount = await client.query<{ total: string; approved: string }>(
        `select cast(count(*) as char) as total, cast(sum(case when contact_unlock_approved then 1 else 0 end) as char) as approved
         from match_room_participants where match_room_id = ?`,
        [input.id]
      );
      const counts = approvalCount.rows[0];
      const bothApproved = Number(counts.approved) >= 2 && Number(counts.approved) === Number(counts.total);
      const nextStage = bothApproved && stageRank(room.current_stage) < stageRank("match_room_opened") ? "match_room_opened" : room.current_stage;
      const updated = await client.query<MatchRoomRow>(
        `update match_rooms
         set contact_unlocked = ?,
             current_stage = ?,
             updated_at = current_timestamp
         where id = ? returning ${matchRoomSelect}`,
        [bothApproved, nextStage, input.id]
      );
      return { room: toMatchRoom(updated.rows[0]), contactUnlocked: bothApproved };
    })
};
