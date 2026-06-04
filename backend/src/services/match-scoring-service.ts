import type { AuthPrincipal } from "../domain/submissions.js";
import type { EvaluatedMatch } from "../domain/matches.js";
import { badRequest } from "../http/errors.js";
import { recordAdminAction } from "../repositories/admin-action-repository.js";
import { matchRepository } from "../repositories/match-repository.js";
import { scoreMatch } from "../utils/match-scoring.js";
import { withTransaction } from "../db/pool.js";

const defaultMinimumScore = 0.65;
const defaultLimit = 100;

const parseMinimumScore = (value: unknown) => {
  if (value === undefined) return defaultMinimumScore;
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 1) throw badRequest("minimumScore must be a number between 0 and 1.");
  return score;
};

const parseLimit = (value: unknown) => {
  if (value === undefined) return defaultLimit;
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw badRequest("limit must be an integer between 1 and 500.");
  return limit;
};

export const matchScoringService = {
  evaluate: async (input: { actor: AuthPrincipal; minimumScore?: unknown; limit?: unknown; ipAddress?: string }) => {
    const minimumScore = parseMinimumScore(input.minimumScore);
    const limit = parseLimit(input.limit);
    const { demand, supply } = await matchRepository.listCandidates();
    const evaluated: EvaluatedMatch[] = [];

    for (const demandCandidate of demand) {
      for (const supplyCandidate of supply) {
        if (demandCandidate.userId && supplyCandidate.userId && demandCandidate.userId === supplyCandidate.userId) continue;
        const result = scoreMatch(demandCandidate, supplyCandidate);
        if (result.score >= minimumScore) {
          evaluated.push({
            demand: demandCandidate,
            supply: supplyCandidate,
            score: result.score,
            reason: result.reason,
            breakdown: result.breakdown
          });
        }
      }
    }

    evaluated.sort((a, b) => b.score - a.score);
    const selected = evaluated.slice(0, limit);
    const matches = [];

    for (const match of selected) {
      matches.push(await matchRepository.create({
        sourceObjectType: match.demand.objectType,
        sourceObjectId: match.demand.id,
        targetObjectType: match.supply.objectType,
        targetObjectId: match.supply.id,
        matchScore: match.score,
        matchReason: `${match.reason}; breakdown=${JSON.stringify(match.breakdown)}`
      }, input.actor.isServiceAccount ? undefined : input.actor.id));
    }

    await withTransaction(async (client) => {
      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "match_evaluate",
        objectType: "match_request",
        objectId: "00000000-0000-0000-0000-000000000000",
        newStatus: "pending",
        note: `Evaluated ${demand.length} demand rows against ${supply.length} supply rows. Created or refreshed ${matches.length} matches at threshold ${minimumScore}.`,
        ipAddress: input.ipAddress
      });
    });

    return {
      minimumScore,
      evaluatedPairs: evaluated.length,
      createdOrUpdated: matches.length,
      matches
    };
  }
};
