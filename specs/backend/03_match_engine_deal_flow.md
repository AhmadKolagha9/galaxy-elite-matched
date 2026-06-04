# 03_match_engine_deal_flow.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Automated Match Scoring Engine, Persistent Match Rooms, and 11-Stage Deal Flow State Machine
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Data Layer:** Supabase Client SDK for Node.js interacting with PostgreSQL database

---

## 2. Match Room Principles & Data Isolation
To enforce the platform's core promise—**Public Interest. Private Property. Verified Match.**—the match engine and room routing layers must strictly protect participant identities and property data:

1. **Strict Separation & Privacy:** No property coordinates, exact unit identifiers, full street addresses, or title deed metadata may be exposed to the matching party outside of administrative oversight.
2. **Conditional Contact Reveal:** Participant names, email addresses, and phone numbers must remain completely hidden until the transaction moves to Stage 6 (Mutual Approval) and both parties explicitly approve the unlock trigger.
3. **Role Enforcement:** Intermediaries and licensed agents are barred from hiding their true identity or pretending to be direct principals within a match environment.

---

## 3. The 11-Stage Deal Flow State Machine
The Express server must orchestrate, track, and restrict mutations inside the `match_rooms` data table across the following exact string enum tokens (`match_rooms.current_stage`):

1. `interest_received` — A demand profile (buyer/tenant/investor) is verified by admin.
2. `response_received` — A matching private supply or verified listing request is linked.
3. `identity_check` — Compliance reviews and confirms identities of both sides.
4. `authority_check` — Compliance validates broker licences, POAs, or ownership documents.
5. `match_proposed` — Galaxy Elite admins issue an official pairing proposal.
6. `mutual_approval` — Both parties explicitly sign off on the introduction; contact details reveal.
7. `match_room_opened` — Secure messaging, chat interface, or communication pipeline activates.
8. `viewing_meeting` — Site visits, virtual briefings, or board room alignment meetings are scheduled.
9. `offer_negotiation` — Financial terms, lease structures, or joint-venture (JV) splits are submitted.
10. `agreement_executed` — Binding legal documents and brokerage disclosures are signed and captured.
11. `completed` — Transaction successfully finalized; property availability is removed from active matching inventory.

---

## 4. Automated Match Scoring Logic
The Express layer must feature a scoring service that evaluates weights when proposing a match between demand profiles (`interest_signals`, `investor_posts`) and supply pools (`private_availability`, `verified_listing_requests`):

* **Location Fit (Weight: 30%):** Matches exact country and specific area/city/community keywords.
* **Financial Alignment (Weight: 25%):** Checks for price range overlap (`budget_min` / `budget_max` intersecting with `price_min` / `price_max`).
* **Property Type & Category Fit (Weight: 20%):** Verifies explicit taxonomy matching (e.g., Residential $\rightarrow$ Penthouse).
* **Interaction Preference (Weight: 15%):** Checks if the demand actor accepts submissions from the specific supply actor role (e.g., `accepts_agent`, `accepts_developer`).
* **Timeline Overlap (Weight: 10%):** Validates availability dates and urgency fields.

---

## 5. Required API Endpoints

The Express router must expose the following specific routes protected by strict authentication and RBAC layers:

### 5.1 Trigger Batch Match Scoring Scan
* **Route:** `POST /api/admin/matches/evaluate`
* **Access:** `admin`, `super_admin` only
* **Behavior:** Processes unmatched profiles, calculates match scoring arrays, and appends high-scoring pairings into the `match_requests` table with an initial state of `pending`.

### 5.2 Create Persistent Match Room
* **Route:** `POST /api/admin/match-rooms`
* **Access:** `admin`, `super_admin` only
* **Payload:** `{ match_request_id: string }`
* **Behavior:** Initializes a record in the `match_rooms` table, pinning `current_stage = "interest_received"` and adding participants to `match_room_participants`.

### 5.3 Fetch Authenticated Active Rooms
* **Route:** `GET /api/match-rooms`
* **Access:** Logged-in users (`buyer`, `owner`, `agent`, etc.)
* **Behavior:** Queries rows from `match_room_participants` matching `req.user.id`. **Enforces strict column removal:** skips `contact_unlocked` fields if the current state is below stage 6.

### 5.4 Advance Deal Flow Lifecycle Stage
* **Route:** `PATCH /api/admin/match-rooms/:id/stage`
* **Access:** `admin`, `compliance`, `super_admin` only
* **Payload:** `{ next_stage: string, note?: string }`
* **Behavior:** Validates that the state mutation follows chronological order. Updates the room profile status, writes an entry to `admin_actions`, and triggers transactional email/notification hooks if necessary.

### 5.5 Principal Introduction Unlock Approval
* **Route:** `POST /api/match-rooms/:id/unlock-contact`
* **Access:** Assigned participants inside the target match room only
* **Behavior:** Marks the participant's specific approval flag. Once *both* associated room actors approve, updates the master room status to `contact_unlocked = true` and updates `current_stage` to `match_room_opened`.

---

## 6. Execution & Safety Protocols
1. **Defensive Status Isolation:** Express handlers processing participant lookups must never query data tables or return values without joining `match_room_participants` and verifying that `req.user.id` matches an active link.
2. **Atomic Transition Audit:** Any transition of a state flag from one deal stage to another must create a row in the `admin_actions` audit ledger. This row must capture the admin ID, previous state, new state, and tracking metrics.