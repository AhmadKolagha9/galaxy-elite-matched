# 08_admin_notifications_engine.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Asynchronous Status Change Notification Trigger Engine
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Backend Admin SDK:** Firebase Admin SDK (`firebase-admin` for verifying incoming corporate calls)
* **Database Layer:** MySQL Relational Database Engine
* **Target Tables:** `notifications`, `users`, `private_availability`, `interest_signals`, `match_rooms`

---

## 2. Notification Engine Principles
To safeguard system integrity and ensure high-speed transactional messaging across the platform, the backend engine must follow these core constraints:

1. **Decoupled Asynchronous Dispatches:** Triggering notifications must not block main database mutations. Once an admin updates an asset state, the server must hand off the alert configuration payload to an internal event processor or worker instance asynchronously.
2. **Strict Anonymity Layer:** Notification records stored in MySQL and transmitted to users must never contain un-masked cross-party properties, specific unit coordinates, or absolute street addresses.
3. **Delivery Lifecycle Persistence:** Every communication request must be immediately written to the `notifications` table in a `'pending'` state, moving to `'sent'` or `'failed'` dynamically based on third-party API outcomes.

---

## 3. Database Schema: Notifications (`notifications`)
The engine relies on a unified MySQL structure to trace delivery loops:

* `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
* `user_id`: `VARCHAR(255) NOT NULL` — The targeted recipient's Firebase unique identifier (`uid`).
* `notification_type`: `ENUM('submission_approved', 'documents_requested', 'compliance_hold', 'match_proposed', 'match_completed') NOT NULL`
* `channel`: `ENUM('email', 'in_app', 'both') NOT NULL`
* `subject`: `VARCHAR(255) NOT NULL`
* `body_content`: `TEXT NOT NULL`
* `delivery_status`: `ENUM('pending', 'sent', 'failed') DEFAULT 'pending'`
* `error_log`: `TEXT NULL` — Captures raw third-party network traces if a dispatch fails.
* `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
* `sent_at`: `TIMESTAMP NULL`

---

## 4. Required API Endpoint & Controller Architecture

The notification router must expose the following internal execution pipeline, guarded heavily by administrative middleware rules:

### 4.1 Internal Notification Dispatcher
* **Route:** `POST /api/notifications/dispatch`
* **Access Control:** Restricted via custom claims validation middleware (`admin: true`, `compliance: true`, or `superAdmin: true`).
* **Payload Structure:**
  ```json
  {
    "recipient_id": "user_firebase_uid_string",
    "event_type": "submission_approved",
    "source_entity_id": "associated_mysql_record_id"
  }