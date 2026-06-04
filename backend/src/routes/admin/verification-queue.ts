import { Router } from "express";

import { asyncHandler } from "../../http/async-handler.js";
import { badRequest, notFound } from "../../http/errors.js";
import { requireCompliance } from "../../middleware/rbac.js";
import { query } from "../../db/pool.js";

export const adminVerificationQueueRouter = Router();

const uuidPattern = /^[0-9a-fA-F-]{36}$/;

type QueueRow = {
  id: string;
  email: string;
  primary_role: string;
  verification_status: string;
  submitted_at: string | Date | null;
  document_count: string | number;
  payment_mode: string | null;
  has_verification_files_attached: string | number | boolean | null;
};

type DetailRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  primary_role: string;
  verification_status: string;
  verification_review_note: string | null;
  submitted_at: string | Date | null;
  created_at: string | Date;
};

type DocumentRow = {
  id: string;
  document_type: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size: string | number | null;
  verification_status: string;
  created_at: string | Date;
};

const toIso = (value: string | Date | null | undefined) => value ? new Date(value).toISOString() : null;

adminVerificationQueueRouter.get(
  "/",
  requireCompliance,
  asyncHandler(async (_request, response) => {
    const result = await query<QueueRow>(
      `select
         u.id,
         u.email,
         u.primary_role,
         u.verification_status,
         min(d.created_at) as submitted_at,
         count(d.id) as document_count,
         coalesce(pa.preferred_payment_method, isg.preferred_payment_method) as payment_mode,
         coalesce(pa.has_verification_files_attached, 0) as has_verification_files_attached
       from users u
       join document_uploads d on d.owner_user_id = u.id and d.related_object_type = 'user_verification'
       left join (
         select
           user_id,
           substring_index(group_concat(preferred_payment_method order by created_at desc), ',', 1) as preferred_payment_method,
           max(case when has_verification_files_attached then 1 else 0 end) as has_verification_files_attached
         from private_availability
         group by user_id
       ) pa on pa.user_id = u.id
       left join (
         select
           user_id,
           substring_index(group_concat(preferred_payment_method order by created_at desc), ',', 1) as preferred_payment_method
         from interest_signals
         group by user_id
       ) isg on isg.user_id = u.id
       where u.verification_status = 'under_review'
       group by u.id, u.email, u.primary_role, u.verification_status, pa.preferred_payment_method, pa.has_verification_files_attached, isg.preferred_payment_method
       order by has_verification_files_attached desc, submitted_at asc, u.updated_at asc
       limit 250`
    );

    response.json({
      ok: true,
      rows: result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        primaryRole: row.primary_role,
        verificationStatus: row.verification_status,
        submittedAt: toIso(row.submitted_at),
        documentCount: Number(row.document_count),
        paymentMode: row.payment_mode ?? null,
        hasVerificationFilesAttached: row.has_verification_files_attached === true || row.has_verification_files_attached === 1 || row.has_verification_files_attached === "1"
      }))
    });
  })
);

adminVerificationQueueRouter.get(
  "/:id",
  requireCompliance,
  asyncHandler(async (request, response) => {
    if (!uuidPattern.test(request.params.id)) throw badRequest("User id must be a UUID.");

    const detail = await query<DetailRow>(
      `select
         u.id,
         u.email,
         u.full_name,
         u.phone,
         u.primary_role,
         u.verification_status,
         u.verification_review_note,
         min(d.created_at) as submitted_at,
         u.created_at
       from users u
       left join document_uploads d on d.owner_user_id = u.id and d.related_object_type = 'user_verification'
       where u.id = ?
       group by u.id, u.email, u.full_name, u.phone, u.primary_role, u.verification_status, u.verification_review_note, u.created_at
       limit 1`,
      [request.params.id]
    );
    const user = detail.rows[0];
    if (!user) throw notFound("User not found.");

    const documents = await query<DocumentRow>(
      `select id, document_type, original_filename, mime_type, file_size, verification_status, created_at
       from document_uploads
       where owner_user_id = ? and related_object_type = 'user_verification'
       order by created_at desc`,
      [request.params.id]
    );

    response.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        primaryRole: user.primary_role,
        verificationStatus: user.verification_status,
        verificationReviewNote: user.verification_review_note,
        submittedAt: toIso(user.submitted_at),
        createdAt: toIso(user.created_at)
      },
      documents: documents.rows.map((document) => ({
        id: document.id,
        documentType: document.document_type,
        originalFilename: document.original_filename,
        mimeType: document.mime_type,
        fileSize: document.file_size === null ? null : Number(document.file_size),
        verificationStatus: document.verification_status,
        createdAt: toIso(document.created_at)
      }))
    });
  })
);
