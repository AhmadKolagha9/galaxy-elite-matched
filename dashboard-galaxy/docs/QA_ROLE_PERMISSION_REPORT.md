# QA Role & Permission Report

Date: 2026-06-03
Scope: backend API, standalone admin dashboard, public website build, dashboard route permissions, operation mutation guards, taxonomy tree loop prevention, audit-log display logic.

## Automated checks run

| Area | Command / Check | Result |
| --- | --- | --- |
| Dashboard permission matrix | `npm run qa:permissions` | Passed |
| Backend typecheck | `npm run typecheck` in `backend/` | Passed |
| Backend build | `npm run build` in `backend/` | Passed |
| Dashboard typecheck | `npm run typecheck` in `dashboard-galaxy/` | Passed |
| Dashboard build | `npm run build` in `dashboard-galaxy/` | Passed |
| Website typecheck | `npm run typecheck` in `website-galaxy/` | Passed |
| Website build | `npm run build` in `website-galaxy/` | Passed |

## Runtime smoke checks

| Route / API | Expected | Result |
| --- | --- | --- |
| `GET /api/health` backend | `200 OK` | Passed |
| `GET /api/admin/submissions` without bearer | `401 Unauthorized` | Passed |
| `GET /api/admin/taxonomy` without bearer | `401 Unauthorized` | Passed |
| `GET /api/admin/audit-log` without bearer | `401 Unauthorized` | Passed |
| Website `/interest-board` | `200 OK` | Passed |
| Website `/market-pulse` | `200 OK` | Passed |
| Dashboard `/` without session | Redirect to `/login` | Passed |
| Dashboard `/submissions` without session | Redirect to `/login` | Passed |
| Dashboard `/taxonomy` without session | Redirect to `/login` | Passed |
| Dashboard `/api/control/audit-log` without session | Redirect to `/login` | Passed |
| Dashboard `robots.txt` | `Disallow: /` | Passed |

## Role matrix covered by harness

| Actor | Standard control pages | `/taxonomy` + `/audit-log` pages | superAdmin control APIs |
| --- | --- | --- | --- |
| Anonymous | Redirect login | Redirect login | Redirect login |
| Plain user | Redirect login | Redirect login | Redirect login |
| `admin` | Allowed | Access-denied panel | Forbidden |
| `compliance` | Allowed | Access-denied panel | Forbidden |
| `super_admin` / `superAdmin` | Allowed | Allowed | Allowed |

## Logic checks covered

- Submission approve/reject/hold actions require an administrative note before mutation.
- Document verification requires a review note, and failed documents require a rejection reason.
- Match-room stage changes allow one-step forward/backward movement and reject skipped stage jumps.
- Taxonomy parent picker blocks self-parenting and descendant-parent loops.
- Audit colors map structural actions to teal, amber, gold, and ruby categories.

## Residual risks requiring real environment data

- Real backend staff JWTs were not available in this workspace environment, so live sign-in for `admin`, `compliance`, and `super_admin` accounts was not executed end-to-end against deployed services.
- Backend health requires a live MySQL URL; queue, taxonomy, document, and audit data could not be verified against a live relational database in this workspace.
- Signed document preview flow was structurally tested, but no real uploaded document row was available to validate an actual short-lived signed URL.
- Legacy public website route files and public submission API route files have been removed from the isolated dashboard app; the dashboard build now exposes only login, control pages, control API routes, robots, sitemap, and manifest assets.

## QA verdict

No compile errors were found. No role-matrix logic errors were found in the current dashboard guard model. The main launch blockers are environment-level: backend JWT secret, configured MySQL database, and seeded document/audit/taxonomy records are required for full end-to-end permission testing.

## Staging execution commands added

Create backend staff tokens from `backend/` after `AUTH_JWT_SECRET` is configured:

```bash
npm run auth:token -- 00000000-0000-0000-0000-000000000001 staff-admin@example.com admin
npm run auth:token -- 00000000-0000-0000-0000-000000000002 staff-compliance@example.com compliance
npm run auth:token -- 00000000-0000-0000-0000-000000000003 owner@example.com super_admin
```

Run the full local QA gate from the workspace root:

```bash
npm run qa:all
```

Run the production readiness env/route gate:

```bash
npm run qa:readiness
npm run qa:readiness:strict
```

`qa:readiness:strict` is expected to fail until production/staging environment variables are actually present in the shell or deployment platform.
