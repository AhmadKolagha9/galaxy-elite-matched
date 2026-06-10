# Private Club Verified Listing Backend

## Goal

Promote Verified Listing into a Private Club property-post workflow backed by MySQL, with reference codes and matched-request state.

## Tables

### verified_listing_requests

Add or ensure fields:

- `reference_code varchar(32) unique`
- `owner_user_id varchar(64)`
- `bedrooms int null`
- `rooms int null`
- `availability_date date null`
- `availability_date_label varchar(120) null`
- `availability_type varchar(120) null`
- `privacy_level varchar(120) null`
- `authority_declaration varchar(160) null`
- `category varchar(80) null`
- `offering_type varchar(80) null`
- `furnishing_type varchar(80) null`
- `project_status varchar(120) null`
- `preferred_payment_method enum('Cash','Crypto','Installments') null`
- `amenities json null`

Default states remain:

- `approval_status = pending_review`
- `public_status = hidden`
- `verification_status = documents_submitted`

### private_club_match_requests

- `id char(36) primary key`
- `private_club_post_id char(36) not null`
- `requester_user_id varchar(64) not null`
- `owner_user_id varchar(64) not null`
- `requester_role enum('an agent','Buyer','tenant','other') not null`
- `message text not null`
- `status enum('pending_owner','owner_approved','owner_rejected','cancelled','admin_review') not null default 'pending_owner'`
- `admin_status enum('pending_review','in_progress','approved','rejected','closed') not null default 'pending_review'`
- `owner_note text null`
- `admin_note text null`
- `created_at timestamp default current_timestamp`
- `updated_at timestamp default current_timestamp on update current_timestamp`

## Routes

- `GET /api/private-club` returns approved/member-visible posts with safe fields.
- `POST /api/private-club` creates a post for the authenticated user.
- `GET /api/private-club/me` lists the authenticated user's posts.
- `PATCH /api/private-club/me/:id` updates owner post state.
- `POST /api/private-club-match-requests` creates a verified-user matched request.
- `GET /api/private-club-match-requests/sent`
- `GET /api/private-club-match-requests/received`
- `PATCH /api/private-club-match-requests/:id/cancel`
- `PATCH /api/private-club-match-requests/:id/owner-decision`
- `GET /api/admin/private-club-match-requests`
- `PATCH /api/admin/private-club-match-requests/:id`

## Security

- Private Club page requires login.
- Matched request creation requires verified account.
- User ids are server-authoritative from JWT.
- Documents and private owner contact fields are never returned in public/member board cards.
- Owner approval only moves to admin review; admin still controls final processing.
