import jwt from "jsonwebtoken";

import { unauthorized } from "../http/errors.js";

export const verifyAppJwt = (token: string, secret: string) => {
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
  if (!payload || typeof payload === "string") throw unauthorized("Invalid bearer token.");

  const exp = typeof payload.exp === "number" ? payload.exp : undefined;
  if (exp && exp * 1000 < Date.now()) throw unauthorized("Bearer token expired.");

  const sub = typeof payload.sub === "string" ? payload.sub : undefined;
  if (!sub) throw unauthorized("Bearer token is missing a user id.");

  return payload as Record<string, unknown>;
};

export const signAppJwt = (payload: Record<string, unknown>, secret: string) =>
  jwt.sign(payload, secret, { algorithm: "HS256" });
