import { query, type Queryable } from "../db/pool.js";
import type { NativeUserPrivateRecord, NativeUserRecord, AccountVerificationStatus } from "../domain/users.js";
import type { UserRole } from "../domain/status.js";
import { notFound } from "../http/errors.js";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  phone: string | null;
  primary_role: UserRole;
  verification_status: AccountVerificationStatus;
  is_profile_locked: 0 | 1 | boolean;
  verification_review_note: string | null;
  verified_at: string | Date | null;
  last_login_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type VerificationUploadRow = {
  id: string;
  owner_user_id: string;
  related_object_type: string;
  related_object_id: string;
  document_type: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size: string | number | null;
  verification_status: string;
  storage_path?: string;
  created_at: string | Date;
};

export type IdentityVerificationDocumentInput = {
  documentType: string;
  storageBucket: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  expiryDate?: string | null;
};

const selectUserColumns = `
  id,
  email,
  password_hash,
  full_name,
  phone,
  primary_role,
  verification_status,
  is_profile_locked,
  verification_review_note,
  verified_at,
  last_login_at,
  created_at,
  updated_at
`;

const selectVerificationUploadColumns = `
  id,
  owner_user_id,
  related_object_type,
  related_object_id,
  document_type,
  original_filename,
  mime_type,
  file_size,
  verification_status,
  storage_path,
  created_at
`;

const toIso = (value: string | Date | null | undefined) => (value ? new Date(value).toISOString() : null);

const toPrivateRecord = (row: UserRow): NativeUserPrivateRecord => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  fullName: row.full_name,
  phone: row.phone,
  primaryRole: row.primary_role,
  verificationStatus: row.verification_status,
  isProfileLocked: Boolean(row.is_profile_locked),
  verificationReviewNote: row.verification_review_note,
  verifiedAt: toIso(row.verified_at),
  lastLoginAt: toIso(row.last_login_at),
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString()
});

const toPublicRecord = (row: UserRow): NativeUserRecord => {
  const { passwordHash: _passwordHash, ...safeRecord } = toPrivateRecord(row);
  return safeRecord;
};

const uniqueRoles = (primaryRole: UserRole) =>
  Array.from(new Set<UserRole>(primaryRole === "user" ? ["user"] : ["user", primaryRole]));

export const userRepository = {
  createNativeUser: async (
    client: Queryable,
    input: { email: string; passwordHash: string; fullName?: string; phone?: string; primaryRole: UserRole }
  ) => {
    const result = await client.query<UserRow>(
      `insert into users (email, password_hash, full_name, phone, primary_role, verification_status, is_profile_locked)
       values (?, ?, ?, ?, ?, 'unverified', false)
       returning ${selectUserColumns}`,
      [input.email, input.passwordHash, input.fullName ?? null, input.phone ?? null, input.primaryRole]
    );
    return toPrivateRecord(result.rows[0]);
  },

  upsertProfile: async (client: Queryable, user: NativeUserRecord) => {
    await client.query(
      `insert into profiles (user_id, full_name, email, phone, primary_role, verification_level)
       values (?, ?, ?, ?, ?, ?)
       on duplicate key update
         full_name = values(full_name),
         email = values(email),
         phone = values(phone),
         primary_role = values(primary_role),
         verification_level = values(verification_level)`,
      [user.id, user.fullName ?? null, user.email, user.phone ?? null, user.primaryRole, user.verificationStatus]
    );
  },

  ensureRoles: async (client: Queryable, userId: string, primaryRole: UserRole, assignedBy?: string | null) => {
    for (const role of uniqueRoles(primaryRole)) {
      await client.query(
        `insert into user_roles (user_id, role, assigned_by)
         values (?, ?, ?)
         on duplicate key update role = values(role)`,
        [userId, role, assignedBy ?? null]
      );
    }
  },

  findPrivateByEmail: async (email: string) => {
    const result = await query<UserRow>(`select ${selectUserColumns} from users where email = ? limit 1`, [email]);
    return result.rows[0] ? toPrivateRecord(result.rows[0]) : null;
  },

  findById: async (id: string) => {
    const result = await query<UserRow>(`select ${selectUserColumns} from users where id = ? limit 1`, [id]);
    return result.rows[0] ? toPublicRecord(result.rows[0]) : null;
  },

  findByIdForUpdate: async (client: Queryable, id: string) => {
    const result = await client.query<UserRow>(`select ${selectUserColumns} from users where id = ? limit 1 for update`, [id]);
    if (!result.rows[0]) throw notFound("User not found.");
    return toPrivateRecord(result.rows[0]);
  },

  touchLogin: async (client: Queryable, id: string) => {
    const result = await client.query<UserRow>(
      `update users set last_login_at = current_timestamp where id = ? returning ${selectUserColumns}`,
      [id]
    );
    return toPublicRecord(result.rows[0]);
  },

  updateVerificationStatus: async (
    client: Queryable,
    input: { id: string; status: AccountVerificationStatus; reviewedBy?: string | null; note?: string | null }
  ) => {
    const result = await client.query<UserRow>(
      `update users
       set verification_status = ?,
           is_profile_locked = ?,
           verified_at = case when ? = 'verified' then current_timestamp else null end,
           verification_reviewed_by = ?,
           verification_review_note = ?
       where id = ?
       returning ${selectUserColumns}`,
      [input.status, input.status === "action_required", input.status, input.reviewedBy ?? null, input.note ?? null, input.id]
    );
    return toPublicRecord(result.rows[0]);
  },

  createIdentityVerificationUploads: async (client: Queryable, input: { userId: string; documents: IdentityVerificationDocumentInput[] }) => {
    const uploads = [];
    for (const document of input.documents) {
      const existing = await client.query<VerificationUploadRow>(
        `select ${selectVerificationUploadColumns}
         from document_uploads
         where owner_user_id = ? and storage_path = ?
         limit 1
         for update`,
        [input.userId, document.storagePath]
      );

      if (existing.rows[0]) {
        const result = await client.query<VerificationUploadRow>(
          `update document_uploads
           set related_object_type = 'user_verification',
               related_object_id = ?,
               document_type = ?,
               original_filename = ?,
               mime_type = ?,
               file_size = ?,
               expiry_date = ?,
               verification_status = 'under_review',
               rejection_reason = null
           where id = ?
           returning ${selectVerificationUploadColumns}`,
          [
            input.userId,
            document.documentType,
            document.originalFilename,
            document.mimeType,
            document.fileSize,
            document.expiryDate ?? null,
            existing.rows[0].id
          ]
        );
        uploads.push(result.rows[0]);
        continue;
      }

      const result = await client.query<VerificationUploadRow>(
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
        ) values (?, 'user_verification', ?, ?, ?, ?, ?, ?, ?, ?, 'under_review')
        returning ${selectVerificationUploadColumns}`,
        [
          input.userId,
          input.userId,
          document.documentType,
          document.storageBucket,
          document.storagePath,
          document.originalFilename,
          document.mimeType,
          document.fileSize,
          document.expiryDate ?? null
        ]
      );
      uploads.push(result.rows[0]);
    }
    return uploads.map((row) => ({
      id: row.id,
      ownerUserId: row.owner_user_id,
      relatedObjectType: row.related_object_type,
      relatedObjectId: row.related_object_id,
      documentType: row.document_type,
      originalFilename: row.original_filename,
      mimeType: row.mime_type,
      fileSize: row.file_size === null ? null : Number(row.file_size),
      verificationStatus: row.verification_status,
      createdAt: new Date(row.created_at).toISOString()
    }));
  },

  updateIdentityDocumentStatuses: async (client: Queryable, input: { userId: string; status: "verified" | "failed"; reviewerId?: string | null; rejectionReason?: string | null }) => {
    await client.query(
      `update document_uploads
       set verification_status = ?,
           verified_by = ?,
           verified_at = case when ? = 'verified' then current_timestamp else null end,
           rejection_reason = ?
       where owner_user_id = ?
         and related_object_type = 'user_verification'
         and verification_status = 'under_review'`,
      [input.status, input.reviewerId ?? null, input.status, input.rejectionReason ?? null, input.userId]
    );
  }
};
