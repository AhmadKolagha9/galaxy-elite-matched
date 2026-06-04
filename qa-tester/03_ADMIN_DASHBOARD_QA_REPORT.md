# Admin Dashboard QA Report

Date: 2026-06-04
Tester: Codex QA pass
Scope: standalone `dashboard-galaxy` control dashboard, route protection, role gates, session creation, moderation controls, document review controls, indexing controls, build health.

## State Summary

Overall state: **Pass**

Build state: **Pass**

Route protection state: **Pass**

Role gate state: **Pass**

Document privacy state: **Pass**

Open findings: **None**

## Commands Run

- `npm --prefix dashboard-galaxy run qa:permissions`: Pass
- `npm --prefix dashboard-galaxy run typecheck`: Pass
- `npm --prefix dashboard-galaxy run build`: Pass

## Live HTTP Smoke

Local services:
- Backend API: `http://127.0.0.1:4100`
- Admin dashboard: `http://127.0.0.1:3102`

Results:
- `GET /login`: `200`, login page renders and contains noindex metadata.
- `GET /submissions` without cookie: `307` to `/login?next=%2Fsubmissions`; stale admin cookie is cleared.
- `POST /api/admin-session` with plain `user` role token: `403`.
- `POST /api/admin-session` with `admin` token: `200`, HTTP-only session cookie issued.
- `GET /submissions` with `admin` cookie: `200`, `x-robots-tag: noindex, nofollow, noarchive`.
- `GET /taxonomy` without cookie: `307` to `/login?next=%2Ftaxonomy`.
- `GET /taxonomy` with `admin` cookie: `200`, page-level SuperAdmin access panel is rendered.
- `GET /api/control/taxonomy` with `admin` cookie: `403`, `SuperAdmin claim required`.
- `POST /api/control/submissions/fake-id` with empty note: `400`, `Administrative note is required`.
- `GET /taxonomy` with `super_admin` cookie: `200`.
- `GET /api/control/audit-log` with `super_admin` cookie: `200`, audit rows returned.
- `GET /robots.txt`: `200`, `Disallow: /`.
- `GET /sitemap.xml`: `200`, empty URL set.

## Fixed Findings

### ADM-DASH-QA-001: Login `next` Parameter Is Sanitized Before Client Navigation

Severity: Medium

Status: Fixed

Area: Admin dashboard login security

Fix applied:
- Added `dashboard-galaxy/lib/safe-next-path.ts` to normalize dashboard return paths.
- Updated `dashboard-galaxy/components/CorporateLoginForm.tsx` to call `safeDashboardNextPath(searchParams.get('next'))` before `router.replace(...)`.
- Added dashboard permission QA assertions for safe internal paths and blocked external/scheme values.

Acceptance verified:
- `/login?next=/submissions` resolves to `/submissions`.
- `/login?next=/submissions?approvalStatus=pending_review` preserves the internal path and query.
- `/login?next=https://example.com` resolves to `/`.
- `/login?next=//example.com` resolves to `/`.
- `/login?next=javascript:alert(1)` resolves to `/`.

## Observations

- `dashboard-galaxy/proxy.ts` correctly treats `/login` and `/api/admin-session` as public and protects every other route.
- Admin/compliance/super_admin access is required for normal control routes.
- Taxonomy and audit-log pages are SuperAdmin-only, with both proxy-level and page-level checks.
- SuperAdmin-only control APIs return `403` to non-SuperAdmin roles.
- Admin mutation routes validate required notes before forwarding to the backend.
- Document verification requires an administrative review note, and failed documents require a failure reason.
- Document preview iframes are not rendered until the reviewer requests a signed backend URL.
- The dashboard metadata, robots route, sitemap route, and protected response headers are aligned with noindex/private-dashboard behavior.

## Release Recommendation

The admin dashboard passes QA for build, core route protection, role gates, document privacy, safe login return navigation, and live smoke behavior.
