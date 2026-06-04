# Production Authentication

This project includes two auth modes.

## 1. Local demo auth

Used automatically when Supabase variables are missing. It lets you test registration, login and dashboard access locally.

Do not use local demo auth as the final production member database.

## 2. Supabase Auth

Used automatically when these variables are present:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

The code uses Supabase SSR cookie-based authentication through `@supabase/ssr`, compatible with App Router server components, middleware and server actions.

## Recommended production roles

- Buyer
- Tenant
- Investor
- Land seeker
- Owner
- Landlord
- Developer
- Licensed agent
- Property manager
- Corporate client
- Family office

## Required production upgrades

Before public launch, add:

- Email verification.
- Phone verification / OTP.
- Role verification workflow.
- Agent licence upload and admin approval.
- Owner/landlord authority checks.
- Audit logs for all match approvals.
- Data deletion/export process.
- Rate limiting on auth and forms.
