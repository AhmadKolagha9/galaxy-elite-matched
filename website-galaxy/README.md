# Galaxy Elite Private Match — Final Website Build

A premium Next.js website for **Galaxy Elite Real Estate** and its private matching innovation:

> **Public Interest. Private Property. Verified Match.**

This build is designed as a serious, global-ready property platform pilot under Galaxy Elite. It includes a final dark luxury color system, logo assets adjusted to the final palette, user login, protected dashboard, interest board, private availability workflow, transparent agent onboarding, SEO foundations, Sanity-compatible content routes, Supabase-ready authentication, and Vercel/Cloudflare deployment documentation.

## Core model

This is **not** a traditional listing portal. The platform is built around:

- Buyers, tenants, investors and land seekers posting what they want.
- Owners, landlords, developers and licensed agents submitting availability privately.
- Private properties not being publicly advertised by default.
- Agents declaring their role, licence, company and authority.
- Contact opening only after mutual approval.
- Galaxy Elite acting as the trusted brokerage-led verification and execution layer.

## Brand and color system

The final theme uses:

- **Obsidian / Midnight** for privacy, luxury and trust.
- **Champagne Gold** for Galaxy Elite authority and the logo system.
- **Ivory / Pearl** for high readability and premium editorial sections.
- **Teal** for verification, trust signals and live matching indicators.

Logo files are included in:

```text
public/brand
public/icons
public/og
```

See:

```text
docs/FINAL_COLOR_THEME_AND_LOGO.md
```

## Main routes

```text
/
/post-interest
/interest-board
/private-availability
/private-match
/for-agents
/for-owners
/for-landlords
/for-developers
/market-pulse
/uae
/uk
/india
/login
/register
/dashboard
/dashboard/post-interest
/dashboard/matches
/dashboard/profile
/privacy
/terms
```

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test login locally

The project works without Supabase. Register at:

```text
/register
```

Then access:

```text
/dashboard
```

Local demo auth stores users in `.data/users.json`. This is for development only. Use Supabase Auth for production.

## Production auth

Set these in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
AUTH_SECRET=long-random-secret
```

Supabase SSR/cookie-based auth is wired in. Without those env vars, the app falls back to local demo auth.

## Sanity

The API routes save to Sanity if these are configured:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_VERSION=2026-05-26
SANITY_WRITE_TOKEN=...
```

If Sanity is not configured, submissions are saved locally in `.data/` for development.

## SEO

Included:

- Page metadata
- Canonical URLs
- Sitemap
- Robots
- Manifest
- OpenGraph image
- Organization JSON-LD
- Website JSON-LD
- FAQ JSON-LD
- UAE / UK / India landing pages
- Market Pulse content route

## Deploy

Recommended first deployment:

```text
match.galaxyelite.ae
```

Then later connect:

```text
yourpropertymatch.co
yourpropertymatch.ae
yourpropertymatch.co.uk
```

Use **Vercel** for the Next.js app and **Cloudflare** for DNS/security/redirects.

## QA status

Validated locally with:

```bash
npm run typecheck
NEXT_TELEMETRY_DISABLED=1 CI=1 npm run build
```

The production build completed successfully.


## Control dashboard and strict verification add-on

This version adds a full Galaxy Elite control dashboard and approval workflow.

New admin routes:

```text
/admin
/admin/approvals
/admin/compliance
/admin/taxonomy
```

New public/member intake routes:

```text
/verified-listing
/investor-post
/dashboard/verified-listing
/dashboard/investor-post
```

Important rule: every post is created as `Pending Review` and `Hidden`. Nothing appears on the Interest Board until Galaxy Elite approves it from `/admin/approvals`.

For local demo admin access, create an account with role `Admin`. For production, use Supabase Auth and set `ADMIN_EMAILS` in `.env.local` or Vercel environment variables.

Read the full add-on specification:

```text
docs/CONTROL_DASHBOARD_AND_VERIFICATION_SPEC.md
```
