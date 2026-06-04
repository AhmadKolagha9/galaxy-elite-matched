# 05_admin_identity_review_queues.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match — Corporate Admin Control Platform
* **Module:** Compliance Data Auditing Tables and Verification State Modifications
* **Frontend Architecture:** Standalone Next.js App Router (Admin-Only Repository)
* **Target Authentication:** Native Backend JWT role-verification layer (`compliance` / `super_admin`)

---

## 2. Integrated Identity Review Dashboard (`/admin/compliance/identities`)
An isolated workspace layout built for platform administration teams to verify newly registered customer profiles and prioritize entries that contain attached document items.

### 2.1 Backlog Layout Grid Columns
* Synchronize table metrics to read data elements from `GET /api/admin/verification-queue`, mapping: Customer ID, Email Address, Chosen Role type, Payment Mode configuration, and an optional **"Ownership Papers Attached"** status indicator flag (`has_verification_files_attached`).

---

## 3. Detail Validation View (`/admin/compliance/identities/[id]`)
Provides administrators with an isolated screen splitting context parameters and operational decisions cleanly.

### 3.1 Sandboxed Vault Card
* The card component fetches document assets securely by sending authorization tokens to `GET /api/admin/documents/:id/view`. Render the resulting short-lived presigned URL inside a sandboxed client iframe container to prevent raw path data from leaking into the DOM layout tree.

### 3.2 Action Control Handler Execution
Reviewers manipulate data rows natively via dedicated button controls connected to backend query functions:
* **Approve Profile Verification:** Triggers `POST /api/admin/users/:id/verify-identity` passing an action tag of `"approve"`. Updates user states to verified within MySQL and unlocks their global match compatibility.
* **Reject Profile Verification:** Displays an input overlay modal when activated. Dispatches an action tag of `"reject"`, forcing the user to pass a string description directly inside the `rejection_reason` body data model.

---

## 4. UI Operational Protections
1. **Role Gating Security:** Enforce client-side route shielding by scanning tokens for claims. If a session profile completely lacks an active `compliance` or `super_admin` marker, terminate rendering and show an explicit permission failure block.
2. **Optimistic Feedback States:** Freeze interaction states upon request invocation to maintain absolute transactional integrity throughout the processing phase.