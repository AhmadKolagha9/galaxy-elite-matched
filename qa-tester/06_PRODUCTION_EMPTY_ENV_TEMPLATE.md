# Production Environment Template

Date created: 2026-06-04
Purpose: Production/staging public URLs plus empty secret placeholders to fill before final QA and deployment.

Do not put real secrets in this tracked file. Copy these names into the deployment platform secret manager and fill secret values there.

## Remote URLs

```bash
PRODUCTION_WEBSITE_URL=https://yourpropertymatch.cloud
PRODUCTION_BACKEND_API_URL=https://api.yourpropertymatch.cloud
PRODUCTION_ADMIN_DASHBOARD_URL=https://admin.yourpropertymatch.cloud
PRODUCTION_CORS_ORIGIN=https://yourpropertymatch.cloud,https://www.yourpropertymatch.cloud,https://admin.yourpropertymatch.cloud
```

## Backend Required Values

```bash
MYSQL_DATABASE_URL=
DATABASE_URL=
AUTH_JWT_SECRET=
PRIVATE_DOCUMENT_BUCKET=
CORS_ORIGIN=https://yourpropertymatch.cloud,https://www.yourpropertymatch.cloud,https://admin.yourpropertymatch.cloud
BACKEND_PORT=
```

## Website Required Values

```bash
NEXT_PUBLIC_SITE_URL=https://yourpropertymatch.cloud
BACKEND_API_URL=https://api.yourpropertymatch.cloud
NEXT_PUBLIC_BACKEND_API_URL=https://api.yourpropertymatch.cloud
ADMIN_EMAILS=admin@yourpropertymatch.cloud
```

## Admin Dashboard Required Values

```bash
NEXT_PUBLIC_SITE_URL=https://admin.yourpropertymatch.cloud
NEXT_PUBLIC_ADMIN_DASHBOARD_ORIGIN=https://admin.yourpropertymatch.cloud
ADMIN_DASHBOARD_ORIGIN=https://admin.yourpropertymatch.cloud
BACKEND_API_URL=https://api.yourpropertymatch.cloud
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
