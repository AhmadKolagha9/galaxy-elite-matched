import crypto from "node:crypto";

import type { Request } from "express";

import { env } from "../config/env.js";
import { unauthorized } from "../http/errors.js";

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const assertValidWebhookSignature = (request: Request) => {
  if (!env.notificationWebhookSecret) throw unauthorized("Webhook secret is not configured.");

  const bearer = request.header("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (bearer && safeEqual(bearer, env.notificationWebhookSecret)) return;

  const signature = request.header("x-galaxy-signature") ?? request.header("x-webhook-signature");
  if (!signature) throw unauthorized("Webhook signature is required.");

  const expected = crypto
    .createHmac("sha256", env.notificationWebhookSecret)
    .update(request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {})))
    .digest("hex");
  const normalized = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;

  if (!safeEqual(normalized, expected)) throw unauthorized("Webhook signature is invalid.");
};
