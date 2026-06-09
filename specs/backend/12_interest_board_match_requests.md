# Interest Board Match Request Backend

## Goal
Merge public interest posting and interest discovery around the Interest Board while preserving server-side moderation, verification, owner consent, and admin-controlled match progression.

## Public Interest IDs
- Every Interest Board post receives a server-generated `reference_code` when it is created. The client cannot submit or modify this code.
- Reference codes use a short public-safe format such as `IB-1A2B3C4D5E6F` and are unique for communication between customers and Galaxy Elite staff.
- Approved public-safe interest records may expose a non-sensitive `public_interest_id` so authenticated members can request a match against a specific approved demand signal.
- Public responses must still redact user IDs, contact details, private descriptions containing contact data, documents, exact unit identifiers, and internal review fields.

## Member APIs
- `GET /api/interest/me` lists the authenticated user's interest posts with current approval status, public status, and `reference_code`.
- `PATCH /api/interest/me/:id` supports owner actions:
  - `publish`: allowed only after admin approval, sets `public_status = open`.
  - `unpublish`: hides an approved post from the public board.
  - `draft`: returns the post to `pending_review` and `hidden` for admin review after edits.
  - `delete`: archives the post and removes it from active public board views.
- `POST /api/interest-match-requests` requires a logged-in verified account and creates a pending owner review request for an approved public interest.
- `GET /api/interest-match-requests/sent` lists requests created by the authenticated user.
- `GET /api/interest-match-requests/received` lists requests received by the authenticated owner of the interest post.
- `PATCH /api/interest-match-requests/:id/cancel` lets the requester cancel while the request is still pending owner/admin processing.
- `PATCH /api/interest-match-requests/:id/owner-decision` lets the interest post owner approve or reject the request. Approval sends the request to admin review.

## Admin APIs
- `GET /api/admin/interest-match-requests` lists owner-approved requests waiting for manual Galaxy Elite processing.
- `PATCH /api/admin/interest-match-requests/:id` lets admin/compliance update `admin_status`, `status`, and `admin_note`.
- Every admin status change writes to `admin_actions`.

## Notifications
- Creating a match request sends an in-app `match_proposed` notification to the interest post owner.
- Owner approval sends an in-app `match_proposed` notification to the requester and email/in-app admin alerts where configured.
- Admin status updates notify the requester in-app using the existing match notification channel.
