# Agent Account Upgrade Flow

## Goal
Move agent onboarding out of the public header and into the authenticated account menu as **Join like agent**. A signed-in member can save an agent application draft, upload private ID and broker licence files, send the request to compliance/admin review, and become a verified agent account only after approval.

## Navigation
- Remove the public `Agents` tab from the main website header.
- Add `Join like agent` inside the authenticated profile dropdown.
- Route target: `/dashboard/join-agent`.

## Member Workflow
- The page requires a native backend session.
- Show saved account name/email from the backend session.
- Allow business fields: company name, broker licence number, country, notes.
- Required documents before Send:
  - `owner_id` for identity proof if not already uploaded for this agent request.
  - `broker_licence` for licence proof.
- `Save` creates or updates a draft application.
- `Send` freezes the application into `pending_review` and sends it to admin review.
- Uploaded files use existing private signed-upload URLs and are saved under the authenticated user's private namespace.

## Backend Workflow
- New MySQL table: `agent_applications`.
- Member routes:
  - `GET /api/agent-applications/me`
  - `POST /api/agent-applications/save`
  - `POST /api/agent-applications/submit`
- Admin routes:
  - `GET /api/admin/agent-applications`
  - `GET /api/admin/agent-applications/:id`
  - `POST /api/admin/agent-applications/:id/review`
- The server always uses `req.user.id`; user IDs from the client are ignored.
- Approval updates `users.primary_role = 'agent'`, `users.verification_status = 'verified'`, upserts `profiles`, adds `user_roles` rows, marks agent documents verified, writes `admin_actions`, and records a compliance check in one transaction.
- Rejection requires feedback, marks the application rejected, marks agent documents failed, writes audit, and records compliance checks.

## Admin Dashboard
- Add an Agent Review tab under admin/compliance.
- Show pending agent applications, document counts, company/licence fields, and applicant email.
- Detail workspace shows application metadata and secure document iframe cards via expiring signed URLs.
- Approve and Reject actions must call backend review APIs; rejection requires note text.

## Security
- No document storage paths are rendered publicly.
- Document viewing uses existing signed admin document route.
- Users cannot submit documents outside their private namespace.
- Users cannot self-promote to agent or verified status.
