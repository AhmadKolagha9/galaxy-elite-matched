# Launch Readiness Gate

This workspace is ready for staging QA only after these checks pass:

```bash
npm run qa:all
npm run qa:readiness:strict
```

## Backend data and auth setup

The backend uses MySQL for application data and backend-signed JWTs for API authorization. Firebase is notification-only.

Required backend environment:

- `MYSQL_DATABASE_URL` or `DATABASE_URL` with a MySQL connection URL
- `AUTH_JWT_SECRET`
- `PRIVATE_DOCUMENT_BUCKET`
- `CORS_ORIGIN`
- `INTERNAL_API_KEY` for server-to-server operations, recommended

Create staff tokens from `backend/` after `AUTH_JWT_SECRET` is configured:

```bash
npm run auth:token -- 00000000-0000-0000-0000-000000000001 admin@example.com admin
npm run auth:token -- 00000000-0000-0000-0000-000000000002 compliance@example.com compliance
npm run auth:token -- 00000000-0000-0000-0000-000000000003 owner@example.com super_admin
```

## Firebase notification setup

Only needed for Firebase Cloud Messaging push notifications:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_NOTIFICATION_TOPIC`

Firebase must not be used as the backend data store, audit log store, document store, or API auth verifier.

## Dashboard environment

- `BACKEND_API_URL`
- `ADMIN_DASHBOARD_ORIGIN`

## Manual staging tests

- Apply MySQL migrations with `npm --prefix backend run db:migrate`.
- Login or seed dashboard sessions using backend admin JWTs.
- Confirm plain user tokens cannot enter the control dashboard.
- Confirm admin/compliance can use `/submissions`, `/documents`, and `/matches`.
- Confirm admin/compliance see access-denied panels for `/taxonomy` and `/audit-log`.
- Confirm `super_admin` can create/edit/archive taxonomy and read audit logs.
- Create one document upload and verify signed preview URL generation.
- Approve, hold, and reject one submission and confirm MySQL audit entries.
- Move a match room one stage forward and backward and confirm MySQL audit entries.
- Dispatch one `push` notification only after Firebase Cloud Messaging env values are configured.

## Latest local QA result - 2026-06-03

Backend typecheck and build pass with MySQL data access and notification-only Firebase Admin usage. The readiness scan now requires MySQL and backend JWT configuration instead of Firebase Auth claims.
