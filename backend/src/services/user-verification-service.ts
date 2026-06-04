import { withTransaction } from "../db/pool.js";
import type { AccountVerificationStatus } from "../domain/users.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest } from "../http/errors.js";
import { recordAdminAction } from "../repositories/admin-action-repository.js";
import { userRepository, type IdentityVerificationDocumentInput } from "../repositories/user-repository.js";
import { notificationService } from "./notification-service.js";

const notify = (input: { userId: string; status: "submitted" | AccountVerificationStatus }) => {
  const notificationType = input.status === "verified"
    ? "identity_verified"
    : input.status === "action_required" || input.status === "unverified"
      ? "identity_action_required"
      : "identity_verification_submitted";

  void notificationService
    .dispatch({ userId: input.userId, notificationType, channel: "in_app" })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Verification notification failed.";
      console.error("Verification notification failed", { userId: input.userId, notificationType, message });
    });
};

export const userVerificationService = {
  submit: async (input: { actor: AuthPrincipal; documents: IdentityVerificationDocumentInput[] }) => {
    if (!input.documents.length) throw badRequest("At least one verification document is required.");

    const result = await withTransaction(async (client) => {
      await userRepository.findByIdForUpdate(client, input.actor.id);
      const uploads = await userRepository.createIdentityVerificationUploads(client, {
        userId: input.actor.id,
        documents: input.documents
      });
      const user = await userRepository.updateVerificationStatus(client, {
        id: input.actor.id,
        status: "under_review",
        reviewedBy: null,
        note: "Identity verification documents submitted by user."
      });
      await userRepository.upsertProfile(client, user);
      await userRepository.ensureRoles(client, user.id, user.primaryRole);

      return { user, uploads };
    });

    notify({ userId: input.actor.id, status: "submitted" });

    return {
      ok: true,
      id: input.actor.id,
      status: result.user.verificationStatus,
      documents: result.uploads,
      message: "Verification documents submitted for review."
    };
  },

  reviewIdentity: async (input: {
    actor: AuthPrincipal;
    userId: string;
    status: AccountVerificationStatus;
    note?: string;
    ipAddress?: string;
  }) => {
    if (input.status === "action_required" && !input.note?.trim()) {
      throw badRequest("note is required when status is action_required.");
    }

    const result = await withTransaction(async (client) => {
      const before = await userRepository.findByIdForUpdate(client, input.userId);
      const reviewerId = input.actor.isServiceAccount ? null : input.actor.id;
      const user = await userRepository.updateVerificationStatus(client, {
        id: input.userId,
        status: input.status,
        reviewedBy: reviewerId,
        note: input.note ?? null
      });

      if (input.status === "verified") {
        await userRepository.updateIdentityDocumentStatuses(client, {
          userId: input.userId,
          status: "verified",
          reviewerId
        });
      }

      if (input.status === "action_required") {
        await userRepository.updateIdentityDocumentStatuses(client, {
          userId: input.userId,
          status: "failed",
          reviewerId,
          rejectionReason: input.note ?? "Additional identity verification action is required."
        });
      }

      await userRepository.upsertProfile(client, user);
      await userRepository.ensureRoles(client, user.id, user.primaryRole, reviewerId);
      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "verify_identity",
        objectType: "user",
        objectId: input.userId,
        previousStatus: before.verificationStatus,
        newStatus: input.status,
        note: input.note,
        ipAddress: input.ipAddress
      });

      await client.query(
        `insert into compliance_checks (object_type, object_id, check_type, status, notes, completed_by, completed_at)
         values ('user', ?, 'identity_verification', ?, ?, ?, current_timestamp)`,
        [input.userId, input.status, input.note ?? `Identity verification marked ${input.status}.`, reviewerId]
      );

      return { user, previousStatus: before.verificationStatus };
    });

    notify({ userId: input.userId, status: input.status });

    return {
      ok: true,
      id: input.userId,
      previousStatus: result.previousStatus,
      status: result.user.verificationStatus,
      user: result.user,
      message: `Identity verification status updated to ${result.user.verificationStatus}.`
    };
  }
};
