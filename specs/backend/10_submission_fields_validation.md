# 10_submission_fields_validation.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Payload Sanitization, Financial Method Mapping, and Property-Side Verification Triggers
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Database Layer:** MySQL Relational Database Engine
* **Target Tables:** `private_availability`, `interest_signals`, `document_uploads`

---

## 2. SQL Integrity & Functional Overrides
The database layer incorporates payment pathways and matching eligibility flags directly inside the relational engine constraints:

1. **Informational Settlement Options:** Because real financial movement code is excluded from the application, payment routing selections are treated purely as static descriptive strings (`ENUM` data models). They are utilized exclusively for lookups and sorting within the matching algorithm.
2. **Conditional Ownership Audits:** When a user posts to the supply-side stream, they can optionally bind reference links matching a property title deed. If data is present, the server updates status attributes to trigger rapid validation workflows within the administration queues.

---

## 3. Supply Stream Schema: Private Availability (`private_availability`)

### 3.1 Added / Modified Fields & MySQL Types
* `preferred_payment_method`: `ENUM('Cash', 'Crypto', 'Installments')`. Required parameter mapping the chosen financial intake route.
* `has_verification_files_attached`: `BOOLEAN DEFAULT FALSE`. Automatically evaluated and written as `TRUE` by the API endpoint controller if the request payload body passes optional title deed or ownership paper document locations.

---

## 4. Demand Stream Schema: Interested Profile (`interest_signals`)

### 4.1 Added / Modified Fields & MySQL Types
* `preferred_payment_method`: `ENUM('Cash', 'Crypto', 'Installments')`. Required. Dictates how the interested applicant intends to clear the balance of a potential transaction.
* *Note on Scope:* No document upload attachments or validation state alterations apply to the demand-side payload structure.

---

## 5. Security & Insertion Control Policy
1. **Payload Boundaries:** Any data payload introducing unmapped payment option strings or missing structural elements must fail server ingestion rules immediately with an `HTTP 400 Bad Request`.
2. **Immutable System Baselines:** Processing controllers must systematically strip out incoming status parameters from user submissions, hardcoding initial defaults directly into the SQL statement (`approval_status = 'pending_review'`, `public_status = 'hidden'`, `verification_status = 'unverified'`).