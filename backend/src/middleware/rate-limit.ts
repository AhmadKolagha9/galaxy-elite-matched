import type { RequestHandler } from "express";

import { HttpError } from "../http/errors.js";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

const cleanupBuckets = () => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
};

const requestIp = (request: Parameters<RequestHandler>[0]) =>
  String(request.headers["x-forwarded-for"] ?? request.ip ?? request.socket.remoteAddress ?? "unknown")
    .split(",")[0]
    .trim();

export const createMemoryRateLimit = (options: { windowMs: number; max: number; keyPrefix: string }): RequestHandler => {
  let lastCleanup = 0;

  return (request, response, next) => {
    const now = Date.now();
    if (now - lastCleanup > options.windowMs) {
      cleanupBuckets();
      lastCleanup = now;
    }

    const key = `${options.keyPrefix}:${requestIp(request)}`;
    const current = buckets.get(key);
    const entry = current && current.resetAt > now ? current : { count: 0, resetAt: now + options.windowMs };
    entry.count += 1;
    buckets.set(key, entry);

    response.setHeader("RateLimit-Limit", String(options.max));
    response.setHeader("RateLimit-Remaining", String(Math.max(options.max - entry.count, 0)));
    response.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > options.max) {
      response.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return next(new HttpError(429, "Too many submission attempts. Please wait before trying again."));
    }

    return next();
  };
};

export const publicSubmissionRateLimit = createMemoryRateLimit({
  keyPrefix: "public-submission",
  max: 5,
  windowMs: 15 * 60 * 1000
});
