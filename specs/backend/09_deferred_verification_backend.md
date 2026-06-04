# 09_deferred_verification_backend.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Native JWT Registration, Password Hashing, and Deferred Verification Engine
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Authentication Strategy:** Native JSON Web Tokens (`jsonwebtoken`) + Hashing (`bcrypt`)
* **Database Layer:** MySQL Relational Database Engine
* **Target Tables:** `users`, `document_uploads`, `admin_actions`, `notifications`

---

## 2. Updated Database & Schema Configurations
Since Firebase Auth is entirely removed, the MySQL database is now the absolute source of truth for raw credentials and security states.

### 2.1 Schema Requirements for `users` Table Updates
Ensure your user authentication tables possess these exact relational structures:
* `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
* `email`: `VARCHAR(255) UNIQUE NOT NULL`
* `password_hash`: `VARCHAR(255) NOT NULL` (Never store raw client text)
* `primary_role`: `ENUM('user', 'buyer', 'owner', 'agent', 'compliance', 'admin', 'super_admin') DEFAULT 'user'`
* `verification_status`: `ENUM('unverified', 'under_review', 'action_required', 'verified') DEFAULT 'unverified'`

### 2.2 System Operational Rules
1. **Registration Default State:** New signups default to `verification_status = 'unverified'`. No identity verification documents are accepted or requested during the registration workflow.
2. **Matching Engine Isolation Block:** All supply/demand property posts created by accounts tracking an `unverified` or `action_required` status are hardlocked to `public_status = 'hidden'`. The automated matching algorithms completely skip these entries until the status moves to `verified`.

---

## 3. Required API Architecture & Handlers

The Express router must expose the following native endpoints:

### 3.1 Native Registration Handler (`POST /api/auth/register`)
* **Payload:** `{ name: "...", email: "...", phone: "...", password: "..." }`
* **Behavior:** Validates inputs, checks for email duplicates in MySQL, hashes the password using `bcrypt` (salt rounds: 10), and inserts the record. Returns a successful creation message.

### 3.2 Native Login Handler (`POST /api/auth/login`)
* **Payload:** `{ email: "...", password: "..." }`
* **Behavior:** Retrieves the user row from MySQL. Verifies the password using `bcrypt.compare()`. Generates a signed JWT containing payload attributes: `{ id, email, role: primary_role, status: verification_status }`. Returns the token to the caller.

### 3.3 Initiate Verification Upload Request (`POST /api/users/verification/submit`)
* **Access:** Guarded by Native JWT Auth Middleware (`req.user.id`)
* **Payload:** `{ document_type: "owner_id", file_path: "private/users/id_doc.pdf" }`
* **Behavior:** Inserts metadata into `document_uploads`, updates `users.verification_status = 'under_review'`, and alerts the admin monitoring tracking framework.

### 3.4 Admin Review Action (`POST /api/admin/users/:id/verify-identity`)
* **Access:** Guarded by Native JWT Role Middleware (`req.user.role IN ('compliance', 'super_admin')`)
* **Payload:** `{ action: "approve" | "reject", rejection_reason?: "..." }`
* **Behavior:** Updates user state flags inside a single SQL transaction block. Inserts permanent ledger notes straight into the `admin_actions` audit table.

---

## 4. Operational Safety Controls
* **Token Verification Security:** The JWT middleware must verify the token signature using a strong backend environment variable (`JWT_SECRET`). If verified successfully, attach the properties cleanly to `req.user`.