# API_AND_ROUTES.md

## Existing public routes

```text
/
/private-match
/post-interest
/interest-board
/private-availability
/verified-listing
/investor-post
/for-agents
/for-owners
/for-landlords
/for-developers
/market-pulse
/uae
/uk
/india
/privacy
/terms
```

## Existing auth/dashboard routes

```text
/login
/register
/dashboard
/dashboard/profile
/dashboard/matches
/dashboard/post-interest
/dashboard/verified-listing
/dashboard/investor-post
```

## Existing admin routes

```text
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
```

## Existing API routes

```text
/api/interest
/api/availability
/api/agent
/api/newsletter
/api/verified-listing
/api/investor-post
```

## Required production API routes

Recommended additions:

```text
/api/admin/submissions
/api/admin/submissions/[id]
/api/admin/submissions/[id]/approve
/api/admin/submissions/[id]/reject
/api/admin/submissions/[id]/request-documents
/api/admin/submissions/[id]/compliance-hold
/api/admin/submissions/[id]/archive
/api/admin/documents
/api/admin/documents/[id]/verify
/api/admin/taxonomy
/api/admin/taxonomy/[id]
/api/matches
/api/matches/[id]
/api/match-rooms
/api/match-rooms/[id]
/api/notifications
/api/upload/sign-url
```

## Route protection rules

### Public

- `/`
- `/private-match`
- `/interest-board`
- `/uae`
- `/uk`
- `/india`
- `/market-pulse`
- `/privacy`
- `/terms`

### Registered users

- `/dashboard/*`
- `/post-interest`, if requiring login before submit
- `/private-availability`, if requiring login before submit
- `/verified-listing`, if requiring login before submit
- `/investor-post`, if requiring login before submit

### Admin/compliance only

- `/admin/*`
- `/api/admin/*`
- document verification APIs

## API response rules

Every POST endpoint should return:

```json
{
  "ok": true,
  "id": "...",
  "status": "pending_review",
  "message": "Submission received and pending Galaxy Elite review."
}
```

Errors should return:

```json
{
  "ok": false,
  "error": "Human-readable error message"
}
```

## Security requirements

- Validate all input server-side.
- Never trust client role data.
- Enforce RBAC on server/API.
- Use CSRF/session-safe patterns where applicable.
- Rate-limit public form submissions.
- Add spam/bot protection.
- Do not expose private document URLs.
- Sanitize public text fields before display.

## Form submission default

All submission APIs must set:

```text
approval_status = pending_review
public_status = hidden
verification_status = unverified or documents_submitted
```

## Public read API rule

Public read endpoints must return only approved fields from records where:

```text
approval_status = approved
public_status in ('open', 'matching', 'matched', 'archived')
```

Private/sensitive fields must be excluded.
