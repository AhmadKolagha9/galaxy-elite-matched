# QA_AND_ACCEPTANCE.md

## QA objective

Confirm the platform works as a controlled, secure, admin-approved private property matching system.

## Local technical checks

Run:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Expected:

- No TypeScript errors
- Production build completes
- App starts locally
- Main routes load

## Public route checks

Check:

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

Expected:

- Correct branding
- Correct Galaxy Elite theme
- No broken images
- CTA buttons work
- Forms render
- Metadata exists

## Dashboard checks

Check:

```text
/login
/register
/dashboard
/dashboard/profile
/dashboard/matches
/dashboard/post-interest
/dashboard/verified-listing
/dashboard/investor-post
```

Expected:

- Unauthenticated users are redirected/protected
- Registered users can access dashboard
- Users can submit their own forms
- Users cannot access admin unless authorised

## Admin checks

Check:

```text
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
```

Expected:

- Only admin/compliance users can access
- Approval list loads
- Admin can approve/reject/request documents/hold/archive in production implementation
- Actions are persisted
- Actions are logged

## Form validation checks

Forms must validate:

- Required fields
- Email/phone format
- Valid country/category/type values
- Budget min/max logic
- File type/size for documents
- User role permissions
- Consent checkboxes

## Security checks

- Public cannot access admin
- Public cannot access documents
- Users cannot edit others' submissions
- Agents cannot mark themselves verified
- Admin APIs require admin role
- Document URLs are private/signed
- No sensitive data appears in public HTML
- Rate limiting/spam prevention added before launch

## Compliance checks

- Every new post starts pending review and hidden
- Verified listing requires document review
- Agent registration requires licence/identity disclosure
- Investor post budget visibility is respected
- Private availability is not public by default
- Public display excludes sensitive fields
- Audit log records all admin actions

## SEO checks

- Sitemap works
- Robots blocks private/admin routes
- Public pages have title and description
- OpenGraph image works
- Structured data validates
- Country pages are indexable
- Admin/dashboard pages are noindex or blocked

## Browser/device checks

Test:

- Chrome desktop
- Safari desktop
- iPhone Safari
- Android Chrome
- Tablet width

Expected:

- Responsive layout
- Forms usable
- Header/footer usable
- Buttons not clipped
- Logo clear on dark background

## Acceptance criteria for private beta

The project is ready for private beta when:

- Production auth works
- Admin approval persists in DB
- Secure document upload works
- All posts are hidden until approved
- Verified badges cannot be self-assigned
- Interest Board shows only approved items
- Match room works for selected test cases
- Admin audit log works
- Legal pages are in place
- Galaxy Elite team can operate the workflow without developer help

## Acceptance criteria for public launch

The project is ready for public launch when:

- Private beta issues are fixed
- Compliance/legal review is complete
- Monitoring and backups are enabled
- Terms/privacy/cookies are final
- Admin and support process is documented
- SEO public pages are complete
- Analytics are configured
- Support email/WhatsApp are ready
