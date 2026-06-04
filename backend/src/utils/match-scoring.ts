import type { DealFlowStage, MatchDemandCandidate, MatchScoreBreakdown, MatchSupplyCandidate } from "../domain/matches.js";
import { canAdvanceStage, dealFlowStages, isDealFlowStage } from "../domain/matches.js";
import { badRequest } from "../http/errors.js";

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
const tokenize = (value: unknown) => normalize(value).split(/[^a-z0-9]+/).filter((part) => part.length > 1);

export const parseDealFlowStage = (value: unknown): DealFlowStage => {
  const text = String(value ?? "").trim();
  if (isDealFlowStage(text)) return text;
  throw badRequest(`Invalid next_stage. Allowed values: ${dealFlowStages.join(", ")}.`);
};

export const assertStageTransition = (currentStage: DealFlowStage, nextStage: DealFlowStage) => {
  if (!canAdvanceStage(currentStage, nextStage)) {
    throw badRequest(`Invalid stage transition from ${currentStage} to ${nextStage}. Deal stages must advance in chronological order.`);
  }
};

export const parseNumericRange = (label?: string | null): { min?: number; max?: number } => {
  if (!label) return {};
  const lower = label.toLowerCase().replace(/,/g, "");
  const multiplier = lower.includes("million") || /\bm\b/.test(lower) ? 1_000_000 : lower.includes("k") ? 1_000 : 1;
  const values = Array.from(lower.matchAll(/\d+(?:\.\d+)?/g)).map((match) => Number(match[0]) * multiplier).filter((value) => Number.isFinite(value));
  if (!values.length) return {};
  if (values.length === 1) return { min: values[0], max: values[0] };
  return { min: Math.min(...values), max: Math.max(...values) };
};

const rangeFrom = (min?: number | null, max?: number | null, label?: string | null) => {
  const parsed = parseNumericRange(label);
  return {
    min: typeof min === "number" ? min : parsed.min,
    max: typeof max === "number" ? max : parsed.max
  };
};

const overlapScore = (a: { min?: number; max?: number }, b: { min?: number; max?: number }) => {
  if (a.min === undefined || a.max === undefined || b.min === undefined || b.max === undefined) return 0.45;
  if (a.max < b.min || b.max < a.min) return 0;
  const overlapMin = Math.max(a.min, b.min);
  const overlapMax = Math.min(a.max, b.max);
  const overlap = Math.max(0, overlapMax - overlapMin);
  const span = Math.max(a.max, b.max) - Math.min(a.min, b.min);
  return span <= 0 ? 1 : Math.max(0.65, Math.min(1, overlap / span + 0.65));
};

const locationScore = (demand: MatchDemandCandidate, supply: MatchSupplyCandidate) => {
  let score = 0;
  if (normalize(demand.country) && normalize(demand.country) === normalize(supply.country)) score += 0.6;
  const demandArea = tokenize(demand.areaCity);
  const supplyArea = new Set(tokenize(supply.areaCity));
  const areaMatches = demandArea.filter((token) => supplyArea.has(token)).length;
  if (areaMatches && demandArea.length) score += 0.4 * (areaMatches / demandArea.length);
  return Math.min(1, score);
};

const propertyScore = (demand: MatchDemandCandidate, supply: MatchSupplyCandidate) => {
  let score = 0;
  if (normalize(demand.propertyType) && normalize(demand.propertyType) === normalize(supply.propertyType)) score += 0.65;
  if (normalize(demand.propertyCategory) && normalize(demand.propertyCategory) === normalize(supply.propertyCategory)) score += 0.2;
  if (normalize(demand.marketSegment) && normalize(demand.marketSegment) === normalize(supply.marketSegment)) score += 0.15;
  if (!score) {
    const demandTokens = new Set([...tokenize(demand.propertyType), ...tokenize(demand.marketSegment)]);
    const supplyTokens = [...tokenize(supply.propertyType), ...tokenize(supply.marketSegment)];
    const partial = supplyTokens.some((token) => demandTokens.has(token));
    return partial ? 0.45 : 0;
  }
  return Math.min(1, score);
};

const interactionScore = (demand: MatchDemandCandidate, supply: MatchSupplyCandidate) => {
  const role = normalize(supply.submitterRole);
  if (role.includes("developer")) return demand.acceptsDeveloper ? 1 : 0;
  if (role.includes("agent") || role.includes("broker")) return demand.acceptsAgent ? 1 : 0;
  if (role.includes("landlord")) return demand.acceptsLandlord ? 1 : 0;
  if (role.includes("owner")) return demand.acceptsDirectOwner ? 1 : 0;
  return 0.5;
};

const timelineToDays = (timeline?: string | null) => {
  const value = normalize(timeline);
  if (!value) return undefined;
  if (value.includes("ready") || value.includes("now")) return 30;
  if (value.includes("30")) return 30;
  if (value.includes("1") && value.includes("3")) return 90;
  if (value.includes("3") && value.includes("6")) return 180;
  if (value.includes("6+")) return 365;
  return 180;
};

const timelineScore = (demand: MatchDemandCandidate, supply: MatchSupplyCandidate) => {
  const days = timelineToDays(demand.timeline);
  if (!days || !supply.availabilityDate) return 0.5;
  const availability = new Date(supply.availabilityDate).getTime();
  if (Number.isNaN(availability)) return 0.5;
  const diffDays = Math.ceil((availability - Date.now()) / 86_400_000);
  if (diffDays <= days) return 1;
  if (diffDays <= days + 60) return 0.55;
  return 0.1;
};

export const scoreMatch = (demand: MatchDemandCandidate, supply: MatchSupplyCandidate) => {
  const breakdown: MatchScoreBreakdown = {
    location: locationScore(demand, supply),
    financial: overlapScore(rangeFrom(demand.budgetMin, demand.budgetMax, demand.budgetLabel), rangeFrom(supply.priceMin, supply.priceMax, supply.priceLabel)),
    property: propertyScore(demand, supply),
    interaction: interactionScore(demand, supply),
    timeline: timelineScore(demand, supply)
  };

  const score =
    breakdown.location * 0.3 +
    breakdown.financial * 0.25 +
    breakdown.property * 0.2 +
    breakdown.interaction * 0.15 +
    breakdown.timeline * 0.1;

  const reason = `location=${breakdown.location.toFixed(2)}, financial=${breakdown.financial.toFixed(2)}, property=${breakdown.property.toFixed(2)}, interaction=${breakdown.interaction.toFixed(2)}, timeline=${breakdown.timeline.toFixed(2)}`;
  return { score: Number(score.toFixed(4)), reason, breakdown };
};
