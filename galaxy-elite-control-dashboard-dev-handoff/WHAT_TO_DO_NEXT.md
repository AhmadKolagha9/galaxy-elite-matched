# WHAT_TO_DO_NEXT.md

## Immediate developer tasks

### 1. Run and audit the current build

Commands:

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

Confirm:

- Homepage loads
- Login/register load
- Dashboard protection works
- Admin routes are protected
- Forms submit
- Interest Board displays approved/demo cards only
- API routes return expected responses
- Sitemap and robots work

### 2. Connect production authentication

Implement Supabase Auth properly:

- Email/password registration
- Email verification
- Password reset
- Session persistence
- Role mapping
- Admin-only access
- RLS policies

### 3. Build production database layer

Move from demo/local store to database persistence.

Tables to implement:

- profiles
- user_roles
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
- taxonomy_items
- notifications

### 4. Secure document upload

Implement private storage for:

- title deed
- owner ID
- passport/Emirates ID
- authority letter/POA
- broker licence
- company licence
- real estate permit
- project approval
- floor plan
- proof of funds

Requirements:

- Private bucket
- Signed URLs only
- Admin-only access
- File size/type validation
- Document category
- Expiry date
- Verification status
- Audit trail

### 5. Complete admin dashboard

Admin must be able to:

- View all submissions
- Filter and search
- Open detail view
- Approve
- Reject
- Request documents
- Mark verified
- Put on compliance hold
- Archive
- Hide/show public status
- Add internal notes
- See audit timeline

### 6. Make taxonomy admin-editable

Current `lib/taxonomy.ts` is fine for MVP, but production should allow admin management.

Required admin-managed taxonomy:

- Countries
- Areas/cities
- Projects
- Buildings/towers
- Communities
- Property categories
- Property types
- Market segments
- Purpose values
- Document types
- Status values

### 7. Complete verified listing workflow

Required functionality:

- Submission detail page
- Required document checklist by country/category
- Verification status changes
- Admin notes
- Compliance hold logic
- Verified listing public display only after approval
- Verified badge rules
- Expiry/reverification process

### 8. Complete investor post workflow

Required functionality:

- Investor post detail page
- Budget visibility rules
- Proof-of-funds verification flag
- Target yield/risk/timeline filters
- Admin approval
- Matching with availability/verified listings

### 9. Build match engine

Start simple.

Match score should consider:

- Country/area fit
- Property category/type
- Market segment
- Budget/range overlap
- Size fit
- Timeline fit
- Verification level
- Direct/agent preference
- Privacy compatibility

### 10. Build real match rooms

Match rooms must be persistent and private.

Features:

- Participants
- Role visibility
- Status timeline
- Notes
- Documents visible by permission
- Contact unlock after mutual approval
- WhatsApp/email trigger after approval
- Admin oversight

### 11. Add notifications

Add email first, WhatsApp later.

Events:

- New submission
- Approved/rejected
- Documents requested
- Match proposed
- Match approved/declined
- Match room opened
- Agreement executed/completed

### 12. Legal/compliance content

Before launch, finalise:

- Terms of Use
- Privacy Policy
- Cookie Policy
- Brokerage Disclosure
- Agent Disclosure Policy
- No Public Property Advertising Policy
- Verification Policy
- Document Handling Policy
- Data Retention Policy
- AML/KYC policy where required

### 13. Private beta

Run beta with controlled users before public launch.

Collect feedback from:

- Buyers
- Tenants
- Owners
- Landlords
- Agents
- Developers
- Galaxy Elite admin team

### 14. Production deployment

Deploy first to:

```text
match.galaxyelite.ae
```

Then later connect:

```text
yourpropertymatch.co
yourpropertymatch.ae
yourpropertymatch.co.uk
```

## Do not do next

Do not:

- Add uncontrolled public property upload
- Expose private documents publicly
- Let agents hide their identity
- Allow direct contact before approval
- Use Sanity for sensitive documents
- Launch globally before UAE/UK/private beta workflow is stable
