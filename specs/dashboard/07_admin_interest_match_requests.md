# Admin Interest Match Requests

## Goal
Owner-approved Interest Board match requests enter the admin dashboard for manual Galaxy Elite processing.

## Admin Route
- Path: `/admin/compliance/interest-matches`.
- Access: compliance, admin, or super admin role through existing admin layout guards.

## Queue
- Render requester, interest title, requester role, owner/admin statuses, submitted date, and message.
- Admin can set status to `in_progress`, `approved`, `rejected`, or `closed` with a note.
- Backend writes every admin status mutation to `admin_actions`.

## Product Rule
Admin status changes do not automatically reveal contact details or create a match room. Galaxy Elite must manually continue the process according to verification, authority, and deal-room rules.
