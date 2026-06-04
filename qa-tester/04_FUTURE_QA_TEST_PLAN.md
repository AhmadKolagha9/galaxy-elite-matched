# Future QA Test Plan

Date created: 2026-06-04
Owner: QA tester / release owner
Purpose: Tests still needed after the current backend, dashboard, and admin smoke checks.

## Priority Summary

Highest priority before production:

1. Browser E2E user journey.
2. Full role matrix across frontend and backend. **Completed for backend and standalone admin dashboard on 2026-06-04.**
3. Matching/ranking behavior with seeded data.
4. Real signed file upload and private document viewing.
5. Security and production-like deployment checks.

## QA-PLAN-001: Browser E2E User Journey

Priority: Critical
Status: Not started

Goal:
- Prove a real browser user can complete the full public and member workflow, not only API smoke tests.

Test cases:
- Register a new account from `/register`.
- Login and confirm the backend JWT cookie/session is created.
- Open `/dashboard` and confirm protected dashboard access.
- Submit private availability with `preferred_payment_method`.
- Attach optional ownership documentation through signed upload flow.
- Submit post interest with `preferred_payment_method`.
- Submit verification documents from `/dashboard/verify`.
- Confirm form inputs freeze after successful verification submission.
- Confirm user status banners show correct states: `unverified`, `under_review`, `action_required`, `verified`.

Acceptance:
- No browser console errors.
- No duplicate submissions after double-click or refresh.
- All success and error states are visible and understandable.
- New submissions stay server-side `pending_review`, `hidden`, and `unverified` unless admin changes them.

Suggested tools:
- Playwright.
- Local MySQL QA database.
- Backend and website running with QA env values from `02_QA_ENV_SETUP.md`.

## QA-PLAN-002: Full Role Matrix

Priority: Critical
Status: Executed - Pass on 2026-06-04 for backend API and standalone admin dashboard

Goal:
- Confirm every protected route and API enforces native JWT roles correctly.

Roles to test:
- Anonymous.
- Plain `user`.
- `owner`.
- `agent`.
- `compliance`.
- `admin`.
- `super_admin`.
- Expired JWT.
- Tampered JWT.

Routes and APIs:
- Website `/dashboard/*`.
- Website `/admin/compliance/*` if present in the public app.
- Standalone dashboard `/submissions`, `/documents`, `/matches`, `/taxonomy`, `/audit-log`.
- Backend `/api/users/verification/submit`.
- Backend `/api/admin/users/:id/verify-identity`.
- Backend document signed-view endpoints.
- Backend taxonomy mutation endpoints.
- Backend submission moderation endpoints.

Acceptance:
- Anonymous users redirect or receive `401`.
- Plain users cannot access admin or compliance routes.
- `compliance` can review identity and documents where intended.
- `admin` can moderate general queues but cannot mutate SuperAdmin-only taxonomy/audit APIs.
- `super_admin` can access SuperAdmin-only controls.
- Expired/tampered JWTs fail consistently.

## QA-PLAN-003: Matching And Ranking QA

Priority: Critical
Status: Not started

Goal:
- Prove matching logic connects buyer/interest demand with private availability supply correctly.

Seed data:
- Multiple countries: UAE, UK, India, Global.
- Multiple areas: Dubai, Abu Dhabi, England, India.
- Different property types, market segments, price ranges, sizes, and payment methods.
- Mix of approved, pending, hidden, rejected, archived records.

Test cases:
- Exact country and area match.
- Country match with different area.
- Price range overlap.
- Price range no overlap.
- Property type match and mismatch.
- Payment method match and mismatch.
- Hidden/pending records do not appear in public match views.
- Approved private records appear only to authorized admin or matched users.
- Match room creation does not reveal private contact details before the allowed stage.

Acceptance:
- Matches are explainable and ranked consistently.
- Non-approved or hidden records never leak publicly.
- Contact/document unlock rules follow the deal stage machine.

## QA-PLAN-004: Signed Upload And Document Privacy

Priority: Critical
Status: API smoke tested, real upload still needed

Goal:
- Verify actual file upload, storage path ownership, signed viewing, and rejection paths.

Test cases:
- Upload valid PDF.
- Upload valid JPG.
- Upload valid PNG.
- Reject oversized file over 10MB.
- Reject unsupported MIME type.
- Reject file extension that does not match MIME type.
- Reject storage path outside `private/<userId>/...`.
- Confirm signed URL expires.
- Confirm document storage paths are not rendered in public HTML or public APIs.
- Confirm iframe preview is only populated after signed-view request.

Acceptance:
- Users can upload only into their own namespace.
- Admin/compliance can view documents only through short-lived signed URLs.
- No raw private storage path leaks to public pages.

## QA-PLAN-005: Negative Form Validation

Priority: High
Status: Not started

Goal:
- Confirm malformed requests fail early and consistently.

Test cases:
- Missing `preferred_payment_method` on private availability.
- Missing `preferred_payment_method` on post interest.
- Invalid payment method value.
- Missing required taxonomy country.
- Invalid country/area combination.
- `price_max` lower than `price_min`.
- Empty required descriptions.
- Invalid verification document type.
- Verification rejection without feedback.
- Admin moderation without note.
- Duplicate rapid submit attempts.

Acceptance:
- Invalid requests return `400` with useful error messages.
- No partial database writes on validation failures.
- UI disables submit controls while request is in flight.

## QA-PLAN-006: Security QA

Priority: High
Status: Partially tested

Goal:
- Reduce risk of private data leakage and broken access control.

Test cases:
- CORS rejects unauthorized origins.
- Admin session cookie is `httpOnly`, `sameSite=strict`, and `secure` in production mode.
- Public pages do not include private document names, storage paths, contact info, direct emails, phone numbers, internal notes, or private unit details.
- Admin APIs reject missing, expired, or tampered tokens.
- Rate limits work on auth, submission, and upload-signing endpoints.
- Audit logs cannot be deleted through the API.
- User cannot submit verification document for another user namespace.
- User cannot read or mutate another user records.

Acceptance:
- Security failures are blocked server-side, not only by UI guards.
- Sensitive data is absent from public HTML, metadata, JSON-LD, sitemap, and public API responses.

## QA-PLAN-007: Admin Dashboard Browser QA

Priority: High
Status: Smoke tested, full browser pass still needed

Goal:
- Prove the standalone admin dashboard works in browser with real clicks and forms.

Test cases:
- Login with admin token.
- Login with compliance token.
- Login with super_admin token.
- Plain user token rejected.
- Open submissions list and filters.
- Approve, reject, and compliance-hold a submission with required notes.
- Open document queue.
- Create signed view URL.
- Mark document verified.
- Mark document failed with required reason.
- Open match room stage controller.
- Move stage forward one step and backward one step with audit note.
- Confirm taxonomy and audit-log pages block non-SuperAdmin roles.
- Confirm taxonomy create/edit/archive works for SuperAdmin.

Acceptance:
- UI state updates after each mutation.
- Required note/reason validation blocks bad actions.
- Audit log records admin mutations.

## QA-PLAN-008: Production-Like Deployment QA

Priority: High
Status: Not started

Goal:
- Test the app as close to production as possible.

Test cases:
- Run behind HTTPS.
- Use production-like env values.
- Confirm no wildcard CORS.
- Confirm dashboard and private routes are noindex.
- Confirm database migrations run once and are idempotent.
- Confirm backup and restore process.
- Confirm logs include enough request/action detail without leaking secrets.
- Confirm notification delivery if FCM/email providers are enabled.
- Confirm health endpoints work for monitoring.

Acceptance:
- `npm run qa:readiness:strict` passes with deployment env.
- Full user journey passes against production-like infrastructure.
- Rollback/restore process is documented.

## QA Execution Update: Role And Permission Matrix - 2026-06-04

State: **Pass after fixes**

Scope executed:
- Backend admin API role matrix.
- Standalone `dashboard-galaxy` session/proxy/API role matrix.
- Roles: anonymous, `user`, `owner`, `agent`, `compliance`, `admin`, `super_admin`, expired admin JWT, tampered admin JWT.

Result:
- Initial run: `96/117` passed.
- Fixed two permission/error-path issues.
- Final run: `117/117` passed.

Backend cases covered:
- `GET /api/admin`.
- `GET /api/admin/submissions`.
- `GET /api/admin/audit-log`.
- `GET /api/admin/taxonomy`.
- `POST /api/admin/taxonomy` with invalid body.
- `POST /api/admin/users/not-a-uuid/verify-identity`.
- `GET /api/admin/documents`.
- `POST /api/admin/documents/fake-id/verify` with invalid status.
- `POST /api/admin/matches/evaluate`.
- `PATCH /api/admin/match-rooms/fake/stage` with invalid stage.

Dashboard cases covered:
- `POST /api/admin-session` rejects `user`, `owner`, `agent`, expired JWT, and tampered JWT.
- `POST /api/admin-session` accepts `compliance`, `admin`, and `super_admin`.
- Anonymous `/submissions` redirects to login.
- `compliance`, `admin`, and `super_admin` can open `/submissions`.
- SuperAdmin-only dashboard APIs reject `admin` and `compliance`.
- SuperAdmin-only dashboard APIs allow `super_admin` to reach validation/business logic.
- Dashboard submission action API rejects empty admin notes with `400`.
- Dashboard document verification API returns `403` for `admin` and lets `compliance`/`super_admin` reach document lookup.

Issues found and fixed:

### QA-FIX-ROLE-001: Expired/Tampered Backend Admin JWT Returned `500`

Severity: High
Status: Fixed

Evidence:
- Initial role matrix returned `500 Internal server error` for expired and tampered admin JWTs across backend admin routes.

Fix:
- Updated `backend/src/middleware/auth.ts` so optional bearer parsing converts invalid/expired JWT errors into `401 Invalid or expired backend bearer token.` instead of forwarding raw JWT errors.

Acceptance:
- Expired admin JWT now returns `401` on backend admin routes.
- Tampered admin JWT now returns `401` on backend admin routes.

### QA-FIX-ROLE-002: Dashboard Control API Collapsed Backend `403` Into `500`

Severity: Medium
Status: Fixed

Evidence:
- Initial dashboard role matrix returned `500` when an `admin` token attempted document verification and backend correctly rejected it as compliance-only.

Fix:
- Added status-preserving `ControlApiError` handling in `dashboard-galaxy/lib/control-api.ts`.
- Updated dashboard control API routes to return `controlErrorStatus(error)` instead of hard-coded `500` for backend failures.

Acceptance:
- Admin document verification attempt now returns `403` through the dashboard control API.
- Compliance and SuperAdmin document verification attempts reach document lookup and return `404` for the fake document id used in the matrix.

Production gate note:
- Role/permission QA is no longer blocking production.
- Production is still blocked by unexecuted browser E2E, real signed-upload QA, seeded matching/ranking QA, and production-like deployment QA.

## Suggested Execution Order

1. Run `QA-PLAN-001` browser E2E journey.
2. `QA-PLAN-002` role matrix: Completed for backend/admin dashboard on 2026-06-04. Re-run after auth/RBAC changes.
3. Run `QA-PLAN-004` signed upload and document privacy.
4. Run `QA-PLAN-003` matching/ranking with seeded data.
5. Run `QA-PLAN-005` negative validation.
6. Run `QA-PLAN-006` security QA.
7. Run `QA-PLAN-007` admin dashboard browser QA.
8. Run `QA-PLAN-008` production-like deployment QA.

## Report Template For Each Future Pass

Use this short format when completing each plan item:

```md
# QA Execution Report: QA-PLAN-XXX

Date:
Tester:
Environment:
Commit/build:

## Summary

State: Pass / Pass with findings / Blocked / Fail

## Tests Run

- Test name: Pass/Fail

## Findings

### FINDING-ID
Severity:
Status:
Evidence:
Expected:
Actual:
Fix target:

## Evidence

Commands, screenshots, row IDs, API responses, or logs.
```
