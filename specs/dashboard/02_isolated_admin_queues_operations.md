# 02_isolated_admin_queues_operations.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match — Corporate Admin Control Platform
* **Module:** Submission Queue Moderation, Secure Compliance Document Inspection, and 11-Stage Deal Management Layouts
* **Frontend Architecture:** Standalone Next.js App Router (Isolated repository mapping corporate screens)
* **Target Backend Connection:** Node.js + Express REST API backed by a MySQL Database Engine

---

## 2. Module 1: Central Moderation Queue (`/submissions`)
This interface aggregates pending data rows across all entry points (*Interest Signals, Private Availabilities, Investor Posts*) from the MySQL data layer.

### 2.1 API Integration & Filtering
* **Target Endpoint:** `GET /api/admin/submissions`
* **Required UI Filtering Matrices:**
  * **Type Segment:** Interest, Availability, Investor Post.
  * **Status Enums:** `pending_review`, `under_verification`, `compliance_hold`, `approved`, `rejected`.
  * **Geographic Scope:** Country, Area/City.

### 2.2 Action Control Handlers
Within the detail modal or dynamic page route (`/submissions/[id]`), the layout must expose actionable buttons mapping to server operations:
* **Approve Entry:** Triggers `POST /api/admin/submissions/:id/approve`. Prompts admin to set the public visibility flag (`'open'` to put on the public Interest Board or `'hidden'` to retain for private matching only).
* **Reject / Hold Entry:** Triggers `POST /api/admin/submissions/:id/reject` or `/compliance-hold`. **UI Constraint:** Opens a mandatory text field to collect an administrative note or rejection reason, which is passed inside the JSON request body payload.

---

## 3. Module 2: Compliance Vault & Verification Review (`/documents`)
Dedicated interface for compliance reviewers to audit corporate papers, land registry records, and identities.

### 3.1 Secure Document Hydration Pipeline
* **Target Endpoint:** `GET /api/admin/documents`
* **Safe Viewing Link Request:**
  * Admin cards must **never** expose direct or hardcoded cloud bucket image URLs in the DOM.
  * Clicking a file row item (e.g., *Title Deed Asset*) must trigger an authorized call to `GET /api/admin/documents/:id/view`.
  * The backend returns a short-lived presigned URL. The frontend securely opens this link inside a sandboxed modal or new window frame to preserve document vault isolation.

### 3.2 Audit Verification Checklist UI
The file detail layout (`/documents/[id]`) must render an explicit decision interface:
* **Action Path:** `POST /api/admin/documents/:id/verify`
* **Payload Structure:** `{ status: "verified" | "failed", rejection_reason?: string }`
* **UI Behavior:** Marking a document as `failed` dynamically toggles a required input form block requesting reasons (e.g., *"Expired broker card"* or *"Name mismatch on title deed"*).

---

## 4. Module 3: Deal Flow & Match Room Controller (`/matches`)
This layout maps active client interactions across the official 11-stage pipeline.

### 4.1 Chronological Lifecycle Tracker
The tracking module (`/matches/[id]`) must display a step-by-step progress component representing the active lifecycle stage:
1. `interest_received` $\rightarrow$ 2. `response_received` $\rightarrow$ 3. `identity_check` $\rightarrow$ 4. `authority_check` $\rightarrow$ 5. `match_proposed` $\rightarrow$ 6. `mutual_approval` $\rightarrow$ 7. `match_room_opened` $\rightarrow$ 8. `viewing_meeting` $\rightarrow$ 9. `offer_negotiation` $\rightarrow$ 10. `agreement_executed` $\rightarrow$ 11. `completed`.

### 4.2 Administrative Stage Transition Overrides
* **Mutation Route:** `PATCH /api/admin/match-rooms/:id/stage`
* **UI Controls:** Exposes backward/forward directional layout modifiers allowing an administrator to update the active transaction milestone stage manually, appending audit comment tracking strings.
* **Privacy Override Indicators:** Render clear indicators highlighting whether client identities remain completely masked or have been unblinded based on Stage 6 approval parameters.

---

## 5. Security & Operation Governance Rules
1. **Immutable Audit Trail Execution:** Every button operation executing a state change inside these panels must accept a text string parameter to feed background logger modules.
2. **Client-Side Optimistic UI Safeguard:** Buttons must immediately enter a disabled loading state upon interaction to prevent duplicate network calls during transactional database writes.