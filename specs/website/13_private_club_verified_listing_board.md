# Private Club Verified Listing Board - Website

## Goal

Rename the member-facing Verified Listing tab to **Private Club** and make it a login-required member board for approved verified property posts.

## Route Changes

- Header navigation shows `Private Club` instead of `Verified Listing`.
- `/private-club` is the primary member route.
- `/verified-listing` redirects to `/private-club` for compatibility.
- The Private Club page requires login before any post list, detail modal, or add form is visible.

## Board Features

Private Club shows approved/verified property posts with safe public/member fields only:

- reference code
- title
- country
- city/area
- property type
- requirement type/purpose
- bedrooms
- availability date
- price/rent range
- status
- short description

Filters:

- bedrooms
- availability date from/to
- requirement type: rent, buy, sell, lease commercial, joint venture, developer opportunity, private match only
- country
- city
- property type
- market segment
- payment method
- keyword/reference search

## Add Property Matched Post

The add form keeps the existing Verified Listing document and authority fields, then merges the useful Offer Availability fields:

- availability type
- listing intent
- privacy level
- authority declaration
- category/offering type
- bedrooms/rooms/floors/parking
- furnishing
- project status
- amenities
- preferred payment method
- structured size/price/date fields

Submissions remain hidden until admin review.

## Card Actions

- `View Full Property` requires login and opens a safe modal.
- `Matched` requires login and a verified account.
- Matched request form captures requester role: `an agent`, `Buyer`, `tenant`, `other`.
- Request requires a message and is sent to the Private Club post owner.

## Member Profile

The dashboard profile contains a Private Club manager with:

- my posts
- received matched requests
- sent request history
- cancel sent requests
- owner approve/reject for received requests
- post status actions: publish, unpublish, draft/edit, delete

## Acceptance Checks

- Logged-out users cannot view `/private-club` content.
- Approved Private Club posts can be filtered.
- New posts receive `PC-` reference codes.
- Match request requires verified account.
- Owner approval moves a request into admin review.
