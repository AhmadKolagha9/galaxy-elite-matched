# 05_notification_broker_webhook.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Centralized Multi-Channel Notification Broker and Webhook Router
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Communication Providers:** Resend / SendGrid / Postmark (Email Engine Tier)
* **Database Table:** `notifications`

---

## 2. Notification Broker Architectural Principles
To uphold the privacy safeguards of the **Galaxy Elite Private Match** ecosystem, the communication routing layer must decouple user coordination from direct identifier leaks:

1. **Strict Contact Isolation:** Notification templates must never include raw personal data properties, direct phone strings, or email references belonging to the opposing matching party.
2. **Transactional Logging:** Every alert processed by the Express engine must write a record to the `notifications` table to maintain a clean tracking trail.
3. **Fail-Safe Fallbacks:** If an external messaging client falls offline, the broker must log an `error` state flag into the database table row without interrupting active user database workflows.

---

## 3. Mandatory Notification Event Channels
The notification service layer must handle, parse, and execute templates tied to the following specific string enum properties (`notifications.notification_type`):

* `submission_received` — Dispatched to the user when an Interest, Availability, or Investor profile hits the queue (`status = pending_review`).
* `admin_alert_new_post` — Triggered immediately to the admin team tracking emails when high-value requests are created.
* `submission_approved` — Dispatched to the user when an admin marks their post as active or opens it to the matching engine.
* `documents_requested` — Dispatched when compliance flags a submittal for missing deeds, licences, or corporate validations.
* `match_proposed` — Dispatched simultaneously to both parties when the automated matching matrix produces a valid pairing.
* `match_room_opened` — Dispatched once mutual validation parameters are checked and a secure transaction space launches.

---

## 4. Required API Endpoints & Webhooks

The Express router must expose the following specific route layout, secured behind strict access controls:

### 4.1 Fetch Authenticated User Notifications History
* **Route:** `GET /api/notifications`
* **Access:** Logged-in users (`buyer`, `owner`, `agent`, etc.)
* **Behavior:** Queries the database table history filtered strictly by `req.user.id`, returning clean read tracking fields.

### 4.2 Dispatch Administrative Notification (Internal Trigger)
* **Route:** `POST /api/notifications/dispatch`
* **Access:** `admin`, `super_admin` only
* **Payload:** `{ user_id: string, notification_type: string, subject: string, body: string, channel: "email" | "in_app" }`
* **Behavior:** Processes and updates the transactional email delivery engine, appends a tracker line to the data layer, and sets `sent_at = NOW()` upon network execution success.

### 4.3 Supabase Database Webhook Ingestion Router
* **Route:** `POST /api/webhooks/supabase-db-trigger`
* **Access:** Restricted strictly via a secure bearer token or signed secret verification string checked inside the request headers.
* **Behavior:** Listens for database event changes emitted directly by Supabase table mutations (e.g., an insert on `match_rooms` or an update on `document_uploads`). Extracts the payload, determines the required transactional template mapping, and hands it off to the notification service async.

---

## 5. Security & Deliverability Validation Controls
1. **No Content Leakage via Webhooks:** Webhook processing logic must never expose sensitive file paths or backend audit notes to external execution blocks.
2. **Server-Side Sanitation:** Email bodies generated through HTML components must be structured safely using template engines to prevent raw code execution vulnerabilities.
3. **Transactional Delivery Fallback:** The broker service must catch API failures cleanly. If an email delivery fails, it must update the database entry to `status = "failed"` and write the error trace to the console without interrupting the response flow.