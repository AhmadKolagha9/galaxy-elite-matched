# Private Opportunities Investor Demand Tab - Website

## Current Direction

Private Opportunities is now reserved for **Investor Demand** only.

Property supply, private availability, verified property posts, ownership/authority documents, and add-property matched posts belong in the member-only **Private Club** workflow.

## Routes

- `/private-opportunities`
  - Shows the investor demand form only.
  - Requires login through the form/session flow.
- `/private-availability`
  - Redirects to `/private-club?add=1`.
- `/investor-post`
  - Redirects to `/private-opportunities?mode=investor` for compatibility.
- `/dashboard/investor-post`
  - Redirects to `/private-opportunities?mode=investor`.

## Investor Demand Logic

- Submits investor demand without ownership document tools.
- Keeps investor-specific fields such as ticket range, yield, risk, financing method, and respondent permissions.
- Sends payload with `opportunity_type = investor`.
- Existing review defaults remain:
  - `approval_status = pending_review`
  - `public_status = hidden`
  - `verification_status = unverified`

## Property Supply Logic

Property supply is no longer a separate Offer Availability tab. Users add property supply through:

- `/private-club?add=1`

The Private Club post form contains the previous Verified Listing document fields plus useful availability fields.

## Acceptance Checks

- Private Opportunities no longer renders an Offer Availability tab.
- Availability CTAs point to Private Club add-post mode.
- Investor demand submissions still route through the existing investor endpoint/dispatcher.
