# Developer Summary

## Project name

**Galaxy Elite Private Match**

## Company

**Galaxy Elite Real Estate**

## One-line product definition

Galaxy Elite Private Match is a licensed brokerage-led private property matching platform where buyers, tenants, investors, and land seekers publish interest, owners/landlords/developers/agents submit availability privately, and Galaxy Elite approves, verifies, and matches both sides before any contact or sensitive property information is shared.

## Core promise

```text
Public Interest. Private Property. Verified Match.
```

Now expanded with:

```text
Admin Approval. Strict Verification. Compliance Control.
```

## Product category

This is not a public listing portal. It is a private matching and verification workflow for property intentions.

The website may show buyer/tenant/investor interest cards, but private property details must remain hidden unless Galaxy Elite approves the post as a verified listing and the correct compliance/document checks are completed.

## What was added in the latest version

A full admin/control layer has been added to the existing website package.

New/admin routes:

```text
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
```

New user/member routes:

```text
/verified-listing
/investor-post
/dashboard/verified-listing
/dashboard/investor-post
```

New API routes:

```text
/api/verified-listing
/api/investor-post
```

New supporting files:

```text
lib/taxonomy.ts
lib/admin-store.ts
components/VerifiedListingForm.tsx
components/InvestorPostForm.tsx
components/AdminNav.tsx
components/AdminSubmissionCard.tsx
supabase/migrations/002_control_dashboard_and_verified_listings.sql
sanity/schemas/verifiedListingRequest.ts
sanity/schemas/investorPost.ts
```

## Required principle for all submissions

All user-generated posts must begin as:

```text
status = pending_review
visibility = hidden
requires_admin_approval = true
```

No item should appear publicly until an authorised Galaxy Elite admin approves it.

## Main workflows

### 1. Public Interest

A buyer, tenant, investor, land seeker, or company posts what they want. This can appear on the Interest Board only after approval.

### 2. Private Availability

Owners, landlords, developers, and licensed agents submit what they may have. This remains private unless approved under a verified listing workflow.

### 3. Verified Listing Request

A user can ask Galaxy Elite to list something as verified, but only after document review. Required documents may include title deed, owner ID/passport/Emirates ID, authority letter/POA, broker licence, company licence, RERA/Madmoun/permit/project approval documents, floor plan, and supporting evidence.

### 4. Investor Post

Investors can submit a demand profile covering residential, commercial, off-plan, secondary, land, yield targets, ticket size, location, risk appetite, and timeline. It must be approved before public or member-visible display.

### 5. Admin Approval

Admin can approve, reject, request documents, mark verified, put on compliance hold, archive, and control public status.

### 6. Match Room

After both sides approve a match, Galaxy Elite opens a private match room. Contact details and documents remain hidden until the correct approval stage.

## Developer priority

The current build is a strong starter. The next priority is to convert demo/local flows into a production-grade backend:

1. Supabase Auth with roles and row-level security
2. Supabase database tables and persistent admin actions
3. Private document upload/storage
4. Full admin moderation workflow
5. Notification emails/WhatsApp triggers
6. Compliance audit logs
7. Match scoring and private match room persistence
8. Sanity for content/Market Pulse, not sensitive verification documents

## Important warning

Do not build a feature that allows uncontrolled public property posting. This would turn the platform into a normal portal and weaken the idea. Verified listings are allowed only after strict admin and compliance approval.
