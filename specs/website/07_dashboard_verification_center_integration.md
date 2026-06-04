# 07_dashboard_verification_center_integration.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match (Public Website & Customer Panel)
* **Module:** Integrated Member Dashboard Alert Banners & On-Demand ID Upload Verification Components
* **Frontend Architecture:** Next.js App Router (Natively hosting `/dashboard/*` along with public web routes)
* **Target Authentication:** Native Backend JWT verification string read from secure browser cookies/state

---

## 2. Dynamic Gated Banner Indicators
The primary landing workspace inside the logged-in customer panel (`/dashboard`) must dynamically inspect the payload traits of the native backend-issued JWT to render persistent, conditional layout widgets:

* **State Flag: `unverified`**
  * Render a gold banner widget: *"Verification Pending — Your account remains restricted from match pairing systems. Please visit the Verification Center to submit identity validation records."*
* **State Flag: `under_review`**
  * Render an amber warning block: *"Documents Submitted — Your identity verification tracking files are currently undergoing compliance review by our corporate desk managers."* Forms and upload buttons are set to a disabled loading state.
* **State Flag: `action_required`**
  * Render a strict ruby alert box: *"Verification Failed — The documents provided failed our compliance check parameters. Reason: [Dynamic Rejection Notes]. Please update your files in the verification center."*

---

## 3. The Customer Verification Workspace (`/dashboard/verify`)
A secure interface built inside the customer-facing layout allowing users to upload identity files to clear matching restrictions.

### 3.1 Document Selection Interface
* **File Guidelines:** Allows selection of sharp PDF, PNG, or JPEG copies (Max file size: 10MB).
* **Allowed Target Categories:** Dropdown menu options map strictly to the backend database enum strings: `owner_id`, `company_licence`, or `broker_licence`.

### 3.2 Dynamic Upload Handling Sequence
1. Clicking "Upload Verification Profile" dispatches an authorized request to the Express API at `POST /api/upload/sign-url` to retrieve a short-lived storage write slot.
2. The frontend directly streams the file payload to the designated private storage location using the returned parameters.
3. Upon network upload completion, the client triggers an authorized call to the native Express endpoint at `POST /api/users/verification/submit`. The native JWT is embedded inside the `Authorization: Bearer <Native_JWT_String>` header.
4. The backend writes references to MySQL, moves the user's `verification_status` to `'under_review'`, and the frontend updates the local state smoothly to lock down input fields.

---

## 4. Security & SEO Gating Rules
1. **Absolute Search Engine Exclusion:** The layout wrapper matching `app/dashboard/layout.tsx` must explicitly injection `<meta name="robots" content="noindex, nofollow" />` headers. Customer panel interfaces must never be indexable.
2. **Optimistic Loading Locks:** The submit button component must enter a spinning, disabled state instantly upon interaction to mitigate multi-submission database hazards.