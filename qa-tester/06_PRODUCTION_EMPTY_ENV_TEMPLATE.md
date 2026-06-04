# Production Empty Environment Template

Date created: 2026-06-04
Purpose: Empty production/staging values to fill before final QA and deployment.

Do not put real secrets in this tracked file. Copy these names into the deployment platform secret manager and fill them there.

## Remote URLs

```bash
PRODUCTION_WEBSITE_URL=
PRODUCTION_BACKEND_API_URL=
PRODUCTION_ADMIN_DASHBOARD_URL=
PRODUCTION_CORS_ORIGIN=
```

## Backend Required Values

```bash
MYSQL_DATABASE_URL=
DATABASE_URL=
AUTH_JWT_SECRET=
PRIVATE_DOCUMENT_BUCKET=
CORS_ORIGIN=
BACKEND_PORT=
```

## Website Required Values

```bash
NEXT_PUBLIC_SITE_URL=
BACKEND_API_URL=
NEXT_PUBLIC_BACKEND_API_URL=
ADMIN_EMAILS=
```

## Admin Dashboard Required Values

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ADMIN_DASHBOARD_ORIGIN=
ADMIN_DASHBOARD_ORIGIN=
BACKEND_API_URL=
```

## Optional Provider Values

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_VERSION=
SANITY_WRITE_TOKEN=

EMAIL_PROVIDER=
EMAIL_FROM=
RESEND_API_KEY=
SENDGRID_API_KEY=
POSTMARK_SERVER_TOKEN=
ADMIN_NOTIFICATION_EMAILS=

FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=
FIRESTORE_NOTIFICATIONS_COLLECTION=
```

## Final QA Rule

These values must be filled in the real staging/production environment before running:

```bash
npm run qa:readiness:strict
```

The readiness gate must return `40/40 readiness checks passed` before production approval.
