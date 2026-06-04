# Galaxy Elite Private Match — Developer Handoff Pack

**Project:** Galaxy Elite Private Match  
**Company / Brokerage:** Galaxy Elite Real Estate  
**Core promise:** Public Interest. Private Property. Verified Match.  
**Current build package:** `dashboard-galaxy.zip`

This pack summarises the product vision, the technical state of the current build, the admin/control dashboard requirements, the verified listing workflow, investor post workflow, compliance principles, roadmap, and next implementation tasks.

## What the developer should understand first

Galaxy Elite Private Match is **not** a traditional property portal. It must not become a normal website where anyone can publicly upload and advertise properties.

The product model is:

```text
Public interest.
Private property.
Verified match.
Admin approval.
Strict compliance.
Licensed execution.
```

Users may publicly post what they are looking for, such as land, residential property, commercial property, office, camp, duplex, investment, or rental demand. Owners, landlords, developers, and licensed agents may submit availability or verified listing requests privately. Every post, listing request, investor post, agent registration, and availability submission must start as **Pending Review** and stay hidden until Galaxy Elite approves it.

## Files in this handoff pack

| File | Purpose |
|---|---|
| `DEVELOPER_SUMMARY.md` | Short summary to send to the developer |
| `SPEC.md` | Full product and technical specification |
| `ROADMAP.md` | Build roadmap from current package to production launch |
| `WHAT_WE_HAVE_DONE.md` | What has already been built in the current package |
| `WHAT_TO_DO_NEXT.md` | What the developer should do next |
| `ADMIN_CONTROL_DASHBOARD_SPEC.md` | Admin approval, compliance, taxonomy, and moderation requirements |
| `VERIFIED_LISTING_SPEC.md` | Verified listing workflow and document requirements |
| `INVESTOR_POST_SPEC.md` | Investor post workflow |
| `TAXONOMY_AND_DROPDOWNS.md` | Required dropdowns for countries, areas, categories, property types, projects, statuses |
| `DATA_MODEL.md` | Recommended database model |
| `USER_ROLES_AND_PERMISSIONS.md` | RBAC and permissions model |
| `API_AND_ROUTES.md` | Existing and required routes/API structure |
| `COMPLIANCE_AND_VERIFICATION.md` | Compliance notes and verification process |
| `SEO_AND_CONTENT_PLAN.md` | SEO and Market Pulse content plan |
| `QA_AND_ACCEPTANCE.md` | Quality assurance and acceptance checklist |
| `DEPLOYMENT_CHECKLIST.md` | Vercel, Cloudflare, Supabase, Sanity deployment checklist |
| `CONFIDENTIALITY_NOTICE.md` | Confidentiality/IP protection notice |

## Current package summary

The latest build includes:

- Next.js App Router website
- Galaxy Elite luxury theme and logo assets
- Login/register and protected dashboard foundation
- Public pages for Private Match, Interest Board, verified listing, investor post, agents, owners, landlords, developers, UAE, UK, India, Market Pulse
- API routes for interest, availability, agent, newsletter, verified listing, investor post
- Admin control routes: `/admin`, `/admin/approvals`, `/admin/compliance`, `/admin/taxonomy`
- Dashboard routes: `/dashboard`, `/dashboard/profile`, `/dashboard/matches`, `/dashboard/post-interest`, `/dashboard/verified-listing`, `/dashboard/investor-post`
- Taxonomy file for categories and dropdowns
- Sanity schemas for content/workflow objects
- Supabase migrations for production data model foundation
- SEO foundations: metadata, sitemap, robots, OpenGraph image, JSON-LD

## Most important implementation rule

Do **not** remove or weaken the core model. The new admin dashboard and verified listing features are additions to the existing innovation, not a change of direction.

Every public post or listing request must follow this default:

```text
Default status: Pending Review
Default visibility: Hidden
Public display: Only after admin approval
Verification: Required before verified badge/listing status
Documents: Stored privately, never public
Contact: Hidden until mutual approval
```
