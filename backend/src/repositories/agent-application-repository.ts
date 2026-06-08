import type { Queryable } from "../db/pool.js";
import { query } from "../db/pool.js";
import type { AllowedDocumentMimeType, DocumentType } from "../domain/documents.js";
import { notFound } from "../http/errors.js";

export type AgentApplicationStatus = "draft" | "pending_review" | "approved" | "rejected";

export type AgentApplicationInput = {
  userId: string;
  companyName: string;
  brokerLicenceNumber: string;
  country: string;
  notes?: string | null;
};

export type AgentApplicationRecord = AgentApplicationInput & {
  id: string;
  status: AgentApplicationStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    fullName?: string | null;
    phone?: string | null;
    primaryRole: string;
    verificationStatus: string;
  };
};

export type AgentApplicationDocument = {
  id: string;
  documentType: DocumentType;
  originalFilename: string | null;
  mimeType: AllowedDocumentMimeType | null;
  fileSize: number | null;
  verificationStatus: string;
  createdAt: string | null;
};

type AgentApplicationRow = {
  id: string;
  user_id: string;
  company_name: string;
  broker_licence_number: string;
  country: string;
  notes: string | null;
  status: AgentApplicationStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | Date | null;
  submitted_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  primary_role?: string;
  verification_status?: string;
};

type DocumentRow = {
  id: string;
  document_type: DocumentType;
  original_filename: string | null;
  mime_type: AllowedDocumentMimeType | null;
  file_size: string | number | null;
  verification_status: string;
  created_at: string | Date | null;
};

const applicationColumns = `
  id,
  user_id,
  company_name,
  broker_licence_number,
  country,
  notes,
  status,
  review_note,
  reviewed_by,
  reviewed_at,
  submitted_at,
  created_at,
  updated_at
`;

const applicationColumnsWithAlias = `
  a.id,
  a.user_id,
  a.company_name,
  a.broker_licence_number,
  a.country,
  a.notes,
  a.status,
  a.review_note,
  a.reviewed_by,
  a.reviewed_at,
  a.submitted_at,
  a.created_at,
  a.updated_at
`;

const toIso = (value: string | Date | null | undefined) => value ? new Date(value).toISOString() : null;

const toRecord = (row: AgentApplicationRow): AgentApplicationRecord => ({
  id: row.id,
  userId: row.user_id,
  companyName: row.company_name,
  brokerLicenceNumber: row.broker_licence_number,
  country: row.country,
  notes: row.notes,
  status: row.status,
  reviewNote: row.review_note,
  reviewedBy: row.reviewed_by,
  reviewedAt: toIso(row.reviewed_at),
  submittedAt: toIso(row.submitted_at),
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
  user: row.email ? {
    email: row.email,
    fullName: row.full_name ?? null,
    phone: row.phone ?? null,
    primaryRole: row.primary_role ?? "user",
    verificationStatus: row.verification_status ?? "unverified"
  } : undefined
});

const toDocument = (row: DocumentRow): AgentApplicationDocument => ({
  id: row.id,
  documentType: row.document_type,
  originalFilename: row.original_filename,
  mimeType: row.mime_type,
  fileSize: row.file_size === null ? null : Number(row.file_size),
  verificationStatus: row.verification_status,
  createdAt: toIso(row.created_at)
});

export const agentApplicationRepository = {
  findByUserId: async (userId: string) => {
    const result = await query<AgentApplicationRow>(`select ${applicationColumns} from agent_applications where user_id = ? limit 1`, [userId]);
    return result.rows[0] ? toRecord(result.rows[0]) : null;
  },

  findByUserIdForUpdate: async (client: Queryable, userId: string) => {
    const result = await client.query<AgentApplicationRow>(`select ${applicationColumns} from agent_applications where user_id = ? limit 1 for update`, [userId]);
    return result.rows[0] ? toRecord(result.rows[0]) : null;
  },

  findByIdForUpdate: async (client: Queryable, id: string) => {
    const result = await client.query<AgentApplicationRow>(`select ${applicationColumns} from agent_applications where id = ? limit 1 for update`, [id]);
    if (!result.rows[0]) throw notFound("Agent application not found.");
    return toRecord(result.rows[0]);
  },

  upsertDraft: async (client: Queryable, input: AgentApplicationInput) => {
    const existing = await agentApplicationRepository.findByUserIdForUpdate(client, input.userId);
    if (existing) {
      const result = await client.query<AgentApplicationRow>(
        `update agent_applications
         set company_name = ?,
             broker_licence_number = ?,
             country = ?,
             notes = ?,
             status = case when status in ('approved', 'pending_review') then status else 'draft' end,
             review_note = case when status = 'rejected' then null else review_note end
         where user_id = ?
         returning ${applicationColumns}`,
        [input.companyName, input.brokerLicenceNumber, input.country, input.notes ?? null, input.userId]
      );
      return toRecord(result.rows[0]);
    }

    const result = await client.query<AgentApplicationRow>(
      `insert into agent_applications (user_id, company_name, broker_licence_number, country, notes, status)
       values (?, ?, ?, ?, ?, 'draft')
       returning ${applicationColumns}`,
      [input.userId, input.companyName, input.brokerLicenceNumber, input.country, input.notes ?? null]
    );
    return toRecord(result.rows[0]);
  },

  submit: async (client: Queryable, input: AgentApplicationInput) => {
    const application = await agentApplicationRepository.upsertDraft(client, input);
    const result = await client.query<AgentApplicationRow>(
      `update agent_applications
       set status = 'pending_review',
           submitted_at = current_timestamp,
           review_note = null,
           reviewed_by = null,
           reviewed_at = null
       where id = ?
       returning ${applicationColumns}`,
      [application.id]
    );
    return toRecord(result.rows[0]);
  },

  updateDocumentLinks: async (client: Queryable, input: { applicationId: string; userId: string; storagePaths: string[] }) => {
    for (const storagePath of input.storagePaths) {
      await client.query(
        `update document_uploads
         set related_object_type = 'agent_application',
             related_object_id = ?,
             verification_status = 'under_review',
             rejection_reason = null
         where owner_user_id = ? and storage_path = ?`,
        [input.applicationId, input.userId, storagePath]
      );
    }
  },

  listDocuments: async (applicationId: string) => {
    const result = await query<DocumentRow>(
      `select id, document_type, original_filename, mime_type, file_size, verification_status, created_at
       from document_uploads
       where related_object_type = 'agent_application' and related_object_id = ?
       order by created_at desc`,
      [applicationId]
    );
    return result.rows.map(toDocument);
  },

  listDocumentsForUpdate: async (client: Queryable, applicationId: string) => {
    const result = await client.query<DocumentRow>(
      `select id, document_type, original_filename, mime_type, file_size, verification_status, created_at
       from document_uploads
       where related_object_type = 'agent_application' and related_object_id = ?
       order by created_at desc
       for update`,
      [applicationId]
    );
    return result.rows.map(toDocument);
  },

  listPending: async () => {
    const result = await query<AgentApplicationRow & { document_count: string | number }>(
      `select ${applicationColumnsWithAlias},
              u.email,
              u.full_name,
              u.phone,
              u.primary_role,
              u.verification_status,
              count(d.id) as document_count
       from agent_applications a
       join users u on u.id = a.user_id
       left join document_uploads d on d.related_object_type = 'agent_application' and d.related_object_id = a.id
       where a.status = 'pending_review'
       group by a.id, a.user_id, a.company_name, a.broker_licence_number, a.country, a.notes, a.status, a.review_note, a.reviewed_by, a.reviewed_at, a.submitted_at, a.created_at, a.updated_at, u.email, u.full_name, u.phone, u.primary_role, u.verification_status
       order by a.submitted_at asc, a.updated_at asc
       limit 250`
    );
    return result.rows.map((row) => ({ ...toRecord(row), documentCount: Number(row.document_count ?? 0) }));
  },

  findDetail: async (id: string) => {
    const result = await query<AgentApplicationRow>(
      `select ${applicationColumnsWithAlias},
              u.email,
              u.full_name,
              u.phone,
              u.primary_role,
              u.verification_status
       from agent_applications a
       join users u on u.id = a.user_id
       where a.id = ?
       limit 1`,
      [id]
    );
    if (!result.rows[0]) throw notFound("Agent application not found.");
    return toRecord(result.rows[0]);
  },

  review: async (client: Queryable, input: { id: string; status: "approved" | "rejected"; note?: string | null; reviewerId?: string | null }) => {
    const result = await client.query<AgentApplicationRow>(
      `update agent_applications
       set status = ?,
           review_note = ?,
           reviewed_by = ?,
           reviewed_at = current_timestamp
       where id = ?
       returning ${applicationColumns}`,
      [input.status, input.note ?? null, input.reviewerId ?? null, input.id]
    );
    return toRecord(result.rows[0]);
  },

  updateDocumentStatuses: async (client: Queryable, input: { applicationId: string; status: "verified" | "failed"; reviewerId?: string | null; rejectionReason?: string | null }) => {
    await client.query(
      `update document_uploads
       set verification_status = ?,
           verified_by = ?,
           verified_at = case when ? = 'verified' then current_timestamp else null end,
           rejection_reason = ?
       where related_object_type = 'agent_application' and related_object_id = ?`,
      [input.status, input.reviewerId ?? null, input.status, input.rejectionReason ?? null, input.applicationId]
    );
  }
};
