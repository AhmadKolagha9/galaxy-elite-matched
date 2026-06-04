# Final QA Production Readiness Checklist

Date created: 2026-06-04
Owner: QA tester / release owner
Current release state: **Not production-ready yet**

This file tracks what is still missing before Galaxy Elite Private Match can move from QA into production.

## Current Automated QA Status

Last local automated pass: 2026-06-04

Commands run:

```bash
npm --prefix dashboard-galaxy run qa:permissions
npm run qa:all
npm run qa:readiness:strict
```

Results:

- `dashboard-galaxy` role and permission matrix: **Pass**
- Backend typecheck: **Pass**
- Backend build: **Pass**
- Admin dashboard typecheck: **Pass**
- Admin dashboard build: **Pass**
- Website typecheck: **Pass**
- Website build: **Pass**
- Non-strict readiness route/isolation checks: **34/40 passed**
- Strict production readiness: **Fail because required environment variables were not present in this shell**

Strict readiness blockers reported:

- `MYSQL_DATABASE_URL` missing.
- `AUTH_JWT_SECRET` missing.
- `PRIVATE_DOCUMENT_BUCKET` missing.
- `CORS_ORIGIN` missing.
- `BACKEND_API_URL` missing.
- `ADMIN_DASHBOARD_ORIGIN` missing.

These are release blockers for staging/production configuration, not TypeScript build failures.

Production URL/env placeholder files:

- `.env.production.example`
- `qa-tester/06_PRODUCTION_EMPTY_ENV_TEMPLATE.md`

The production remote URL values are intentionally empty until the final hosting/API domains are selected:

```bash
PRODUCTION_WEBSITE_URL=
PRODUCTION_BACKEND_API_URL=
PRODUCTION_ADMIN_DASHBOARD_URL=
PRODUCTION_CORS_ORIGIN=
```

## What Is Already QA-Passed

The following areas are no longer blocking production from the code/build side:

- Backend compiles.
- Admin dashboard compiles.
- Public website compiles.
- Standalone admin dashboard route isolation is correct.
- Standalone admin dashboard public website routes are removed.
- Standalone admin dashboard public submission APIs are removed.
- Required admin dashboard routes exist: `/login`, `/submissions`, `/documents`, `/matches`, `/taxonomy`, `/audit-log`.
- Admin dashboard permission harness passes.
- Role and permission matrix previously passed at `117/117` for backend/admin dashboard API smoke coverage.
- Invalid, expired, and tampered JWTs are handled as authorization failures instead of internal server errors.
- Dashboard control API preserves backend authorization status codes.

## Production Blockers Still Missing

### QA-FINAL-001: Configure Staging/Production Environment

Severity: Critical
Status: Blocked - empty production placeholders added, real deployment values still required

Required action:

- Configure real staging or production values for:
  - `MYSQL_DATABASE_URL`
  - `AUTH_JWT_SECRET`
  - `PRIVATE_DOCUMENT_BUCKET`
  - `CORS_ORIGIN`
  - `BACKEND_API_URL`
  - `ADMIN_DASHBOARD_ORIGIN`
  - `NEXT_PUBLIC_BACKEND_API_URL`

Current action completed:

- Added empty production remote URL and env placeholders in `.env.production.example` and `qa-tester/06_PRODUCTION_EMPTY_ENV_TEMPLATE.md`.

Acceptance:

```bash
npm run qa:readiness:strict
```

must return `40/40 readiness checks passed`.

Notes:

- `AUTH_JWT_SECRET` must be a strong private value, not an example value.
- `CORS_ORIGIN` must list exact approved origins only.
- `ADMIN_DASHBOARD_ORIGIN` must not be `*`.

### QA-FINAL-002: Run Browser E2E For Public User Journey

Severity: Critical
Status: Open

Roles to test:

- Anonymous visitor.
- Registered `user`.
- `owner`.
- `agent`.

Required browser journeys:

- Register from `/register`.
- Login from `/login`.
- Confirm backend JWT/member session is created.
- Open `/dashboard` as a logged-in user.
- Confirm anonymous user cannot open `/dashboard`.
- Submit private availability with `preferred_payment_method`.
- Submit post interest with `preferred_payment_method`.
- Confirm required payment method validation blocks empty values.
- Submit verification documents from `/dashboard/verify`.
- Confirm verification form freezes after success.
- Confirm dashboard verification banners render correctly for:
  - `unverified`
  - `under_review`
  - `action_required`
  - `verified`

Acceptance:

- No console errors.
- No duplicate submissions after double-click.
- Invalid form states show clear errors.
- New public submissions remain hidden/pending until admin approval.

### QA-FINAL-003: Run Browser E2E For Admin And Compliance Users

Severity: Critical
Status: Open

Roles to test:

- Anonymous.
- Plain `user`.
- `admin`.
- `compliance`.
- `super_admin`.
- Expired JWT.
- Tampered JWT.

Required browser journeys:

- Anonymous user redirects from protected admin dashboard pages.
- Plain `user` is rejected by admin session creation.
- `admin` can access standard moderation pages.
- `admin` cannot access SuperAdmin-only taxonomy mutation APIs.
- `compliance` can access identity/document review flows.
- `compliance` cannot access SuperAdmin-only controls.
- `super_admin` can access taxonomy and audit-log controls.
- Expired and tampered JWTs are rejected.

Acceptance:

- Protected routes are enforced server-side and not only hidden in UI.
- Required admin notes block approve/reject/hold actions until provided.
- Audit-log rows are written for admin mutations.

### QA-FINAL-004: Real Signed Upload And Private Document QA

Severity: Critical
Status: Open

Required action:

- Test the actual signed-upload flow against the configured private storage provider.

Files to test:

- Valid PDF.
- Valid JPG.
- Valid PNG.
- Oversized file over the allowed limit.
- Unsupported MIME type.
- Mismatched extension/MIME type.

Security checks:

- User can upload only into their own private namespace.
- User cannot submit another user's storage path.
- Admin/compliance can view documents only through expiring signed URLs.
- Signed URLs expire.
- Raw private storage paths do not appear in public HTML, public API responses, metadata, sitemap, or JSON-LD.
- Document iframe previews are empty until a signed-view URL is requested.

Acceptance:

- Upload success writes immutable verification submission data.
- Invalid uploads fail before database mutation.
- Private document links are never publicly exposed.

### QA-FINAL-005: Seeded Matching And Ranking QA

Severity: Critical
Status: Open

Required seed data:

- Countries: UAE, UK, India, Global.
- Areas: Dubai, Abu Dhabi, England, India.
- Property types with both matching and non-matching values.
- Price ranges with overlap and no overlap.
- Sizes with overlap and no overlap.
- Payment methods: `Cash`, `Crypto`, `Installments`.
- Mixed statuses: pending, approved, hidden, rejected, archived.

Required checks:

- Exact country and area match ranks highest.
- Country-only match ranks below exact area match.
- Price overlap improves score.
- Price mismatch does not incorrectly match.
- Property type mismatch lowers or blocks score according to business rules.
- Payment method mismatch lowers or blocks score according to business rules.
- Hidden, pending, rejected, and archived records never appear in public match views.
- Match-room stage does not reveal private contact/document data too early.

Acceptance:

- Match ranking is explainable.
- No private records leak outside the allowed role/stage.

### QA-FINAL-006: Negative API Validation QA

Severity: High
Status: Open

Required checks:

- Missing `preferred_payment_method` on private availability returns `400`.
- Invalid `preferred_payment_method` returns `400`.
- Missing `preferred_payment_method` on post interest returns `400`.
- Invalid verification document type returns `400`.
- Verification rejection without feedback returns `400`.
- Admin moderation without note returns `400`.
- `price_max` lower than `price_min` returns `400`.
- Invalid taxonomy country/area combination returns `400`.
- Duplicate rapid submit does not create duplicate records.

Acceptance:

- Validation failures do not write partial database rows.
- API error messages are useful enough for frontend display.

### QA-FINAL-007: Database Migration And Backup QA

Severity: High
Status: Open

Required checks:

- Run migrations on a clean staging database.
- Run migrations twice and confirm they are idempotent.
- Confirm required tables exist.
- Confirm required enum columns exist.
- Confirm audit tables cannot be deleted through public/admin APIs.
- Confirm backup exists before production deploy.
- Confirm restore process has been rehearsed.

Acceptance:

- A clean database can be created from migrations only.
- Rollback/restore procedure is documented and tested.

### QA-FINAL-008: Production Security QA

Severity: High
Status: Open

Required checks:

- HTTPS only.
- Production cookies use `httpOnly`, `secure`, and strict/safe same-site settings.
- CORS allows only approved origins.
- Rate limits are active on auth, public submission, upload-signing, and admin mutation routes.
- Admin APIs reject missing, expired, tampered, or underprivileged JWTs.
- Users cannot read or mutate another user's private records.
- Private/admin/dashboard/match-room/document pages are noindexed or blocked as intended.
- Public pages do not expose internal notes, raw contact details, document paths, user IDs, or private deal data.

Acceptance:

- Security controls are enforced by backend/server routes.
- No sensitive data is present in public HTML, metadata, JSON-LD, sitemap, or public API responses.

### QA-FINAL-009: Notifications And Audit QA

Severity: Medium
Status: Open

Required checks:

- Verification submitted notification is created/sent.
- Verification approved notification is created/sent.
- Verification rejected/action-required notification is created/sent.
- Admin moderation notification is created/sent where enabled.
- Audit log writes immutable rows for:
  - identity approval
  - identity rejection
  - submission approval
  - submission rejection
  - compliance hold
  - document verification
  - taxonomy mutation

Acceptance:

- Notification failure does not corrupt the primary transaction.
- Audit rows contain actor, target, action, timestamp, and reason/note where required.

## QA Execution Update - 2026-06-04

State: **No-Go for production**

Completed now:

- Added `.env.production.example` and `qa-tester/06_PRODUCTION_EMPTY_ENV_TEMPLATE.md` with empty production remote URL placeholders.
- Ran `npm --prefix dashboard-galaxy run qa:permissions`: Pass.
- Ran `npm run qa:readiness:strict`: Fail because required production/staging env values are missing.
- Ran `npm run qa:all`: build, typecheck, and permission checks passed; non-strict readiness reported `34/40` because env values are missing.
- Added `qa-tester/07_FINAL_QA_EXECUTION_REPORT.md` with this execution evidence.

Current blockers:

- Real production/staging env values are not configured.
- Browser E2E user journeys are not executed.
- Real signed upload/private document QA is not executed.
- Seeded matching/ranking QA is not executed.
- Migration backup/restore and final production security QA are not executed.

## Final QA Execution Order

Run the remaining QA in this order:

1. Configure staging/production environment variables.
2. Run `npm run qa:readiness:strict` until it returns `40/40`.
3. Run `npm run qa:all`.
4. Run browser E2E for public user journeys.
5. Run browser E2E for admin/compliance/super_admin journeys.
6. Run real signed upload and private document QA.
7. Run seeded matching/ranking QA.
8. Run negative API validation QA.
9. Run database migration, backup, and restore QA.
10. Run final production security/no-leak QA.
11. Freeze the release build and record the final pass evidence.

## Final Go/No-Go Rule

Production can be approved only when all of these are true:

- `npm run qa:all` passes.
- `npm run qa:readiness:strict` passes with `40/40`.
- Browser E2E public user journey passes.
- Browser E2E admin/compliance journey passes.
- Real signed upload/private document QA passes.
- Seeded matching/ranking QA passes.
- Negative validation QA passes.
- Migration and backup/restore QA passes.
- No critical or high security findings remain open.

Current decision: **No-Go for production until the open final QA items above are completed.**

## Final QA Result Template

Use this template after each remaining QA pass:

```md
## QA-FINAL-XXX Execution

Date:
Tester:
Environment:
Build/version:

State: Pass / Pass with findings / Fail / Blocked

Tests completed:

- Test:
  - Result:
  - Evidence:

Findings:

- Finding ID:
  - Severity:
  - Status:
  - Expected:
  - Actual:
  - Fix target:
```
