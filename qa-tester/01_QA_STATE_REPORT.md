# QA State Report

Date: 2026-06-04
Tester: Codex QA pass
Scope: registration, login/session, private availability/property submission, post interest, identity verification, admin compliance review, route protection, build readiness.

## State Summary

Overall state: **Pass with follow-up monitoring**

Build state: **Pass**

Route protection state: **Pass**

End-to-end user journey state: **Pass for native auth, submissions, and identity review smoke path**

## QA State Numbers

### QA-STATE-001: MySQL Migration Chain Fails

Severity: Critical

Status: Fixed

Area: Backend database migrations

Fix applied:
- Replaced unsupported MySQL 8.4 `alter table ... add column if not exists` usage in migrations `003`, `004`, `005`, and `006` with `information_schema` checks and prepared SQL.
- Removed hard-coded `use galaxy_elite_test` from base migrations so the connection URL controls the target schema.
- Added `007_submission_structured_fields_backfill.sql` for older QA databases missing structured submission columns.
- Added `008_legacy_submission_form_data_nullable.sql` so older `form_data json not null` columns do not break current typed handlers.

Verified evidence:
- Clean isolated schema `galaxy_elite_clean_test`: `npm --prefix backend run db:migrate` exits `0`.
- `schema_migrations` contains `001` through `008`.
- `users` table exists.
- `private_availability.preferred_payment_method`, `private_availability.has_verification_files_attached`, `private_availability.title`, and `private_availability.price_min` exist.

### QA-STATE-002: Register Endpoint Fails Because `users` Table Is Missing

Severity: Critical

Status: Fixed

Area: Native auth

Verified evidence:
- `POST /api/auth/register` returned `201` for QA user `qa-user-1780529752@example.com`.
- `POST /api/auth/login` returned `200` and a backend JWT.
- Registered user id: `1032e432-0dee-405b-b5e9-7f88cc810da4`.

### QA-STATE-003: Local QA Database Is Stale

Severity: High

Status: Fixed

Area: QA environment

Fix applied:
- Active QA database migrated through `008_legacy_submission_form_data_nullable.sql`.
- Taxonomy seed rows added in `006_submission_payment_method_validation.sql`.
- Structured submission compatibility columns added in `007`.

Verified evidence:
- Active QA DB `schema_migrations` contains `001` through `008`.
- Taxonomy rows exist: `country = 4`, `area_city = 13`.
- Interest smoke row `fb9cc719-00b2-4549-b2e3-51555e657767` persisted with `preferred_payment_method = Cash`, `approval_status = pending_review`, `public_status = hidden`, `verification_status = unverified`.
- Availability smoke row `d70a4210-c28f-4d6d-b7f8-5021a2a461b2` persisted with `preferred_payment_method = Cash`, `has_verification_files_attached = 1`, `approval_status = pending_review`, `public_status = hidden`, `verification_status = unverified`.

### QA-STATE-004: Production Readiness Env Missing by Default

Severity: Medium

Status: Fixed for local QA documentation

Area: Environment configuration

Fix applied:
- Updated root `.env.example` with readiness-required variables.
- Updated `backend/.env.example` with `MYSQL_DATABASE_URL`, native JWT secret guidance, and `PRIVATE_DOCUMENT_BUCKET=private-documents`.
- Added `qa-tester/02_QA_ENV_SETUP.md` with export commands for local QA.
- Fixed `qa-tester/README.md` to point at `01_QA_STATE_REPORT.md`.

Acceptance note:
- `npm run qa:readiness:strict` passes when the documented QA exports are loaded. Deployment environments still need real secret values, not example placeholders.

### QA-STATE-005: Full User Journey Not Yet Verified

Severity: High

Status: Smoke verified

Area: End-to-end product QA

Verified journey:
1. Register: `201`.
2. Login: `200` with native JWT.
3. Submit private availability with preferred payment method and ownership document metadata: `201`.
4. Submit post interest with preferred payment method: `201`.
5. Submit identity verification document: `202`, user moved to `under_review`.
6. Non-privileged admin review attempt: `403`.
7. Compliance approval: `200`, user moved from `under_review` to `verified`.
8. Document upload moved to `verified` with reviewer id.
9. `admin_actions` contains immutable audit row with `action_type = verify_identity`, previous status `under_review`, new status `verified`, reviewer id, and note.

Follow-up monitoring:
- Matching quality and ranking behavior should still receive a separate seeded-data QA pass. The blockers that prevented the native journey are fixed.

## Passed Checks

- Backend `npm run typecheck`: Pass
- Backend `npm run build`: Pass
- Clean MySQL migration chain: Pass
- Active QA MySQL migration chain: Pass
- Native register/login smoke: Pass
- Interest submission smoke: Pass
- Private availability submission smoke: Pass
- Verification submission smoke: Pass
- Admin compliance approval smoke: Pass
- Admin API denies non-compliance requests: Pass
- Dashboard permission matrix: Pass
- Dashboard `npm run typecheck`: Pass
- Dashboard `npm run build`: Pass
- Website `npm run typecheck`: Pass
- Website `npm run build`: Pass
- Readiness with documented local QA env overrides: Pass

## Current Fix Order

All tracked blockers are fixed. Next QA pass should focus on seeded matching behavior and longer browser-based regression coverage.
