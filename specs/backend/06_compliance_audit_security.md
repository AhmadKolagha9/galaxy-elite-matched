# 06_compliance_audit_security.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Compliance Auditing, Server-Side Security Gates, and Token Verification
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Backend Admin SDK:** Firebase Admin SDK (`firebase-admin`)
* **Database Target:** Cloud Firestore Collections: `admin_actions`, `compliance_checks`

---

## 2. Security Infrastructure Principles
To support strict cross-border real estate advertising laws and corporate data compliance rules, the application layer must completely lock down administrative routes and prevent programmatic abuse:

1. **Zero Trust Client Input:** The server must completely verify session properties on every incoming request. Never trust role descriptions, account status tags, or identifier properties passed inside the raw request text payload.
2. **Immutable System Auditing:** Every administrative update altering a row's approval status, public display visibility, or verification flag must write a permanent record to the system audit trail. These log items must be un-editable and un-deletable.
3. **Defensive Rate Limiting:** Publicly visible submittal paths must implement strict request caps to block scrapers, stop bot activity, and prevent distributed spam injections.

---

## 3. Mandatory Audit Trail Tracking Matrix
The Express security layer must automatically structure, format, and append log records directly to the Firestore `admin_actions` collection on any status transition. Every audit item must strictly collect the following object fields:

* `adminUserId` — The validated unique identifier string (`req.user.uid`) matching the reviewing administrator.
* `adminEmail` — The authenticated corporate email address of the reviewer.
* `actionType` — Explicit tracking action string (e.g., `approve_submission`, `reject_submission`, `request_documents`, `toggle_visibility`, `modify_taxonomy`).
* `targetObjectType` — Target category reference matching the modified post (`interest_signals`, `private_availability`, `verified_listing_requests`, `investor_posts`, `taxonomy_items`).
* `targetObjectId` — Unique system document identifier string matching the modified record line.
* `previousStatus` — The prior state string token before execution.
* `newStatus` — The newly applied state target token.
* `note` — Mandatory contextual text tracking reasons, internal compliance feedback, or rejection messages.
* `timestamp` — Captured strictly via `admin.firestore.FieldValue.serverTimestamp()`.
* `ipAddress` — Client network source connection address if exposed to the request context.

---

## 4. Required Security Middleware & Endpoints

The Express router must configure the following core validation middle layers and specialized tracking routes:

### 4.1 Global Rate Limiting Interceptor
* **Target:** Applied to all routes matching `/api/interest`, `/api/availability`, `/api/verified-listing`, and `/api/investor-post`.
* **Enforcement:** Restricts submissions to a maximum of 5 requests per 15-minute window per IP block to mitigate spam. Emits an `HTTP 429 Too Many Requests` response code if exceeded.

### 4.2 Secure Custom Claims Guard
* **Target:** Enforced on all paths underneath `/api/admin/*`.
* **Behavior:** Extracts the Authorization header token. Verifies signature states via `admin.auth().verifyIdToken()`. Inspects the token's payload properties to confirm the presence of absolute custom claims matching `admin: true`, `compliance: true`, or `superAdmin: true`. Returns `HTTP 403 Forbidden` if missing.

### 4.3 Fetch Consolidated System Audit Logs
* **Route:** `GET /api/admin/audit-log`
* **Access:** `super_admin` only.
* **Behavior:** Streams the complete historical tracking timeline from the `admin_actions` Firestore collection, structured chronologically by timestamp.

---

## 5. Security Validation & Request Control Rules
1. **Sanitize Public Data Streams:** Express query responses mapping to the public board paths must completely strip private database key values, identifying unit numbers, and raw storage folder locations from the JSON return array.
2. **Defensive Cors Protections:** The API server must completely configure an absolute CORS whitelist, allowing requests solely from your official verified domain configurations (`match.galaxyelite.ae` and later regional expansion pathways). General wildcard mappings (`*`) are completely banned.
3. **Data Mutation Payload Freezing:** Express endpoint controllers handling standard member form data saves must run strict whitelist stripping validation checks on incoming body content. Any user parameters attempting to self-assign a verified badge or pass-through status approvals must be cleanly stripped before database transaction execution.