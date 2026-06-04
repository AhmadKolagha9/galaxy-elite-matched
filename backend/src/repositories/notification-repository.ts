import { query, type Queryable } from "../db/pool.js";
import type { NotificationRecord, NotificationChannel, NotificationStatus, NotificationType } from "../domain/notifications.js";

export type NotificationRow = {
  id: string;
  user_id: string | null;
  notification_type: string;
  channel: string;
  subject: string;
  body: string;
  status: string;
  provider_message_id: string | null;
  error_message: string | null;
  sent_at: string | Date | null;
  created_at: string | Date;
};

const selectColumns = "id, user_id, notification_type, channel, subject, body, status, provider_message_id, error_message, sent_at, created_at";

export const toNotificationRecord = (row: NotificationRow): NotificationRecord => ({
  id: row.id,
  userId: row.user_id,
  notificationType: row.notification_type as NotificationType,
  channel: row.channel as NotificationChannel,
  subject: row.subject,
  body: row.body,
  status: row.status as NotificationStatus,
  providerMessageId: row.provider_message_id,
  errorMessage: row.error_message,
  sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : null,
  createdAt: new Date(row.created_at).toISOString()
});

export const notificationRepository = {
  listForUser: async (userId: string) => {
    const result = await query<NotificationRow>(`select ${selectColumns} from notifications where user_id = ? order by created_at desc limit 100`, [userId]);
    return result.rows.map(toNotificationRecord);
  },

  listAll: async () => {
    const result = await query<NotificationRow>(`select ${selectColumns} from notifications order by created_at desc limit 250`);
    return result.rows.map(toNotificationRecord);
  },

  createPending: async (
    client: Queryable,
    data: { userId?: string | null; notificationType: NotificationType; channel: NotificationChannel; subject: string; body: string }
  ) => {
    const result = await client.query<NotificationRow>(
      `insert into notifications (user_id, notification_type, channel, subject, body, status)
       values (?, ?, ?, ?, ?, 'pending') returning ${selectColumns}`,
      [data.userId ?? null, data.notificationType, data.channel, data.subject, data.body]
    );
    return toNotificationRecord(result.rows[0]);
  },

  markSent: async (client: Queryable, id: string, providerMessageId?: string | null) => {
    const result = await client.query<NotificationRow>(
      `update notifications
       set status = 'sent', sent_at = current_timestamp, provider_message_id = ?, error_message = null
       where id = ? returning ${selectColumns}`,
      [providerMessageId ?? null, id]
    );
    return toNotificationRecord(result.rows[0]);
  },

  markFailed: async (client: Queryable, id: string, errorMessage: string) => {
    const result = await client.query<NotificationRow>(
      `update notifications
       set status = 'failed', error_message = left(?, 500)
       where id = ? returning ${selectColumns}`,
      [errorMessage, id]
    );
    return toNotificationRecord(result.rows[0]);
  },

  findUserEmail: async (userId: string) => {
    const result = await query<{ email: string | null }>("select email from profiles where user_id = ? limit 1", [userId]);
    return result.rows[0]?.email ?? null;
  }
};
