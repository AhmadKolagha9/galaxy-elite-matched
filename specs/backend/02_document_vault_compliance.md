# 02_document_vault_compliance.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Secure Private Document Storage, Signed URL Generation, and Verification Workflows
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Storage Provider:** Supabase Storage Private Buckets

---

## 2. Secure Document Vault Principles
To satisfy global data privacy laws and regional real estate regulatory frameworks (such as the Dubai Land Department and UK AML guidelines), the handling of validation files must remain entirely locked down:

1. **Zero Public Access:** The Supabase storage bucket (`documents`) must be set to `private`. Direct access via unauthenticated public URLs is blocked.
2. **Expiring Signed URLs:** Files are accessed exclusively via short-lived, time-restricted signed URLs (e.g., expiring in 15 minutes). These URLs are generated on-demand by the Express server after authenticating the request.
3. **Payload Sanitation:** The user-facing read APIs can only return document *metadata* statuses (e.g., `verified`, `under_review`). They must never leak the underlying bucket path or temporary links to unauthorized clients.

---

## 3. Strict Document Categorization
The Express upload route must strictly validate incoming files against the following exact strings in the database schema (`document_uploads.document_type`):

* `title_deed` — Title deed / ownership proof.
* `owner_id` — Owner identity card / passport / Emirates ID.
* `power_of_attorney` — Power of Attorney certificates.
* `authority_letter` — Signed authorization form or owner consent document.
* `broker_licence` — Real estate brokerage licence or individual broker ID card.
* `company_licence` — Commercial trade licence.
* `ad_permit` — Dubai Land Department Trakheesi / Madmoun advertising permit details.
* `project_approval` — Developer official project registration or regulatory clearance paperwork.
* `floor_plan` — Engineering or layout file for the matching target.
* `proof_of_funds` — Capital capability statements for high-net-worth investors.

---

## 4. Required API Endpoints

The Express router must expose the following specific route architecture, protected by authentication and RBAC middlewares:

### 4.1 Request a Presigned Upload URL
* **Route:** `POST /api/upload/sign-url`
* **Access:** Authenticated Users (`user`, `owner`, `agent`, etc.)
* **Behavior:** Validates `document_type` and targets the directory layout `private/:userId/:documentType/:filename`. Returns an authorized Supabase upload link.

### 4.2 Fetch Verified Documents Queue
* **Route:** `GET /api/admin/documents`
* **Access:** `compliance`, `admin`, `super_admin` only
* **Behavior:** Returns global tracking data from the `document_uploads` table. Excludes private file links from the base array payload.

### 4.3 View Sensitive Compliance Document
* **Route:** `GET /api/admin/documents/:id/view`
* **Access:** `compliance`, `admin`, `super_admin` only
* **Behavior:** Looks up the file metadata row. Generates an expiring signed URL using the Supabase storage SDK and returns it to the authorized reviewer. Logs an entry to `admin_actions`.

### 4.4 Review / Mutate Document Verification Status
* **Route:** `POST /api/admin/documents/:id/verify`
* **Access:** `compliance`, `super_admin` only
* **Payload:** `{ status: "verified" | "failed", rejection_reason?: string }`
* **Behavior:** Updates the row status. If set to `failed`, requires a `rejection_reason` string. Appends a compliance audit trail row to `compliance_checks`.

---

## 5. Security & Validation Controls
1. **Server Validation Checks:** The Express router must validate incoming text parameters server-side. It must restrict upload extensions to safe formats (`application/pdf`, `image/jpeg`, `image/png`) and limit the file size to 10MB max.
2. **Immutable Upload Ownership:** The backend must fetch `req.user.id` from the decoded session token. It must force this value into the database `owner_user_id` field rather than accepting a raw id from the request body payload.
3. **Atomic Audit Logging:** Any transition of a state flag from `under_review` to `verified` or `failed` must insert a row into the `admin_actions` audit ledger table. This row must capture the admin user ID, targeted object type, timestamp, and context notes.