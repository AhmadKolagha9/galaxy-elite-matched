# 06_website_registration_flow_update.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Public Website Registration Flow Optimization & Native Auth Payload Handlers
* **Frontend Architecture:** Next.js App Router (Public Site Views)
* **Target Auth Connection:** Node.js + Express Native API endpoints (`/api/auth/*`)

---

## 2. Frictionless Native Registration Layout
The public register layout is streamlined to maximize customer signup rates by removing all complex compliance blocks:

1. **Upload Component Strip:** Completely remove all drag-and-drop document zones, asset pickers, and identity cards from the public registration screen.
2. **Form Parameters Collected:** Full Name, Email Address, Phone Number, and Password.
3. **The Native Handshake Lifecycle:**
   * Submitting the registration form fires an asynchronous fetch request directly to your Express endpoint: `POST /api/auth/register`.
   * On successful registration, automatically pass the credentials to `POST /api/auth/login` to fetch the backend-issued JWT token string.
   * Save the returned token safely inside secure, HTTP-only browser cookies or a global React state context.
   * Instantly redirect the user's route view away from the public application straight to the member dashboard layout space at `/dashboard`.