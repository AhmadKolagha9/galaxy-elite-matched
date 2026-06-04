# SPEC.md — Galaxy Elite Private Match

## 1. Product overview

**Galaxy Elite Private Match** is a private property matching platform powered by Galaxy Elite Real Estate. The platform connects verified property demand with verified/private property availability while protecting privacy and preventing uncontrolled property advertising.

The product must support:

- Public interest posts from buyers, tenants, investors, companies, and land seekers
- Private availability submissions from owners, landlords, developers, and agents
- Verified listing requests with strict document uploads and compliance review
- Investor posts for residential, commercial, off-plan, secondary, land, and development opportunities
- Admin approval before anything goes public
- Role transparency, especially for agents and representatives
- Private match rooms after mutual approval
- SEO-driven public pages and Market Pulse content

## 2. Core operating model

```text
User registers
  ↓
Chooses role
  ↓
Submits interest / availability / verified listing request / investor post
  ↓
Submission is hidden and pending review
  ↓
Admin reviews role, content, documents, and compliance
  ↓
Admin approves, rejects, requests documents, or places on hold
  ↓
Approved items may appear on Interest Board or remain private
  ↓
Matching request is created
  ↓
Both sides approve
  ↓
Private Match Room opens
  ↓
Viewing, negotiation, agreement execution, completion
```

## 3. Non-negotiable rules

1. No uncontrolled public property listings.
2. Every new post starts hidden and pending admin approval.
3. Agents must identify themselves as agents.
4. Representatives must disclose who they represent.
5. Contact details are hidden until mutual approval.
6. Documents are private and visible only to authorised admins/compliance users.
7. Verified listing badge requires document verification.
8. Compliance notes and approval history must be logged.
9. Public pages must never expose title deeds, owner IDs, private addresses, or sensitive documents.
10. Galaxy Elite admins must be able to remove, archive, or hold any submission.

## 4. Main user roles

- Visitor
- Registered User
- Buyer
- Tenant
- Investor
- Land Seeker
- Owner
- Landlord
- Developer
- Licensed Agent
- Property Manager
- Representative
- Galaxy Elite Admin
- Compliance Reviewer
- Super Admin

## 5. Main product modules

### 5.1 Public website

Pages:

```text
/
/private-match
/post-interest
/interest-board
/private-availability
/verified-listing
/investor-post
/for-agents
/for-owners
/for-landlords
/for-developers
/market-pulse
/uae
/uk
/india
/privacy
/terms
```

### 5.2 Member dashboard

Pages:

```text
/dashboard
/dashboard/profile
/dashboard/matches
/dashboard/post-interest
/dashboard/verified-listing
/dashboard/investor-post
```

### 5.3 Admin dashboard

Pages:

```text
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
```

Required admin abilities:

- View all submissions by type
- Filter by status, country, category, property type, market segment, verification state
- Approve posts
- Reject posts
- Request documents
- Mark verified
- Put on compliance hold
- Archive posts
- Change public status
- Add internal notes
- Track audit history
- Manage dropdown/taxonomy values

## 6. Submission types

### 6.1 Interest Signal

Created by buyers, tenants, investors, land seekers, and companies.

Fields:

- Submitter role
- Purpose: buy, rent, invest, lease commercial, buy land, JV, development opportunity
- Country
- Area/city
- Project name, if relevant
- Property category
- Property type
- Market segment
- Size requirement
- Budget min/max
- Budget visibility
- Timeline
- Description
- Accepts direct owner/developer/landlord/agent
- Visibility preference
- Status
- Verification level

### 6.2 Private Availability

Created by owners, landlords, developers, agents, or representatives.

Fields:

- Submitter role
- Direct or representative
- Country
- Area/city
- Project name
- Building/tower/community
- Property category
- Property type
- Market segment
- Size
- Price/rent range
- Availability date
- Occupancy status
- Privacy level
- Authority status
- Notes
- Status

### 6.3 Verified Listing Request

Created by a user who wants Galaxy Elite to consider showing an item as a verified listing.

Fields:

- Submitter role
- Owner/landlord/developer/agent/representative type
- Country
- Area/city
- Project name
- Building/tower/community
- Property category
- Property type
- Market segment
- Purpose
- Price/rent range
- Size
- Bedrooms/bathrooms where relevant
- Availability date
- Ownership status
- Permit status
- Document uploads
- Verification status
- Public approval status

### 6.4 Investor Post

Created by investor/family office/company/fund.

Fields:

- Investor type
- Investment goal
- Country/countries
- Area/city preferences
- Property categories
- Market segment
- Ticket size
- Budget visibility
- Target yield
- Risk preference
- Timeline
- Exit strategy
- Preferred respondents
- Verification level
- Public approval status

## 7. Property categories

Top-level categories:

- Residential
- Commercial
- Off-plan
- Secondary
- Land
- Hospitality
- Industrial
- Mixed-use
- Investment

## 8. Property type dropdown examples

Required property types include but are not limited to:

- Apartment
- Villa
- Townhouse
- Duplex
- Penthouse
- Mansion
- Branded residence
- Serviced apartment
- Office
- Camp
- Retail
- Warehouse
- Showroom
- Industrial unit
- Plot
- Development land
- Agricultural land
- Commercial land
- Mixed-use land
- Hotel
- Staff accommodation
- Labour camp
- Clinic / medical space
- Restaurant / F&B space
- Full building
- Bulk units
- Off-plan unit
- Secondary unit

The taxonomy should be admin-editable later. The starter currently uses a `lib/taxonomy.ts` source.

## 9. Status model

### Internal approval status

- Draft
- Pending Review
- Documents Requested
- Under Verification
- Compliance Hold
- Approved
- Rejected
- Archived

### Public status

- Hidden
- Open
- Matching
- Matched
- Archived

### Verification status

- Unverified
- Basic Checked
- Documents Submitted
- Under Review
- Verified
- Verification Failed
- Expired

## 10. Verified badge rules

A listing/request can show a verified badge only if:

- Admin has approved it
- Required identity/authority documents are reviewed
- Ownership or representation authority is checked
- Any required permit fields are captured where applicable
- Compliance reviewer approves the status
- Audit log records who approved and when

## 11. Document upload requirements

Documents must be private and stored securely.

Examples:

- Title deed / ownership proof
- Owner ID / passport / Emirates ID
- Power of Attorney / authority letter
- Broker licence
- Company licence
- RERA / permit / Madmoun / Trakheesi where relevant
- Developer project approval
- Floor plan
- NOC if applicable
- Tenancy/vacancy evidence where applicable
- Proof of funds / source of funds where applicable

## 12. Data privacy

Sensitive data must not be stored in Sanity as public content. Recommended split:

- Sanity: Market Pulse, public pages, non-sensitive CMS content
- Supabase/Postgres: users, submissions, admin actions, match rooms, permissions, sensitive workflow data
- Supabase Storage/S3/private cloud: private documents

## 13. SEO requirements

SEO must support:

- Main homepage
- UAE landing page
- UK landing page
- India landing page
- Private Match page
- Interest Board page
- For Agents page
- For Landlords page
- For Owners page
- For Developers page
- Market Pulse content

SEO must not index private dashboards, admin, document URLs, match rooms, or user-sensitive pages.

## 14. Acceptance criteria

The build is acceptable only when:

- Public posts do not go live without approval
- Admin can control and audit every post
- Verified listing workflow requires documents
- Investor posts support residential/commercial/off-plan/secondary/land preferences
- Agents cannot hide their identity
- Private documents are not public
- Role-based permissions work
- SEO public pages load correctly
- Site passes build, typecheck, accessibility baseline, and security checks
