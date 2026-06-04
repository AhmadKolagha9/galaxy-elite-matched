# ADMIN_CONTROL_DASHBOARD_SPEC.md

## Purpose

The admin dashboard is the control centre for Galaxy Elite. It must ensure that nothing goes public without review, no agent hides their role, no verified listing badge appears without document checks, and no private property data leaks.

## Admin routes

Existing route foundations:

```text
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
```

Required production routes:

```text
/admin/submissions
/admin/submissions/[id]
/admin/users
/admin/users/[id]
/admin/documents
/admin/documents/[id]
/admin/matches
/admin/matches/[id]
/admin/taxonomy
/admin/audit-log
/admin/settings
```

## Admin roles

### Super Admin

Full access.

### Admin

Can review, approve, reject, and manage submissions.

### Compliance Reviewer

Can verify documents, mark compliance hold, approve verification, reject verification.

### Content Editor

Can manage Market Pulse and public content only.

### Support

Can view limited user/submission details and add support notes.

## Admin dashboard cards

Admin dashboard should show:

- New pending submissions
- Documents requested
- Compliance holds
- Agent verification pending
- Verified listing requests pending
- Investor posts pending
- Match requests pending
- Expiring documents
- New newsletter subscribers
- Recent admin actions

## Approval queue filters

Filters required:

- Submission type
- Status
- Verification status
- Public status
- Country
- Area/city
- Property category
- Property type
- Market segment
- Submitter role
- Date submitted
- Assigned reviewer
- Compliance hold only
- Missing documents only

## Submission types in approval queue

- Interest Signal
- Private Availability
- Verified Listing Request
- Investor Post
- Agent Profile
- Developer Profile
- Newsletter Subscriber, optional for moderation

## Admin actions

Each submission detail page must support:

- Approve
- Reject
- Request More Documents
- Mark Under Verification
- Mark Verified
- Verification Failed
- Compliance Hold
- Archive
- Restore
- Set public status to Hidden/Open/Matching/Matched/Archived
- Add internal note
- Assign reviewer
- Add tag/priority
- Send user notification

## Required admin note fields

- Internal note
- Compliance note
- Rejection reason
- Document request message
- Verification note
- Public display note
- Match recommendation note

## Audit log requirements

Every admin action must record:

- Admin user ID
- Admin email
- Action type
- Target object type
- Target object ID
- Previous status
- New status
- Note/reason
- Timestamp
- IP address, if available

## Status control

### Approval status

```text
draft
pending_review
documents_requested
under_verification
compliance_hold
approved
rejected
archived
```

### Public status

```text
hidden
open
matching
matched
archived
```

### Verification status

```text
unverified
basic_checked
documents_submitted
under_review
verified
failed
expired
```

## Approval logic

### Interest Signal

Can be published after content review and role check.

### Private Availability

Should remain private by default. May be used for matching after admin review.

### Verified Listing Request

Cannot be public or verified until required documents are reviewed.

### Investor Post

Can become public/member-visible only after approval and privacy/budget visibility check.

### Agent Profile

Cannot respond as an agent until licence/disclosure check is complete.

## Public display safeguards

Admin must be able to control which fields are public.

Never public by default:

- Exact owner name
- Owner ID
- Title deed
- Passport/Emirates ID
- Exact unit number
- Private documents
- Direct phone/email
- Full address if privacy level is private
- Sensitive pricing if budget visibility is hidden

## Admin UX requirement

Dashboard must be simple and efficient. The admin team should be able to approve/reject from the queue, but detailed verification must happen from a detail page.

## Success criteria

Admin dashboard is successful when Galaxy Elite can say:

> No post, listing, agent, investor request, or private availability goes public or becomes verified unless our team approved it and the audit log proves it.
