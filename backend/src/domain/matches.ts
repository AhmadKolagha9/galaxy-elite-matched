export const dealFlowStages = [
  "interest_received",
  "response_received",
  "identity_check",
  "authority_check",
  "match_proposed",
  "mutual_approval",
  "match_room_opened",
  "viewing_meeting",
  "offer_negotiation",
  "agreement_executed",
  "completed"
] as const;

export type DealFlowStage = (typeof dealFlowStages)[number];

export const stageRank = (stage: DealFlowStage) => dealFlowStages.indexOf(stage) + 1;
export const isDealFlowStage = (value: string): value is DealFlowStage => dealFlowStages.includes(value as DealFlowStage);
export const canRevealContactAtStage = (stage: DealFlowStage) => stageRank(stage) >= stageRank("mutual_approval");
export const canAdvanceStage = (currentStage: DealFlowStage, nextStage: DealFlowStage) => Math.abs(stageRank(nextStage) - stageRank(currentStage)) <= 1;

export type MatchObjectType = "interest_signal" | "investor_post" | "private_availability" | "verified_listing_request";

export type MatchDemandCandidate = {
  objectType: Extract<MatchObjectType, "interest_signal" | "investor_post">;
  id: string;
  userId: string | null;
  country?: string | null;
  areaCity?: string | null;
  propertyCategory?: string | null;
  propertyType?: string | null;
  marketSegment?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetLabel?: string | null;
  timeline?: string | null;
  acceptsDirectOwner?: boolean | null;
  acceptsLandlord?: boolean | null;
  acceptsDeveloper?: boolean | null;
  acceptsAgent?: boolean | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export type MatchSupplyCandidate = {
  objectType: Extract<MatchObjectType, "private_availability" | "verified_listing_request">;
  id: string;
  userId: string | null;
  submitterRole?: string | null;
  country?: string | null;
  areaCity?: string | null;
  propertyCategory?: string | null;
  propertyType?: string | null;
  marketSegment?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceLabel?: string | null;
  availabilityDate?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export type MatchScoreBreakdown = {
  location: number;
  financial: number;
  property: number;
  interaction: number;
  timeline: number;
};

export type EvaluatedMatch = {
  demand: MatchDemandCandidate;
  supply: MatchSupplyCandidate;
  score: number;
  reason: string;
  breakdown: MatchScoreBreakdown;
};

export type MatchRequestRecord = {
  id: string;
  sourceObjectType: MatchObjectType;
  sourceObjectId: string;
  targetObjectType: MatchObjectType;
  targetObjectId: string;
  matchScore: number | null;
  matchReason: string | null;
  requestedBy: string | null;
  status: string;
  adminStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type MatchRoomParticipantRecord = {
  id: string;
  matchRoomId: string;
  userId: string;
  roleInRoom: string;
  approvalStatus: string;
  contactUnlockApproved: boolean;
  contactUnlockApprovedAt?: string;
  approvedAt?: string;
  createdAt: string;
};

export type MatchRoomRecord = {
  id: string;
  matchRequestId: string;
  status: string;
  openedBy?: string;
  openedAt?: string;
  contactUnlocked: boolean;
  documentsUnlocked: boolean;
  currentStage: DealFlowStage;
  createdAt: string;
  updatedAt: string;
};
