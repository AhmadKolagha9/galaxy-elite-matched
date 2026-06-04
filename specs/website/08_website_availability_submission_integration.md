# 08_website_availability_submission_integration.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match (Public Website & Customer Dashboard)
* **Module:** Payment Dropdown Implementation and Optional Title Deed Document Capture Layers
* **Frontend Architecture:** Next.js App Router (Natively hosting `/dashboard/*` alongside public pages)
* **Target Authentication:** Native Backend JWT cookie context

---

## 2. Synchronized Customer Form Views

### 2.1 Interface Variant 1: Private Availability Component (`/dashboard/private-availability`)
When an owner or representative logs available assets on the platform, the interface must capture transaction terms and optional validation proof elements:

1. **Transaction Path Selection:**
   * Render a premium dropdown input block labeled **"Preferred Payment Method"**.
   * Selection Options: `<option>Cash</option><option>Crypto</option><option>Installments</option>`.
2. **Optional Property Ownership Uploader:**
   * Render an asset upload field container labeled **"Attach Ownership Papers / Title Deeds (Optional)"**.
   * *Dynamic Behavior:* If an identity document is introduced, the client runs the cloud storage mechanism to fetch a signed path via `POST /api/upload/sign-url`, transfers the asset, and passes the resulting path cleanly inside the structural creation request body to `POST /api/availability`.

### 2.2 Interface Variant 2: Interested Demand Component (`/dashboard/post-interest`)
When a buyer or investor profile details what they are searching for, the interface handles financial profiling seamlessly:

1. **Transaction Path Selection:**
   * Render the corresponding **"Preferred Payment Method"** selector dropdown element containing options for `Cash`, `Crypto`, and `Installments`.
   * *Functional Boundary:* No document file slots or verification upload structures are loaded into this user layout view.

---

## 3. Structural Safeguards
1. **Omission Control:** Form components must never bind or append operational fields like `approval_status` or `has_verification_files_attached` inside client payloads. These states are resolved exclusively on the server.
2. **Double Click Prevention:** Submission handlers must lock into a loading state immediately upon activation to prevent concurrent database mutation conflicts.