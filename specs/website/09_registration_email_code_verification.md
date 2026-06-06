# Website Registration Email Code Verification

## Goal
Require users to confirm their email with an SMTP-delivered code before the website stores a member session.

## Requirements
- /register submits to POST /api/auth/register.
- On success, route to /verify-email with the registered email.
- /verify-email displays a six-digit code form and optional resend action.
- Verification posts to POST /api/auth/verify-email.
- When a token is returned, POST /api/auth/session stores the backend JWT cookie and routes to /dashboard.
- Inputs freeze while requests are pending to prevent duplicate submissions.

## Acceptance
- New account cannot access authenticated member flows until code verification succeeds.
- Verification errors are displayed without exposing system details.
- Resend works for pending accounts and does not issue a token before code verification.
