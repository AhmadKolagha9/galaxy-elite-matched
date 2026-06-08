# Member Session Persistence And Account Menu Fix

## Problem

After successful native backend login, users can still be redirected back to `/login` when opening protected member flows such as `/post-interest`, `/private-availability`, `/investor-post`, or `/dashboard/*`.

The login request succeeds and `/api/auth/session` stores the backend JWT in an HTTP-only cookie, but protected website readers still depend on local JWT verification inside the Next.js runtime. If the website process does not have `AUTH_JWT_SECRET`, the cookie exists but `requireUser()` returns `null`.

## Required Fix

1. Treat the backend API as the authority for backend JWT validation.
2. Keep the HTTP-only cookie written by `/api/auth/session`.
3. When the website needs the current member, validate the cookie token through `GET /api/profile/me` on the backend using `Authorization: Bearer <token>`.
4. Use backend-confirmed identity fields for route protection and member UI state.
5. Never trust unsigned client-supplied role or verification claims for protected routing.

## Account Menu UX

When a member is logged in, the public header should show:

- Compact user icon/initials.
- Verification badge when `verification_status` or `verification_level` is `verified`.
- Dropdown links:
  - Dashboard
  - Profile
  - Verification Center for ID/licence upload
  - Change Password
  - Sign out

## Profile Page UX

The profile page should show:

- Name/email/role/auth mode.
- Verification status.
- Clear actions to manage profile, verify account, and change password.

## Verification UX

ID card upload is handled by the existing `/dashboard/verify` verification center. The account dropdown and profile page should link users there.

## Acceptance Checks

- Login through `/login` creates the backend session cookie.
- `/api/member-session` returns the logged-in user after login.
- Protected public submission pages no longer redirect to login after a valid login.
- Header changes from Login/Register to the account menu after login.
- Verified users show a verification marker in the header.
- Sign out clears the backend cookie and returns the user to the public home page.
