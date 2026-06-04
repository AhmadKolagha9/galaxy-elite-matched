import crypto from "node:crypto";

import { env } from "../config/env.js";
import { documentSignedUrlExpiresInSeconds } from "../domain/documents.js";
import { serviceUnavailable } from "../http/errors.js";

const signingSecret = () => env.authJwtSecret ?? env.internalApiKey;

const signPath = (path: string, expiresAt: number) => {
  const secret = signingSecret();
  if (!secret) throw serviceUnavailable("AUTH_JWT_SECRET or INTERNAL_API_KEY is required for signed document URLs.");
  return crypto.createHmac("sha256", secret).update(`${path}.${expiresAt}`).digest("base64url");
};

const signedDocumentUrl = (path: string, operation: "upload" | "view") => {
  const baseUrl = env.signedDocumentBaseUrl?.replace(/\/$/, "") ?? "/api/documents";
  const expiresAt = Math.floor(Date.now() / 1000) + documentSignedUrlExpiresInSeconds;
  const token = signPath(path, expiresAt);
  const query = new URLSearchParams({ path, operation, expiresAt: String(expiresAt), token });
  return { signedUrl: `${baseUrl}/signed?${query.toString()}`, token };
};

export const documentStorageService = {
  createSignedUploadUrl: async (path: string) => signedDocumentUrl(path, "upload"),
  createSignedViewUrl: async (path: string) => signedDocumentUrl(path, "view").signedUrl
};
