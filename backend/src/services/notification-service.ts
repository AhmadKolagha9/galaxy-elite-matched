import { Resend } from "resend";

import { env } from "../config/env.js";
import { getFirebaseMessaging } from "../db/firebase-admin.js";
import { withTransaction } from "../db/pool.js";
import type { NotificationChannel, NotificationRecord, NotificationType } from "../domain/notifications.js";
import { notificationRepository } from "../repositories/notification-repository.js";
import { renderSafeHtmlEmail, sanitizeNotificationText } from "../utils/notification-validation.js";

type DispatchInput = {
  userId?: string | null;
  toEmail?: string | null;
  notificationType: NotificationType;
  channel: NotificationChannel;
  title?: string;
};

type DispatchManyInput = {
  userIds: string[];
  notificationType: NotificationType;
  channels: NotificationChannel[];
  title?: string;
};

type ProviderResult = { id?: string | null };

type WebhookPayload = {
  table?: string;
  type?: string;
  event_type?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type NotificationTemplate = { subject: string; body: string };

const safeTitle = (title?: string) => title ? sanitizeNotificationText(title, "title", 160) : "your private match submission";

const notificationTemplate = (type: NotificationType, input: { title?: string } = {}): NotificationTemplate => {
  switch (type) {
    case "identity_verification_submitted":
      return {
        subject: "Identity Verification Submitted",
        body: "Your identity verification documents have entered the Galaxy Elite compliance review queue. We will update your account status after review."
      };
    case "identity_verified":
      return {
        subject: "Identity Verified",
        body: "Your Galaxy Elite account identity verification has been approved. Your profile is now marked verified for eligible private match workflows."
      };
    case "identity_action_required":
      return {
        subject: "Identity Verification Action Required",
        body: "Additional information is required to complete your identity verification. Please review your secure member profile before resubmitting documents."
      };
    case "submission_approved":
      return {
        subject: "Submission Approved",
        body: `Your Private Match submission titled ${safeTitle(input.title)} has passed our administrative evaluation framework. It has been securely introduced to the active matching matrix.`
      };
    case "documents_requested":
      return {
        subject: "Documents Requested",
        body: "Additional validation documents are required to complete your verification badge. Please open your secure member profile dashboard to view the compliance requests."
      };
    case "compliance_hold":
      return {
        subject: "Compliance Hold",
        body: "Your submission has been temporarily placed on hold by our regulatory auditing team. Review notes are available in your member panel."
      };
    case "match_proposed":
      return {
        subject: "Match Proposed",
        body: "A high-signal match profile has been compiled for your submission. Please open your dashboard's Match Board to evaluate details and authorize a mutual contact introduction link."
      };
    case "match_completed":
      return {
        subject: "Match Completed",
        body: "Congratulations! Transaction workflows for your matched property requirement have been successfully completed by Galaxy Elite Real Estate."
      };
    case "submission_received":
      return {
        subject: "Submission Received",
        body: "Your submission has entered the Galaxy Elite review queue. We will update you after the secure verification step."
      };
    case "admin_alert_new_post":
      return {
        subject: "New Private Match Submission",
        body: "A new submission entered the admin queue. Review it in the secure dashboard; private contact and unit details are not included in this alert."
      };
    case "match_room_opened":
      return {
        subject: "Secure Match Room Opened",
        body: "A secure match room has opened. Counterparty contact details remain private until the approved reveal stage."
      };
  }
};

class ResendEmailProvider {
  private client: Resend | undefined;

  private getClient() {
    if (!env.resendApiKey) throw new Error("RESEND_API_KEY is not configured for email notifications.");
    this.client ??= new Resend(env.resendApiKey);
    return this.client;
  }

  async send(input: { to: string; subject: string; body: string }): Promise<ProviderResult> {
    const response = await this.getClient().emails.send({
      from: env.emailFrom,
      to: input.to,
      subject: input.subject,
      html: renderSafeHtmlEmail(input.subject, input.body),
      text: input.body
    });

    const result = response as { data?: { id?: string | null } | null; error?: { message?: string; name?: string } | null };
    if (result.error) {
      const details = [result.error.name, result.error.message].filter(Boolean).join(": ");
      throw new Error(details || "Resend delivery failed.");
    }

    return { id: result.data?.id ?? null };
  }
}

class FirebasePushProvider {
  async send(input: { subject: string; body: string; userId?: string | null }): Promise<ProviderResult> {
    if (!env.firebaseNotificationTopic) throw new Error("FIREBASE_NOTIFICATION_TOPIC is not configured for push notifications.");
    const id = await getFirebaseMessaging().send({
      topic: env.firebaseNotificationTopic,
      notification: { title: input.subject, body: input.body },
      data: {
        userId: input.userId ?? "",
        source: "galaxy-elite-private-match"
      }
    });
    return { id };
  }
}

const readString = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

const templateFromWebhook = (payload: WebhookPayload): DispatchInput[] => {
  const table = readString(payload.table) ?? readString(payload.data?.table);
  const eventType = readString(payload.event_type ?? payload.type)?.toLowerCase();
  const record = (payload.record ?? payload.data?.record ?? payload.data ?? {}) as Record<string, unknown>;
  const oldRecord = (payload.old_record ?? {}) as Record<string, unknown>;

  if (["interest_signals", "private_availability", "investor_posts", "verified_listing_requests"].includes(table ?? "") && eventType?.includes("insert")) {
    const userId = readString(record.user_id);
    const notifications: DispatchInput[] = [];
    if (userId) notifications.push({ userId, notificationType: "submission_received", channel: "in_app" });
    for (const email of env.adminNotificationEmails) {
      notifications.push({ userId: null, toEmail: email, notificationType: "admin_alert_new_post", channel: "email" });
    }
    return notifications;
  }

  if (["interest_signals", "private_availability", "investor_posts", "verified_listing_requests"].includes(table ?? "") && eventType?.includes("update")) {
    const userId = readString(record.user_id);
    const title = readString(record.title);
    const status = readString(record.approval_status);
    const oldStatus = readString(oldRecord.approval_status);
    if (userId && status === "approved" && oldStatus !== "approved") return [{ userId, title, notificationType: "submission_approved", channel: "in_app" }];
    if (userId && status === "documents_requested" && oldStatus !== "documents_requested") return [{ userId, notificationType: "documents_requested", channel: "email" }];
    if (userId && status === "compliance_hold" && oldStatus !== "compliance_hold") return [{ userId, notificationType: "compliance_hold", channel: "email" }];
  }

  if (table === "match_rooms" && eventType?.includes("insert")) {
    return env.adminNotificationEmails.map((email) => ({ userId: null, toEmail: email, notificationType: "match_room_opened", channel: "email" }));
  }

  if (["match_rooms", "match_requests"].includes(table ?? "") && eventType?.includes("update")) {
    const stage = readString(record.stage ?? record.current_stage ?? record.status);
    const oldStage = readString(oldRecord.stage ?? oldRecord.current_stage ?? oldRecord.status);
    const userIds = [readString(record.source_user_id), readString(record.target_user_id), readString(record.user_id), readString(record.requested_by)].filter((value): value is string => Boolean(value));
    if (stage === "match_proposed" && oldStage !== "match_proposed") return userIds.map((userId) => ({ userId, notificationType: "match_proposed", channel: "in_app" }));
    if (stage === "completed" && oldStage !== "completed") return userIds.map((userId) => ({ userId, notificationType: "match_completed", channel: "email" }));
  }

  if (table === "match_requests" && eventType?.includes("insert")) {
    const userId = readString(record.requested_by);
    return userId ? [{ userId, notificationType: "match_proposed", channel: "in_app" }] : [];
  }

  if (table === "document_uploads" && eventType?.includes("update")) {
    const status = readString(record.verification_status);
    const oldStatus = readString(oldRecord.verification_status);
    const userId = readString(record.owner_user_id);
    if (userId && status === "failed" && oldStatus !== "failed") return [{ userId, notificationType: "documents_requested", channel: "email" }];
  }

  return [];
};

export class NotificationService {
  private emailProvider = new ResendEmailProvider();
  private pushProvider = new FirebasePushProvider();

  async listForUser(userId: string) {
    return notificationRepository.listForUser(userId);
  }

  async dispatch(input: DispatchInput): Promise<NotificationRecord> {
    const template = notificationTemplate(input.notificationType, { title: input.title });
    const subject = sanitizeNotificationText(template.subject, "subject", 180);
    const body = sanitizeNotificationText(template.body, "body", 4000);
    const pending = await withTransaction((client) =>
      notificationRepository.createPending(client, {
        userId: input.userId ?? null,
        notificationType: input.notificationType,
        channel: input.channel,
        subject,
        body
      })
    );

    if (input.channel === "in_app") {
      return withTransaction((client) => notificationRepository.markSent(client, pending.id, "in-app"));
    }

    const userEmail = input.toEmail ?? (input.userId ? await notificationRepository.findUserEmail(input.userId) : null);
    if (input.channel === "email" && !userEmail) {
      const message = "Recipient email could not be resolved for this notification.";
      console.error("Notification delivery failed", { notificationId: pending.id, notificationType: input.notificationType, channel: input.channel, message });
      return withTransaction((client) => notificationRepository.markFailed(client, pending.id, message));
    }

    try {
      const delivery = input.channel === "push"
        ? await this.pushProvider.send({ subject, body, userId: input.userId })
        : await this.emailProvider.send({ to: userEmail!, subject, body });
      return await withTransaction((client) => notificationRepository.markSent(client, pending.id, delivery.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Notification delivery failed.";
      console.error("Notification delivery failed", { notificationId: pending.id, notificationType: input.notificationType, channel: input.channel, message });
      return withTransaction((client) => notificationRepository.markFailed(client, pending.id, message));
    }
  }

  async dispatchMany(input: DispatchManyInput) {
    const notifications: NotificationRecord[] = [];
    for (const userId of input.userIds) {
      for (const channel of input.channels) {
        notifications.push(await this.dispatch({ userId, notificationType: input.notificationType, channel, title: input.title }));
      }
    }
    return notifications;
  }

  async processWebhook(payload: WebhookPayload) {
    const jobs = templateFromWebhook(payload);
    const notifications: NotificationRecord[] = [];
    for (const job of jobs) {
      notifications.push(await this.dispatch(job));
    }
    return notifications;
  }
}

export const notificationService = new NotificationService();
