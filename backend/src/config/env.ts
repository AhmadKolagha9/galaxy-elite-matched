import "dotenv/config";

const parsePort = (value: string | undefined) => {
  const port = Number(value ?? "4000");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return port;
};

const officialCorsOrigins = [
  "https://match.galaxyelite.ae",
  "https://www.match.galaxyelite.ae"
];

const localCorsOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:4000"];

const parseCorsOrigins = (value: string | undefined) => {
  const source = value?.trim();
  const origins = source
    ? source.split(",").map((item) => item.trim()).filter(Boolean)
    : process.env.NODE_ENV === "production"
      ? officialCorsOrigins
      : [...officialCorsOrigins, ...localCorsOrigins];

  if (origins.includes("*")) {
    throw new Error("CORS_ORIGIN must be an absolute whitelist. Wildcard '*' is not allowed.");
  }

  return Array.from(new Set(origins));
};

const parseList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const parsePositiveInteger = (value: string | undefined, fallback: number, name: string) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer.`);
  return parsed;
};

export const env = {
  apiName: process.env.API_NAME ?? "Galaxy Elite Private Match API",
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
  databaseUrl: process.env.MYSQL_DATABASE_URL ?? process.env.DATABASE_URL,
  authJwtSecret: process.env.AUTH_JWT_SECRET,
  authJwtExpiresInSeconds: parsePositiveInteger(process.env.AUTH_JWT_EXPIRES_IN_SECONDS, 60 * 60 * 8, "AUTH_JWT_EXPIRES_IN_SECONDS"),
  bcryptSaltRounds: parsePositiveInteger(process.env.BCRYPT_SALT_ROUNDS, 12, "BCRYPT_SALT_ROUNDS"),
  enableDevAuth: parseBoolean(process.env.ENABLE_DEV_AUTH, process.env.NODE_ENV !== "production"),
  internalApiKey: process.env.INTERNAL_API_KEY,
  mysqlDatabaseUrl: process.env.MYSQL_DATABASE_URL ?? process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  uploadBucket: process.env.PRIVATE_DOCUMENT_BUCKET ?? "private-documents",
  signedDocumentBaseUrl: process.env.SIGNED_DOCUMENT_BASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "galaxy-elite-mathed",
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  firebaseNotificationTopic: process.env.FIREBASE_NOTIFICATION_TOPIC,
  notificationWebhookSecret: process.env.NOTIFICATION_WEBHOOK_SECRET,
  emailFrom: process.env.EMAIL_FROM ?? "Galaxy Elite <notifications@galaxy-elite.local>",
  resendApiKey: process.env.RESEND_API_KEY,
  adminNotificationEmails: parseList(process.env.ADMIN_NOTIFICATION_EMAILS)
} as const;
