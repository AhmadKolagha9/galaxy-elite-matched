# Native Email Verification And Staff Login Backend

## Goal
Add native email/password staff login and email-code account activation for website registration using the MySQL-backed auth model.

## Requirements
- Public registration creates a user with email verification pending and does not issue a usable member JWT until the email code is verified.
- The backend generates a six-digit verification code, stores only a SHA-256 hash, expiry timestamp, attempt count, and pending/verified status.
- SMTP delivery uses environment variables only. Real mailbox passwords must never be committed.
- POST /api/auth/verify-email validates the code, marks the account email verified, updates profile state, and returns the backend JWT.
- POST /api/auth/resend-verification regenerates a code for unverified accounts with the same security rules.
- POST /api/auth/admin/login accepts staff email/password and only returns a token when the account role is admin, compliance, or super_admin.
- Normal POST /api/auth/login must reject unverified non-staff accounts with a clear email verification required response.
- All mutations use MySQL transactions.

## SMTP Env Contract
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM
- EMAIL_VERIFICATION_TTL_MINUTES

## Acceptance
- Register returns requiresEmailVerification=true and no token.
- Verify email returns token and emailVerificationStatus=verified.
- Staff login works through /api/auth/admin/login using the users table and bcrypt password_hash.
- Wrong code, expired code, and too many attempts return safe 400/401 errors without leaking hashes.
