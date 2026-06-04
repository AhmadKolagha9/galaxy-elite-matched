# Galaxy Elite Private Match — Control Dashboard and Strict Verification Add-On

## Purpose

This add-on keeps the existing Galaxy Elite Private Match concept unchanged and adds a full control layer:

- Every post enters the admin dashboard first.
- Nothing appears publicly until Galaxy Elite approves it.
- Private availability stays private by default.
- Verified listing requests require strict document review.
- Investor posts are reviewed before visibility.
- Agents still must disclose their role.

Core promise remains:

```text
Public Interest. Private Property. Verified Match.
```

## New Routes Added

```text
/verified-listing
/investor-post
/dashboard/verified-listing
/dashboard/investor-post
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
/api/verified-listing
/api/investor-post
```

## Admin Control Dashboard

Admin dashboard route:

```text
/admin
```

The dashboard includes:

- Total submissions
- Pending review count
- Approved / verified count
- Document / compliance hold count
- Approval queue shortcut
- Compliance vault shortcut
- Dropdown / taxonomy reference

Admin approval queue route:

```text
/admin/approvals
```

Admins can review:

- Interest posts
- Private availability
- Verified listing requests
- Investor posts
- Agent registrations

Admin can set:

- Approval decision: Pending, Approve, Mark Verified, Request Documents, Compliance Hold, Reject, Archive
- Public status: Hidden, Open, Matching, Matched, Archived
- Verification level
- Compliance notes

## Approval Rule

All user submissions are stored with:

```text
approvalStatus = pending
publicStatus = Hidden
status = Pending Review
```

The Interest Board only shows submissions that are:

```text
approvalStatus = approved OR verified
publicStatus = Open / Matching / Matched / Archived
```

This prevents automatic public publishing.

## Verified Listing Workflow

Route:

```text
/verified-listing
```

A verified listing request supports:

- Submitter role
- Listing intent
- Residential / Commercial / Off-plan / Secondary / Land / Industrial / Hospitality / Investment
- Purpose
- Country
- Area / city
- Project / community name
- Building / tower name
- Property type
- Size
- Price / rent range
- Availability date
- Ownership status
- Permit status
- Description
- Contact details
- Document uploads

Document upload fields:

- Title deed / ownership proof
- Owner ID / passport / Emirates ID
- Authority letter / POA
- Broker / company licence
- Permit / RERA / Madmoun / project approval
- Floor plan / photos / supporting documents

Important production note: the starter stores document metadata only. In production, documents must be stored in a private secure storage bucket such as Supabase Storage or a locked cloud bucket with signed URLs, access logs and admin-only permissions.

## Investor Post Workflow

Route:

```text
/investor-post
```

Investor post supports:

- Investor profile
- Investment goal
- Market segment
- Country
- Area / city
- Property type
- Ticket size / budget
- Target yield / return
- Risk preference
- Timeline
- Budget visibility
- Responder preference
- Investor brief
- Contact details

Investor posts also enter pending approval first.

## Dropdown / Taxonomy Control

Current dropdown values are centralized in:

```text
lib/taxonomy.ts
```

This includes:

- Countries
- Area / city presets
- Market segments
- Property types
- Purpose options
- Budget visibility
- Timeline
- Response preference
- Owner role options
- Availability type
- Listing intent
- Verification document types
- Admin decisions
- Investor profile and goal options

Future improvement: move taxonomy control to Sanity or Supabase so admins can edit dropdowns without code.

## Admin Access

Admin routes are protected by login and admin check.

A user is admin if:

```text
role = Admin
```

or email is included in:

```text
ADMIN_EMAILS
```

For local demo, register with role `Admin` to test `/admin`.

For production, use Supabase Auth and set admin emails in environment variables.

## Files Added / Changed

New core files:

```text
lib/taxonomy.ts
lib/admin-store.ts
components/AdminNav.tsx
components/AdminSubmissionCard.tsx
components/VerifiedListingForm.tsx
components/InvestorPostForm.tsx
app/admin/*
app/verified-listing/page.tsx
app/investor-post/page.tsx
app/api/verified-listing/route.ts
app/api/investor-post/route.ts
sanity/schemas/verifiedListingRequest.ts
sanity/schemas/investorPost.ts
supabase/migrations/002_control_dashboard_and_verified_listings.sql
```

Updated files:

```text
lib/auth.ts
lib/site.ts
lib/validation.ts
components/InterestForm.tsx
components/AvailabilityForm.tsx
components/FormStatus.tsx
app/interest-board/page.tsx
app/dashboard/page.tsx
app/sitemap.ts
app/globals.css
```

## Compliance Notes

- Public property advertising should remain blocked unless permits and authority are approved.
- Verified listing requests must never bypass admin approval.
- Agent submissions must disclose licence, company and who they represent.
- Owner ID, title deed and authority documents should be handled securely.
- Production document storage must be private and access-controlled.
- Keep audit logs for every admin decision.

## Recommended Next Build Phase

1. Move local JSON storage into Supabase tables.
2. Add private Supabase Storage buckets for documents.
3. Add admin role table and RLS policies.
4. Add email alerts when admin requests documents.
5. Add Match Room creation from approved submissions.
6. Add admin audit log for every decision.
7. Add CMS-controlled dropdown management.
