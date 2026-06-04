import { query } from "../db/pool.js";

export type AuditActionRow = {
  id: string;
  admin_user_id: string | null;
  admin_email: string | null;
  action_type: string;
  object_type: string;
  object_id: string;
  previous_status: string | null;
  new_status: string | null;
  note: string | null;
  ip_address: string | null;
  created_at: string | Date;
};

const toAuditAction = (row: AuditActionRow) => ({
  id: row.id,
  adminUserId: row.admin_user_id,
  adminEmail: row.admin_email,
  actionType: row.action_type,
  targetObjectType: row.object_type,
  targetObjectId: row.object_id,
  previousStatus: row.previous_status,
  newStatus: row.new_status,
  note: row.note,
  ipAddress: row.ip_address,
  timestamp: new Date(row.created_at).toISOString(),
  createdAt: new Date(row.created_at).toISOString()
});

export const listAdminActions = async (limit = 250) => {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const result = await query<AuditActionRow>(
    `select id, admin_user_id, admin_email, action_type, object_type, object_id, previous_status, new_status, note, ip_address, created_at
     from admin_actions
     order by created_at desc
     limit ?`,
    [safeLimit]
  );
  return result.rows.map(toAuditAction);
};

