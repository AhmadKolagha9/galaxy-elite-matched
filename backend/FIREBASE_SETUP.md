# Firebase Notification Setup

Firebase is used by this backend only for outbound push notifications through Firebase Cloud Messaging. It is not used for backend authentication, database persistence, audit logs, document storage, or API hosting.

## Backend data and auth

- Data engine: MySQL via `MYSQL_DATABASE_URL` or `DATABASE_URL`.
- Backend bearer auth: HS256 JWTs signed with `AUTH_JWT_SECRET`.
- Admin/service access: `Authorization: Bearer <backend-jwt>` or `x-internal-api-key` for server-to-server calls.

Create a local/staging admin token from `backend/`:

```bash
npm run auth:token -- 00000000-0000-0000-0000-000000000001 admin@example.com super_admin
```

## Firebase Cloud Messaging

Set these only if you want the `push` notification channel:

```bash
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
FIREBASE_NOTIFICATION_TOPIC=admin-alerts
```

The notification service stores queue/status rows in MySQL first. Firebase receives only sanitized notification title/body payloads for push delivery.
