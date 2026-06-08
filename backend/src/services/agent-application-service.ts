import { env } from "../config/env.js";
import { withTransaction } from "../db/pool.js";
import type { DocumentType } from "../domain/documents.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest } from "../http/errors.js";
import { agentApplicationRepository, type AgentApplicationDocument } from "../repositories/agent-application-repository.js";
import { recordAdminAction } from "../repositories/admin-action-repository.js";
import { userRepository, type IdentityVerificationDocumentInput } from "../repositories/user-repository.js";

const requiredDocumentTypes = new Set<DocumentType>(["owner_id", "broker_licence"]);

type AgentApplicationPayload = {
  companyName?: string | null;
  brokerLicenceNumber: string;
  country: string;
  notes?: string | null;
};

type AgentApplicationSubmitPayload = AgentApplicationPayload & {
  documents: IdentityVerificationDocumentInput[];
};

const cleanText = (value: string, label: string, maxLength: number) => {
  const text = value.trim();
  if (!text) throw badRequest(`${label} is required.`);
  if (text.length > maxLength) throw badRequest(`${label} must be ${maxLength} characters or less.`);
  return text;
};

const cleanOptionalText = (value: string | null | undefined, label: string, maxLength: number) => {
  const text = value?.trim() ?? "";
  if (text.length > maxLength) throw badRequest(`${label} must be ${maxLength} characters or less.`);
  return text || null;
};

const cleanNotes = (value?: string | null) => {
  const text = value?.trim() ?? "";
  if (text.length > 1000) throw badRequest("Notes must be 1000 characters or less.");
  return text || null;
};

const normalizePayload = (actor: AuthPrincipal, input: AgentApplicationPayload) => ({
  userId: actor.id,
  companyName: cleanOptionalText(input.companyName, "company_name", 255),
  brokerLicenceNumber: cleanText(input.brokerLicenceNumber, "broker_licence_number", 120),
  country: cleanText(input.country, "country", 120),
  notes: cleanNotes(input.notes)
});

const summarizeDocuments = (documents: AgentApplicationDocument[]) => ({
  hasOwnerId: documents.some((document) => document.documentType === "owner_id"),
  hasBrokerLicence: documents.some((document) => document.documentType === "broker_licence"),
  requiredComplete: [...requiredDocumentTypes].every((type) => documents.some((document) => document.documentType === type))
});

const validateSubmittedDocuments = (documents: IdentityVerificationDocumentInput[], userId: string) => {
  if (documents.length > 10) throw badRequest("A maximum of 10 agent application documents can be submitted at once.");

  for (const document of documents) {
    if (!requiredDocumentTypes.has(document.documentType as DocumentType)) {
      throw badRequest("Agent applications require only owner_id and broker_licence documents.");
    }
    if (!document.storagePath.startsWith(`private/${userId}/`) || document.storagePath.includes("..") || document.storagePath.startsWith("/")) {
      throw badRequest("Document storage_path must belong to the authenticated user's private document namespace.");
    }
  }
};

export const agentApplicationService = {
  getMine: async (actor: AuthPrincipal) => {
    const application = await agentApplicationRepository.findByUserId(actor.id);
    const documents = application ? await agentApplicationRepository.listDocuments(application.id) : [];
    return { ok: true, application, documents, documentState: summarizeDocuments(documents) };
  },

  saveMine: async (actor: AuthPrincipal, input: AgentApplicationPayload) => {
    const applicationInput = normalizePayload(actor, input);
    const application = await withTransaction(async (client) => {
      const user = await userRepository.findByIdForUpdate(client, actor.id);
      await userRepository.upsertProfile(client, user);
      return agentApplicationRepository.upsertDraft(client, applicationInput);
    });

    const documents = await agentApplicationRepository.listDocuments(application.id);
    return { ok: true, application, documents, documentState: summarizeDocuments(documents), message: "Agent application draft saved." };
  },

  submitMine: async (actor: AuthPrincipal, input: AgentApplicationSubmitPayload) => {
    validateSubmittedDocuments(input.documents, actor.id);
    const applicationInput = normalizePayload(actor, input);

    const result = await withTransaction(async (client) => {
      const user = await userRepository.findByIdForUpdate(client, actor.id);
      await userRepository.upsertProfile(client, user);
      const application = await agentApplicationRepository.submit(client, applicationInput);
      await agentApplicationRepository.updateDocumentLinks(client, {
        applicationId: application.id,
        userId: actor.id,
        storagePaths: input.documents.map((document) => document.storagePath)
      });
      const documents = await agentApplicationRepository.listDocumentsForUpdate(client, application.id);
      const documentState = summarizeDocuments(documents);
      if (!documentState.requiredComplete) throw badRequest("Owner ID and broker licence documents are required before sending.");
      return { application, documents, documentState };
    });

    return {
      ok: true,
      application: result.application,
      documents: result.documents,
      documentState: result.documentState,
      message: "Agent application sent for compliance review."
    };
  },

  listPendingForAdmin: async () => ({ ok: true, rows: await agentApplicationRepository.listPending() }),

  getAdminDetail: async (id: string) => {
    const application = await agentApplicationRepository.findDetail(id);
    const documents = await agentApplicationRepository.listDocuments(id);
    return { ok: true, application, documents, documentState: summarizeDocuments(documents) };
  },

  review: async (input: { actor: AuthPrincipal; id: string; action: "approve" | "reject"; note?: string | null; ipAddress?: string }) => {
    if (input.action === "reject" && !input.note?.trim()) throw badRequest("rejection_reason is required when rejecting an agent application.");

    const result = await withTransaction(async (client) => {
      const before = await agentApplicationRepository.findByIdForUpdate(client, input.id);
      const reviewerId = input.actor.isServiceAccount ? null : input.actor.id;
      const documents = await agentApplicationRepository.listDocumentsForUpdate(client, before.id);
      const documentState = summarizeDocuments(documents);
      if (input.action === "approve" && !documentState.requiredComplete) {
        throw badRequest("Owner ID and broker licence documents are required before approval.");
      }

      const nextStatus = input.action === "approve" ? "approved" : "rejected";
      const application = await agentApplicationRepository.review(client, {
        id: before.id,
        status: nextStatus,
        note: input.note ?? (input.action === "approve" ? "Agent application approved." : null),
        reviewerId
      });

      await agentApplicationRepository.updateDocumentStatuses(client, {
        applicationId: application.id,
        status: input.action === "approve" ? "verified" : "failed",
        reviewerId,
        rejectionReason: input.action === "reject" ? input.note : null
      });

      const currentUser = await userRepository.findByIdForUpdate(client, before.userId);
      const user = input.action === "approve"
        ? await userRepository.promoteToVerifiedAgent(client, {
            id: before.userId,
            reviewedBy: reviewerId,
            note: input.note ?? "Agent application approved."
          })
        : currentUser;
      await userRepository.upsertProfile(client, user);
      await userRepository.ensureRoles(client, user.id, user.primaryRole, reviewerId);

      await recordAdminAction(client, {
        actor: input.actor,
        actionType: input.action === "approve" ? "approve_agent_application" : "reject_agent_application",
        objectType: "agent_application",
        objectId: application.id,
        previousStatus: before.status,
        newStatus: application.status,
        note: input.note ?? (input.action === "approve" ? "Agent account promoted to verified agent." : undefined),
        ipAddress: input.ipAddress
      });

      await client.query(
        `insert into compliance_checks (object_type, object_id, check_type, status, notes, completed_by, completed_at)
         values ('agent_application', ?, 'agent_account_upgrade', ?, ?, ?, current_timestamp)`,
        [application.id, application.status, input.note ?? `Agent application ${application.status}.`, reviewerId]
      );

      return { application, user };
    });

    return {
      ok: true,
      application: result.application,
      user: result.user,
      message: input.action === "approve" ? "Agent application approved and account promoted." : "Agent application rejected."
    };
  }
};

export const agentApplicationDocumentDefaults = { bucket: env.uploadBucket };
