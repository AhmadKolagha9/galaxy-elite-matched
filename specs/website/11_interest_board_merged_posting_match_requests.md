# Website Interest Board Merge

## Goal
The public navigation exposes one **Interest Board** entry. The Interest Board page shows approved demand signals, has a top **Add Interest** button, and contains the same fields that previously lived in Post Interest.

## Board UX
- `/post-interest` and `/dashboard/post-interest` redirect to `/interest-board?add=1`.
- The Interest Board has filters and public-safe interest cards.
- Each card has:
  - `View Full Interest`: requires login and opens a public-safe detail modal.
  - `Matched`: requires login and a verified account, then opens a request modal.
- The match request modal requires a role selection from: `the owner`, `the landlord`, `an agent`, `Buyer`, `tenant`, `prospective tenant`.
- The match request modal requires a message before submission.

## Interest Form UX
- Activation date uses the browser date picker on focus/click and is styled consistently.
- All website selects use a polished dropdown style.
- Amenities use a multi-select dropdown. Selected amenities appear as removable chips and are sent as the existing `amenities[]` payload.

## Profile Management
- `/dashboard/profile` includes Interest Board management tabs:
  - My Interest Posts: publish, unpublish, return to review/draft, archive/delete, and edit entry point.
  - Received Match Requests: approve or reject incoming requests from matched users.
  - Sent Match Requests: view request history and cancel eligible requests.

## Security
- Full interest view remains public-safe; no owner contact details, user IDs, internal notes, documents, exact unit numbers, or private storage paths render in the browser.
- Match request creation goes through same-origin Next.js API routes so the HTTP-only backend JWT stays private.
