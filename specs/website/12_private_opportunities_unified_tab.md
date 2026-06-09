# Private Opportunities Unified Tab - Website

## Goal

Merge the public website entry point for Private Availability and Investor Post into one authenticated tab named **Private Opportunities** while preserving the different form fields and business logic for each workflow.

## Routes

- `/private-opportunities`
  - Primary public navigation route.
  - Shows a segmented control with:
    - `Offer Availability`
    - `Investor Demand`
  - Uses the existing Private Availability form for supply-side records.
  - Uses the existing Investor Post form for demand-side records.
- `/private-availability`
  - Redirects to `/private-opportunities?mode=availability`.
- `/investor-post`
  - Redirects to `/private-opportunities?mode=investor`.
- `/dashboard/investor-post`
  - Redirects to `/private-opportunities?mode=investor`.

## Form Logic

### Offer Availability

- Submits owner, landlord, developer, agent, or representative availability.
- Keeps ownership document attachment optional.
- Uploads documents privately before final submission.
- Sends payload with `opportunity_type = availability`.
- Existing review defaults remain:
  - `approval_status = pending_review`
  - `public_status = hidden`
  - `verification_status = unverified`

### Investor Demand

- Submits investor demand without ownership document tools.
- Keeps investor-specific fields such as ticket range, yield, risk, financing method, and respondent permissions.
- Sends payload with `opportunity_type = investor`.
- Existing review defaults remain:
  - `approval_status = pending_review`
  - `public_status = hidden`
  - `verification_status = unverified`

## API Dispatch

Website forms post to `/api/private-opportunities`.

The Next.js API route validates the shared discriminator:

- `availability` routes to `/api/availability`.
- `investor` routes to `/api/investor-post`.

The session user is converted into the backend Bearer token server-side. The client cannot choose user id, role, approval status, public status, or verification status.

## Navigation

- Header shows one tab: **Private Opportunities**.
- The old standalone `Private Availability` and hidden `Investor Post` navigation entries are not shown.
- Footer and market/role CTAs point to `/private-opportunities` with the correct mode where useful.

## Acceptance Checks

- A logged-out user clicking Private Opportunities is sent to login with the correct `next` URL.
- A logged-in user can switch between both forms without losing route clarity.
- Availability submissions still support optional ownership documents.
- Investor demand submissions do not render ownership document controls.
- Old links redirect cleanly.
