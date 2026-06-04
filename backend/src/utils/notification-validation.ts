import {
  isNotificationChannel,
  isNotificationType,
  notificationChannels,
  notificationTypes,
  type NotificationChannel,
  type NotificationType
} from "../domain/notifications.js";
import { badRequest } from "../http/errors.js";
import { asOptionalString } from "./strings.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type DispatchPayload = {
  userIds: string[];
  notificationType: NotificationType;
  channels: NotificationChannel[];
  title?: string;
};

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const redactSensitiveText = (value: string) =>
  value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(?:\+?\d[\s().-]*){8,}\d/g, "[redacted-phone]")
    .replace(/\b(?:unit|apartment|villa|suite|flat|plot)\s*[#:\-]?[\w-]+/gi, "[redacted-unit]")
    .replace(/\b(?:storage_path|file_path|document_path|internal_notes|admin_note)\b\s*[:=]\s*\S+/gi, "[redacted]");

export const sanitizeNotificationText = (value: unknown, field: string, maxLength: number) => {
  const text = asOptionalString(value);
  if (!text) throw badRequest(`${field} is required.`);
  const redacted = redactSensitiveText(text).replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (!redacted || redacted.length > maxLength) throw badRequest(`${field} must be between 1 and ${maxLength} characters.`);
  return redacted;
};

const readStringArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map((item) => asOptionalString(item)).filter((item): item is string => Boolean(item));
  const single = asOptionalString(value);
  return single ? [single] : [];
};

const parseUserIds = (body: Record<string, unknown>) => {
  const values = readStringArray(body.user_ids ?? body.userIds);
  const single = asOptionalString(body.user_id ?? body.userId);
  if (single) values.push(single);

  const unique = Array.from(new Set(values));
  if (!unique.length) throw badRequest("user_id or user_ids is required.");
  for (const userId of unique) {
    if (!uuidPattern.test(userId)) throw badRequest("Every user_id must be a valid UUID.");
  }
  return unique;
};

const parseChannels = (body: Record<string, unknown>) => {
  const values = readStringArray(body.channels);
  const single = asOptionalString(body.channel);
  if (single) values.push(single);
  const unique = Array.from(new Set(values.length ? values : ["email"]));

  for (const channel of unique) {
    if (!isNotificationChannel(channel)) throw badRequest(`channel must be one of: ${notificationChannels.join(", ")}.`);
  }
  return unique as NotificationChannel[];
};

export const parseDispatchPayload = (body: Record<string, unknown>): DispatchPayload => {
  const type = asOptionalString(body.notification_type ?? body.notificationType ?? body.event_type ?? body.eventType);
  if (!type || !isNotificationType(type)) throw badRequest(`notification_type must be one of: ${notificationTypes.join(", ")}.`);

  const title = asOptionalString(body.title ?? body.submission_title ?? body.submissionTitle);

  return {
    userIds: parseUserIds(body),
    notificationType: type,
    channels: parseChannels(body),
    title: title ? sanitizeNotificationText(title, "title", 160) : undefined
  };
};

export const renderSafeHtmlEmail = (subject: string, body: string) => {
  const escapedSubject = escapeHtml(subject);
  const escapedBody = escapeHtml(body).replace(/\n/g, "<br>");
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5"><h1 style="font-size:20px">${escapedSubject}</h1><p>${escapedBody}</p><p style="color:#6b7280;font-size:12px">Galaxy Elite Private Match keeps counterparty contact details private until the approved reveal stage.</p></body></html>`;
};
