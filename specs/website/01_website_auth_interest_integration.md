# 01_website_auth_interest_integration.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Public Website Auth State, Dynamic Dropdowns, and Public Interest Form Integration
* **Frontend Architecture:** Next.js App Router (React + TypeScript)
* **Target Backend:** Node.js + Express REST API backed by a MySQL Database Engine

---

## 2. Global Authentication State Integration
The public navigation headers and call-to-action (CTA) buttons must react dynamically based on the user's active session state:

1. **Unauthenticated Public Visitor View:**
   * Display "Login" and "Register" navigation buttons cleanly.
   * Clicking a protected template CTA (e.g., "Post Interest" or "Submit Private Availability") must redirect the visitor to `/login?next=/post-interest`.
2. **Authenticated Member View:**
   * Replace login buttons with a premium "Go to Dashboard" action item.
   * Persist the active token context in browser cookies or local state using the Firebase JS SDK configurations (`apiKey: "AIza...`, `authDomain: "galaxy..."`).

---

## 3. Dynamic Dropdown Population (Taxonomy API)
To keep lookup lists clean, hardcoded layout components inside your landing pages must be updated to fetch parameters dynamically from your Express taxonomy route:

* **Target API:** `GET /api/taxonomy?type=<category_type>&country_scope=<scope>`
* **Execution Mapping:**
  * Populate country dropdowns on form components using `type=country`.
  * Filter geographic regions (`type=area_city`) based on the chosen country scope to dynamically display related data tiers (e.g., matching Dubai to the UAE scope).

---

## 4. Public Form Data Submission Protocol (Interested / Demand)
When a registered user submits an explicit entry from public demand views, the frontend form handler must validate and parse fields cleanly before dispatching the database write payload:

* **Target Path:** `POST /api/interest`
* **Headers Required:** `Authorization: Bearer <Firebase_ID_Token>`
* **Payload Mappings & Types Constraints:**
  * `title`: String. Required headline tracking demand.
  * `user_role`: Select dropdown. Value must explicitly match: `Buyer`, `Investor`, `Developer`, `agent`, `Property manager`, `Corporate client`, or `Admin`.
  * `availability_type`: Select dropdown. Value must explicitly match: `May rent privately`, `Upcoming vacancy`, `May sell privately`, `Developer inventory`, `Land opportunity`, `Commercial opportunity`, `Verified listing request`, or `Private matching only`.
  * `listing_intent`: Select dropdown. Value must explicitly match: `Keep private - match only`, `Request verified private listing`, `Request public listing after compliance approval`, or `Deal room reveal only`.
  * `market_segment`: Select dropdown. Value must explicitly match: `Residential`, `Commercial`, `Off-plan`, `Secondary`, `Land`, `Industrial`, `Hospitality`, `Investment`, `Special purpose`, or `Other`.
  * `property_type`: Select dropdown. Value matches specific operational criteria tokens (e.g., `Apartment / flat`, `Villa`, `Office`, `Warehouse`, `Land / development plot`, `Investment property`).
  * `country`: String. Required taxonomy code.
  * `area_city`: String. Required associated geographic hub string.
  * `project_name`: String. Optional community filter.
  * `building_name`: String. Optional building tracking filter.
  * `size_sqft`: Number. Required structural scale space target.
  * `price_min` / `price_max`: Number. Required budget boundaries.
  * `availability_date`: Date String (`YYYY-MM-DD`). Required timeline marker.
  * `privacy_level`: Select dropdown. Value must explicitly match: `Admin only`, `Matched users only`, `Deal room only`, or `Public advertising only with permit`.
  * `private_description`: String Text area. Confidential text profiling data.
  * `category`: Select radio/button. Restricted to: `residential` or `commercial`.
  * `offering_type`: Select radio/button. Restricted to: `rent` or `sell`.
  * `rooms` / `bedrooms` / `total_floors` / `parking_spaces`: Number primitives. Total counts required.
  * `furnishing_type`: Select dropdown. Restricted to: `unfurnished`, `semi-furnished`, or `Furnished`.
  * `project_status`: Select dropdown. Restricted to: `resale`, `ready to move`, `on plan`, or `under construction`.
  * `amenities`: Multiple-select checklist. Dispatched to the network as an array of strings (e.g., `["Balcony", "central A/C", "security"]`). Valid entries include standard operational tracking tokens from the allowed core pool.

---

## 5. Security & UI Integration Rules
1. **Defensive Parameter Omission:** The frontend application layout must **never** include, manipulate, or send state variables like `approval_status`, `public_status`, or `verification_status` within user-facing submission forms. The backend controller explicitly overwrites these values upon receipt.
2. **Standard API Response Handling:** On successful database insertion, parse the network payload return shape and display an elegant success notification panel:
```json
   { "ok": true, "message": "Submission received and pending Galaxy Elite review." }