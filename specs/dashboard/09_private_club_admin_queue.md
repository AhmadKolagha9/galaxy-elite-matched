# Private Club Admin Queue

## Goal

Add admin visibility for Private Club property posts and matched requests.

## Admin Pages

- `/admin/approvals` continues to show Private Club posts through the verified listing collection.
- `/admin/private-club-requests` lists matched requests for Private Club posts.

## Admin Request Statuses

- `pending_review`
- `in_progress`
- `approved`
- `rejected`
- `closed`

## Requirements

- Admin can see reference code, post title, requester role, owner decision status, admin status, and message.
- Admin can manually update the status and add notes.
- Final contact/process continuation remains manual and controlled by Galaxy Elite.

## Acceptance Checks

- Non-admin users cannot open admin request queue.
- Owner-approved requests appear for admin review.
- Admin status changes are persisted.
- Private documents/contact data are not exposed in the queue cards.
