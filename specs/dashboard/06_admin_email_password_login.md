# Admin Email Password Login

## Goal
Replace backend-token copy/paste login with a strict email/password login against the native backend staff endpoint.

## Requirements
- /login displays email and password fields.
- The dashboard API route posts credentials to POST /api/auth/admin/login.
- Only backend-issued JWTs containing admin, compliance, or super_admin roles are stored in the httpOnly admin cookie.
- Existing route guards continue to validate the cookie through /api/profile/me.
- Token paste login can remain supported by API for emergency use, but the visible UI must be email/password.

## Acceptance
- admin@galaxyelite.ae can sign in after the server-side user is seeded.
- Non-staff member credentials are rejected.
- Expired or tampered stored tokens still fail route protection.
