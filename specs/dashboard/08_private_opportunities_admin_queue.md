# Private Opportunities Admin Queue - Dashboard

## Goal

Give admin/compliance users one operational queue for supply-side Private Availability and demand-side Investor Post records without removing the existing approval engine.

## Admin Route

`/admin/private-opportunities`

## Queue Behavior

- Shows `Private Availability` and `Investor Posts` together.
- Each record keeps its source label so reviewers know the workflow type.
- Records use the existing admin decision card:
  - approval decision
  - public status
  - verification level
  - compliance notes
- Availability records can show attached verification file indicators when present.
- Investor records remain demand-side records and do not imply ownership verification.

## Permissions

- Page is inside `/admin`, so existing admin layout guards apply.
- Backend queue endpoint requires `admin`, `super_admin`, or `compliance` role.
- Save/decision actions keep existing stricter admin write behavior.

## Acceptance Checks

- Non-admin users cannot view the page.
- Admin users can review both availability and investor records in one queue.
- Decisions still update the original record in its original table/collection.
- Audit behavior remains controlled by the existing backend admin submission actions.
