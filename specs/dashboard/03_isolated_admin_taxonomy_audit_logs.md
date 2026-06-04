# 03_isolated_admin_taxonomy_audit_logs.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match — Corporate Admin Control Platform
* **Module:** Relational Taxonomy Management UI and System-Wide Security Audit Log Viewer
* **Frontend Architecture:** Standalone Next.js App Router (Isolated corporate operations repository)
* **Target Backend Connection:** Node.js + Express REST API backed by a MySQL Database Engine

---

## 2. Module 1: Hierarchical Taxonomy Editor (`/taxonomy`)
This specialized view enables configuration controllers to manage active categorization properties dynamically from the MySQL `taxonomy_items` data table.

### 2.1 Role Access Boundary
* **Strict Gating:** This route must completely reject traffic unless the active session holds a verified Firebase custom claim property of `superAdmin: true`. If the account only holds `admin` or `compliance` claims, hide menu options and throw an immediate access banner.

### 2.2 Recursive Parent-Child Tree UI Component
* **Target Endpoint:** `GET /api/admin/taxonomy`
* **Interface Presentation Rules:**
  * Parse flat database lookup results into a nested visual structure (e.g., Country `UAE` $\rightarrow$ City `Dubai` $\rightarrow$ Sub-Area `Palm Jumeirah`).
  * Render explicit indicators for status metrics: display a gray pill badge if an element has `is_active = false` and a localized tracking badge displaying the property's `country_scope` parameter.

### 2.3 Taxonomy CRUD Action Handlers
* **Target Actions:** `POST /api/admin/taxonomy` (Create) and `PUT /api/admin/taxonomy/:id` (Update).
* **Form Field Validations:**
  * Automatically compute lowercased, hyphen-separated `slug` elements client-side from the input `label` field as the admin types.
  * **Loop Prevention Constraint:** When modifying an existing entry's parent reference, the interface must validate and completely exclude the node's own ID or child IDs from the dropdown pick-list options.

---

## 3. Module 2: System-Wide Security Audit Log Viewer (`/audit-log`)
A critical compliance view providing corporate transparency and accountability metrics. It streams historical transaction timelines showing exactly who made changes to system states.

### 3.1 Role Access Boundary
* **Strict Gating:** Restricted exclusively to accounts holding the `superAdmin: true` verified claim property.

### 3.2 Live Logging Timeline Sheet
* **Target Endpoint:** `GET /api/admin/audit-log`
* **UI Layout Layout & Columns:**
  * Render an un-editable, dense data matrix sorted chronologically starting with the most recent `timestamp` marker.
  * Map out the 10 mandatory monitoring points cleanly across columns:
    1. **Timestamp:** Formatted cleanly to local business times (`YYYY-MM-DD HH:mm:ss`).
    2. **Actor:** Renders `adminEmail` and `adminUserId` concurrently.
    3. **Action:** Displays the `actionType` using color-coded status badges (e.g., `approve_submission` in green, `reject_submission` in red, `compliance_hold` in amber).
    4. **Target Entity:** Combines `targetObjectType` and `targetObjectId` into a copyable reference block.
    5. **State Transition:** Renders a transformation text tracking arrow format: `[previousStatus]` $\rightarrow$ `[newStatus]`.
    6. **Note / Context:** Renders the descriptive feedback text string explaining the administrative decision.
    7. **IP Context:** Displays the recorded client source `ipAddress` attribute.

---

## 4. Operation & Interface Safety Guardrails
1. **No Layout Interruption on Empty States:** If the audit logging stream returns empty records, render an elegant notification message: *"No administrative data state changes logged within this operational timeline matrix."*
2. **Immutable Component Tree:** The audit log interface must completely drop edit, update, delete, or clean actions. The list components are strictly read-only to ensure absolute compliance data protection.