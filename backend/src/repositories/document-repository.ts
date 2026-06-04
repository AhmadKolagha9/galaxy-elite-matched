import { env } from "../config/env.js";
import { query, withTransaction, type Queryable } from "../db/pool.js";
import type { DocumentUploadRecord, PublicDocumentUploadRecord, DocumentType, AllowedDocumentMimeType } from "../domain/documents.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest, notFound } from "../http/errors.js";
import { recordAdminAction } from "./admin-action-repository.js";

type DocumentRow = {
  id: string;
  owner_user_id: string;
  related_object_type: string;
  related_object_id: string;
  document_type: DocumentType;
  storage_bucket: string;
  storage_path: string;
  original_filename: string;
  mime_type: AllowedDocumentMimeType;
  file_size: string | number;
  expiry_date: string | null;
  verification_status: "under_review" | "verified" | "failed" | "expired";
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

const toRecord = (row: DocumentRow): DocumentUploadRecord => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  relatedObjectType: row.related_object_type,
  relatedObjectId: row.related_object_id,
  documentType: row.document_type,
  storageBucket: row.storage_bucket,
  storagePath: row.storage_path,
  originalFilename: row.original_filename,
  mimeType: row.mime_type,
  fileSize: Number(row.file_size),
  expiryDate: row.expiry_date ?? undefined,
  verificationStatus: row.verification_status,
  verifiedBy: row.verified_by ?? undefined,
  verifiedAt: row.verified_at ?? undefined,
  rejectionReason: row.rejection_reason ?? undefined,
  createdAt: new Date(row.created_at).toISOString()
});

const toPublicRecord = (record: DocumentUploadRecord): PublicDocumentUploadRecord => {
  const { storageBucket: _storageBucket, storagePath: _storagePath, ...safeRecord } = record;
  return safeRecord;
};

const selectDocumentColumns = `
  id,
  owner_user_id,
  related_object_type,
  related_object_id,
  document_type,
  storage_bucket,
  storage_path,
  original_filename,
  mime_type,
  file_size,
  expiry_date,
  verification_status,
  verified_by,
  verified_at,
  rejection_reason,
  created_at
`;

export const documentRepository = {
  createUploadRecord: async (input: {
    ownerUserId: string;
    relatedObjectType: string;
    relatedObjectId: string;
    documentType: DocumentType;
    storagePath: string;
    originalFilename: string;
    mimeType: AllowedDocumentMimeType;
    fileSize: number;
    expiryDate?: string;
  }) => {
    const result = await query<DocumentRow>(
      `insert into document_uploads (
        owner_user_id,
        related_object_type,
        related_object_id,
        document_type,
        storage_bucket,
        storage_path,
        original_filename,
        mime_type,
        file_size,
        expiry_date,
        verification_status
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?0, 'under_review')
      returning ${selectDocumentColumns}`,
      [
        input.ownerUserId,
        input.relatedObjectType,
        input.relatedObjectId,
        input.documentType,
        env.uploadBucket,
        input.storagePath,
        input.originalFilename,
        input.mimeType,
        input.fileSize,
        input.expiryDate ?? null
      ]
    );
    return toRecord(result.rows[0]);
  },
  list: async () => {
    const result = await query<DocumentRow>(
      `select ${selectDocumentColumns}
       from document_uploads order by created_at desc limit 250`
    );
    return result.rows.map(toRecord).map(toPublicRecord);
  },
  findPrivateById: async (id: string) => {
    const result = await query<DocumentRow>(`select ${selectDocumentColumns} from document_uploads where id = ? limit 1`, [id]);
    if (!result.rows[0]) throw notFound("Document not found.");
    return toRecord(result.rows[0]);
  },
  logView: async (input: { actor: AuthPrincipal; document: DocumentUploadRecord; ipAddress?: string }) =>
    withTransaction(async (client) => {
      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "document_view_signed_url",
        objectType: "document_upload",
        objectId: input.document.id,
        newStatus: input.document.verificationStatus,
        note: `Generated signed view URL for ${input.document.documentType}.`,
        ipAddress: input.ipAddress
      });
    }),
  verify: async (input: { actor: AuthPrincipal; id: string; status: "verified" | "failed"; rejectionReason?: string; ipAddress?: string }) => {
    if (input.status === "failed" && !input.rejectionReason?.trim()) {
      throw badRequest("rejection_reason is required when status is failed.");
    }

    return withTransaction(async (client) => {
      const beforeResult = await client.query<DocumentRow>(`select ${selectDocumentColumns} from document_uploads where id = ? for update`, [input.id]);
      const before = beforeResult.rows[0];
      if (!before) throw notFound("Document not found.");

      const result = await client.query<DocumentRow>(
        `update document_uploads
         set verification_status = ?,
             verified_by = ?,
             verified_at = now(),
             rejection_reason = ?
         where id = ?
         returning ${selectDocumentColumns}`,
        [input.status, input.actor.isServiceAccount ? null : input.actor.id, input.status === "failed" ? input.rejectionReason : null, input.id]
      );
      const row = result.rows[0];

      await recordAdminAction(client, {
        actor: input.actor,
        actionType: "document_verify",
        objectType: "document_upload",
        objectId: input.id,
        previousStatus: before.verification_status,
        newStatus: input.status,
        note: input.status === "failed" ? input.rejectionReason : `Document ${row.document_type} verified.`,
        ipAddress: input.ipAddress
      });

      const complianceNotes = input.status === "failed" ? input.rejectionReason : "Document reviewed and verified.";
      const completedBy = input.actor.isServiceAccount ? null : input.actor.id;

      await client.query(
        `insert into compliance_checks (object_type, object_id, check_type, status, notes, completed_by, completed_at)
         values (?, ?, ?, ?, ?, ?, now())`,
        [
          "document_upload",
          input.id,
          row.document_type,
          input.status,
          complianceNotes,
          completedBy
        ]
      );

      return toPublicRecord(toRecord(row));
    });
  }
};
