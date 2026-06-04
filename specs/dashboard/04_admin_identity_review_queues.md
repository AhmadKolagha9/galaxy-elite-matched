# 04_admin_identity_review_queues.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match — Corporate Admin Control Platform
* **Module:** Isolated Identity Document Auditing Interface and Operational Verification Actions
* **Frontend Architecture:** Standalone Next.js App Router (Admin Dashboard Repository completely split from public site)
* **Target Authentication:** Native Backend JWT verifying corporate employee role parameters (`compliance` / `super_admin`)

---

## 2. Central Identity Review Dashboard (`/admin/compliance/identities`)
An exclusive back-office screen functioning as the master checklist matrix monitoring customer accounts that have entered a validation processing queue.

### 2.1 Table Matrix Hydration
* **Target Endpoint:** `GET /api/admin/verification-queue`
* **Headers:** `Authorization: Bearer <Native_Admin_JWT>`
* **Layout Matrix Grid:** Renders columns displaying Customer ID, Email Address, Chosen Registration Role type, Date Submitted, and current Verification State indicators (`under_review`).

---

## 3. Detail Identity Inspection Interface (`/admin/compliance/identities/[id]`)
Provides corporate compliance reviewers with an advanced auditing workspace to pass judgment on customer validation states.

### 3.1 Sandboxed Document Viewer Card
* **Secure Viewing Logic:** The interface calls your custom Express helper handler at `GET /api/admin/documents/:id/view` on element load. Render the returned temporary presigned link inside an isolated, sandboxed client-side iframe panel. Raw cloud bucket structures are completely masked from the DOM.

### 3.2 Action Control Handler Execution
Reviewers manipulate customer verification records using explicit layout control buttons linked directly to your backend database endpoints:
* **The Approval Trigger:** Clicking "Verify Identity Account" fires a network call straight to `POST /api/admin/users/:id/verify-identity` with a payload of `{ "action": "approve" }`. This sets the customer status to verified inside MySQL and fires push messages.
* **The Rejection Trigger:** Clicking "Reject Identity Files" triggers a modal layout block requiring feedback. Submits a payload of `{ "action": "reject", "rejection_reason": "..." }`, reverting the customer row to `action_required`.

---

## 4. UI Operational Protections
1. **Native Role Claims Guarding:** The interface code must verify decoded parameters from the native admin JWT. If the token role claim does not match `compliance` or `super_admin`, block rendering and emit an access restriction panel.
2. **Double Click Protection:** Transition buttons instantly to disabled loading state layouts during active processing to prevent concurrent transaction database overwrites.