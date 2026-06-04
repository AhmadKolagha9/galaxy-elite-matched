# Required Skills For This Project

This project is a private property matching and verification platform. The team must protect the core model: public demand, private supply, admin approval, strict verification, and licensed execution.

## Product And Compliance

- Private marketplace workflow design, not public listing portal design.
- Real estate compliance awareness for UAE/Dubai advertising permits, UK AML considerations, data privacy, brokerage disclosure, agent disclosure, and document handling.
- Admin moderation and audit-trail design.
- Verification workflow design for owners, landlords, developers, agents, representatives, and investors.

## Frontend Dashboard

- Next.js App Router, React, TypeScript, server components, server actions/API routes, route protection, metadata, sitemap, robots, and noindex strategy.
- Form UX for long property/compliance workflows.
- Responsive, accessible admin interfaces with filters, queues, detail pages, status actions, notes, and audit timelines.

## Backend API

- Node.js, Express, TypeScript, structured routing, validation, error handling, logging, rate limiting, and secure CORS.
- Server-side RBAC enforcement. Never trust client role data.
- Submission APIs that force `pending_review`, `hidden`, and non-verified defaults server-side.

## Data And Auth

- Supabase Auth, Postgres schema design, migrations, RLS policies, session handling, email verification, password reset, and admin role assignment.
- Tables for profiles, roles, submissions, verified listing requests, investor posts, documents, admin actions, compliance checks, matches, match rooms, taxonomy, and notifications.
- Audit-safe status transitions and history.

## Private Documents

- Supabase Storage or S3-compatible private storage.
- Signed URLs, private buckets, file type/size validation, expiry dates, document verification status, and admin-only access.
- Optional malware scanning before production launch.

## CMS And SEO

- Sanity for Market Pulse and non-sensitive public content only.
- SEO content strategy for Private Match, Interest Board, Verified Listing, Investor Post, agent/owner/landlord/developer pages, and UAE/UK/India pages.
- Structured data, OpenGraph, canonical URLs, sitemap, robots, and private route noindex controls.

## Notifications And Operations

- Email provider integration such as Resend, SendGrid, or Postmark.
- WhatsApp Business API integration later.
- Admin notifications for new submissions, documents requested, approvals/rejections, match requests, and match rooms.

## QA And Deployment

- TypeScript typechecking and production builds for dashboard and backend.
- Browser/mobile QA, form validation, route protection checks, approved-only public reads, and sensitive-data leak checks.
- Vercel deployment, Cloudflare DNS/WAF/SSL, Supabase setup, Sanity setup, monitoring, backups, and analytics.

## Added Project-Local Codex Skills

Project-local Codex skills were added under:

```text
.codex/skills/
```

Included skills:

- `galaxy-elite-private-match` - core product rules and implementation map.
- `galaxy-backend-api` - Express TypeScript API patterns and submission defaults.
- `galaxy-dashboard-nextjs` - Next.js dashboard, admin UI, forms, route protection, and public display safety.
- `galaxy-supabase-rbac` - Supabase Auth, Postgres, RLS, roles, migrations, and private storage.
- `galaxy-verification-compliance` - verified listings, investor posts, agent disclosure, compliance holds, audit logs, and reveal rules.
- `galaxy-qa-deployment` - build checks, security QA, route protection, SEO/noindex, and deployment gates.

These copies are stored with the project so the skill instructions travel with the repository.

## External Skill Search Result

I searched the public skills ecosystem for Next.js, Express TypeScript, Supabase/Postgres, security, Playwright, and deployment skills. The available matches were mostly low-to-medium install community skills, so I did not install them automatically. For now, the project-specific skill is the safest and highest-signal addition.
