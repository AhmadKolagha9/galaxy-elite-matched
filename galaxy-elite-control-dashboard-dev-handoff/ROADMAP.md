# ROADMAP.md — Galaxy Elite Private Match

## Phase 0 — Current status

The current package is a working Next.js starter that includes:

- Premium Galaxy Elite design
- Public marketing pages
- Login/register foundation
- Protected dashboard foundation
- Admin dashboard routes
- Approval/compliance/taxonomy routes
- Verified listing form
- Investor post form
- Sanity schemas
- Supabase migrations
- SEO foundations
- Logo and brand assets

The next phases should turn the starter into a production-grade platform.

---

## Phase 1 — Technical audit and setup

**Goal:** Ensure the current package runs cleanly on the developer machine and deployment environment.

Tasks:

- Unzip latest package
- Install dependencies
- Run `npm run typecheck`
- Run `npm run build`
- Confirm all routes load
- Confirm all forms submit in demo/local mode
- Confirm admin routes are protected
- Confirm public pages have metadata and sitemap entries
- Review folder structure and existing docs

Deliverable:

- Technical audit report
- List of bugs/gaps before production work starts

---

## Phase 2 — Production authentication and RBAC

**Goal:** Replace/local-demo authentication with production Supabase Auth and role permissions.

Tasks:

- Configure Supabase Auth
- Create user profile table
- Add roles: user, agent, owner, landlord, developer, investor, admin, compliance, super_admin
- Implement RBAC checks on server side
- Protect `/dashboard`
- Protect `/admin`
- Prevent non-admin users from admin APIs
- Add email verification
- Add forgot password/reset password
- Add session handling

Deliverable:

- Production-ready login/register
- Admin access controlled by role and/or `ADMIN_EMAILS`

---

## Phase 3 — Database and submission persistence

**Goal:** Move submission storage from demo/local flow to Supabase/Postgres.

Tasks:

- Review and extend `001_private_match_schema.sql`
- Review and extend `002_control_dashboard_and_verified_listings.sql`
- Create tables for:
  - interest_signals
  - private_availability
  - verified_listing_requests
  - investor_posts
  - agent_profiles
  - document_uploads
  - admin_actions
  - compliance_checks
  - match_requests
  - match_rooms
  - notifications
  - taxonomy_items
- Add Row Level Security policies
- Add indexes for admin filters
- Add audit timestamps and created_by/updated_by fields

Deliverable:

- Production persistence for every form and admin action

---

## Phase 4 — Full admin control dashboard

**Goal:** Make Galaxy Elite able to approve and control every post.

Tasks:

- Build real admin lists from database
- Add filters by status, type, country, area, category, property type, segment, date, verification state
- Add submission detail pages
- Add action buttons:
  - Approve
  - Reject
  - Request Documents
  - Mark Verified
  - Compliance Hold
  - Archive
  - Publish/Open
  - Hide
- Add internal notes
- Add action history timeline
- Add compliance checklist per submission
- Add admin notifications

Deliverable:

- Admin can fully moderate the platform

---

## Phase 5 — Secure document upload

**Goal:** Enable strict verification for verified listings and agents.

Tasks:

- Implement private document upload to Supabase Storage or S3
- Create private buckets
- Add signed URL access for authorised admins only
- Add file type and size validation
- Add virus/malware scanning if possible
- Add document categories:
  - title deed
  - owner ID
  - passport/Emirates ID
  - POA/authority letter
  - broker licence
  - company licence
  - real estate permit
  - project approval
  - floor plan
  - proof of funds
- Add document expiry dates
- Add document verification status

Deliverable:

- Secure verification document workflow

---

## Phase 6 — Taxonomy management

**Goal:** Allow admin to manage countries, cities/areas, property types, categories, projects, and statuses.

Tasks:

- Convert hardcoded taxonomy from `lib/taxonomy.ts` into database-managed records
- Build `/admin/taxonomy` CRUD
- Add import/export CSV for taxonomy
- Add active/inactive flags
- Add country-specific dropdowns
- Add project/building names
- Add property type/category mapping

Deliverable:

- Admin-editable dropdown system

---

## Phase 7 — Verified listing workflow

**Goal:** Make verified listings possible only after strict review.

Tasks:

- Add verified listing detail page for admin
- Add required document rules by country and listing type
- Add permit fields for applicable jurisdictions
- Add owner/authority verification checklist
- Add compliance hold if missing required documents
- Add public display template for verified listings that does not overexpose private data
- Add verified badge logic

Deliverable:

- Verified listing process ready for private beta

---

## Phase 8 — Investor post workflow

**Goal:** Support investor demand posts and private matching.

Tasks:

- Build investor post detail page
- Add investor verification level
- Add budget visibility and proof-of-funds status
- Add preference filters: residential, commercial, off-plan, secondary, land
- Add target yield, hold period, risk preference, ticket size
- Add matching logic with availability/verified listings
- Add admin approval controls

Deliverable:

- Investor demand engine ready

---

## Phase 9 — Match engine and match rooms

**Goal:** Connect interest, availability, verified listings, and investor posts.

Tasks:

- Create match score logic
- Build admin-created match request flow
- Allow user-requested match flow where applicable
- Add mutual approval states
- Build persistent match rooms
- Add role-aware information reveal
- Add document/contact unlock rules
- Add WhatsApp/email connection only after approval
- Add match history and status updates

Deliverable:

- Private match workflow functioning end-to-end

---

## Phase 10 — Notifications

**Goal:** Keep users and admins updated without exposing contact information.

Tasks:

- Email notifications for submissions, approvals, document requests, match requests
- Admin notifications for new submissions
- Optional WhatsApp Business API notifications
- Newsletter signup and Market Pulse emails
- Notification preferences

Deliverable:

- Controlled communications system

---

## Phase 11 — SEO and Market Pulse

**Goal:** Build organic trust and search visibility.

Tasks:

- Write country landing page content
- Create Market Pulse article templates
- Add schema markup for Organization, Website, FAQ, Article
- Add noindex to admin/dashboard/match rooms
- Add canonical and hreflang where needed
- Build content calendar

Deliverable:

- Search-ready public website and content engine

---

## Phase 12 — Private beta

**Goal:** Test with selected real users before full launch.

Target group:

- 20 buyers/tenants/investors
- 10 owners/landlords
- 5 agents
- 3 developers
- Galaxy Elite admin/compliance team

Beta success criteria:

- Posts submitted successfully
- Admin approvals work
- Documents upload securely
- Agents disclose roles
- Matching workflow works
- Users understand privacy model
- No private documents leak publicly

---

## Phase 13 — Production launch

Recommended first launch:

```text
match.galaxyelite.ae
```

Later expansion:

```text
yourpropertymatch.co
yourpropertymatch.ae
yourpropertymatch.co.uk
```

Launch requirements:

- Legal/compliance review complete
- Production auth live
- Admin workflow live
- Secure document storage live
- Terms/privacy live
- Monitoring enabled
- Backup enabled
- Analytics enabled
- Support process ready
