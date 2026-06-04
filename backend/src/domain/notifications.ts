export const notificationTypes = [
  "submission_received",
  "admin_alert_new_post",
  "identity_verification_submitted",
  "identity_verified",
  "identity_action_required",
  "submission_approved",
  "documents_requested",
  "compliance_hold",
  "match_proposed",
  "match_room_opened",
  "match_completed"
] as const;

export const notificationChannels = ["email", "in_app", "push"] as const;
export const notificationStatuses = ["pending", "sent", "failed"] as const;

export type NotificationType = (typeof notificationTypes)[number];
export type NotificationChannel = (typeof notificationChannels)[number];
export type NotificationStatus = (typeof notificationStatuses)[number];

export type NotificationRecord = {
  id: string;
  userId: string | null;
  notificationType: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  status: NotificationStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
};

const notificationTypeSet = new Set<string>(notificationTypes);
const notificationChannelSet = new Set<string>(notificationChannels);

export const isNotificationType = (value: string): value is NotificationType => notificationTypeSet.has(value);
export const isNotificationChannel = (value: string): value is NotificationChannel => notificationChannelSet.has(value);
