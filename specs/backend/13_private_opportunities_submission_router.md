# Private Opportunities Submission Router - Backend

## Goal

Expose a unified backend submission endpoint for website Private Opportunities while keeping Private Availability and Investor Post in their existing database tables and review workflows.

## Route

`POST /api/private-opportunities`

Required JSON discriminator:

```json
{
  "opportunity_type": "availability"
}
```

Allowed values:

- `availability`
- `investor`

## Dispatch Rules

### availability

- Validate with the structured `privateAvailabilitySchema`.
- Insert into `private_availability`.
- Preserve optional verification document handling.
- Toggle `has_verification_files_attached` when verification document metadata is present.

### investor

- Sanitize and validate as submission type `investor`.
- Insert into `investor_posts`.
- Preserve investor-specific fields and public-selectable admin workflow.

## Security

- Endpoint requires native JWT authentication.
- User id is taken only from the verified request principal.
- Client-supplied user id, approval status, public status, verification status, and admin fields are ignored.
- All accepted submissions default to pending hidden review states.

## Admin API

`GET /api/admin/submissions/private-opportunities`

Returns a combined queue containing:

- `availability`
- `investor`

Optional filter:

- `approvalStatus=pending_review`

The route is gated by admin or compliance role checks.

## Acceptance Checks

- Missing or invalid `opportunity_type` returns HTTP 400.
- Logged-out calls return HTTP 401.
- Availability payloads enter `private_availability`.
- Investor payloads enter `investor_posts`.
- Combined admin queue returns both record types sorted newest first.
