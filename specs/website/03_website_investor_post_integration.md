# 03_website_investor_post_integration.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Public Website Investor Demand Profiling and Capital Posting Form Integration[cite: 37, 40]
* **Frontend Architecture:** Next.js App Router (React + TypeScript)[cite: 37]
* **Target Backend:** Node.js + Express REST API backed by a MySQL Database Engine

---

## 2. Authentication Enforcement & Custom Verification States
Investor demand capturing targets high-net-worth individuals, family offices, and institutional allocators[cite: 35]. The front-end layout must enforce secure user verification before allowing data entry:

1. **Session Gate Interception:**
   * If a user clicks the "Submit Investor Profile" CTA while logged out, intercept the request and redirect them directly to `/login?next=/investor-post`.
2. **Identification Headers:**
   * Read the token string using the Firebase Client SDK context and pass it securely within the `Authorization: Bearer <Firebase_ID_Token>` request headers.

---

## 3. Form Input Mapping & MySQL Relational Array Handling
When an investor profile is submitted via the frontend UI, the state manager must bind, parse, and structure all parameters to match the expected relational backend tables:

* **Target Path:** `POST /api/investor-post`[cite: 37]
* **Payload Parameter Mappings & Option Values:**
  * `title`: String input. Required user headline outlining capital deployment targets.
  * `investor_type`: Select dropdown. Allowed values: `Individual investor`, `Private investor`, `Family office`, `Corporate investor`, `Developer/JV partner`, `Fund/institution`, or `Relocation/investment buyer`.
  * `investment_goal`: Multi-line text field detailing capital targets and holding period execution methods.
  * `countries`: Multi-select checkboxes tracking target jurisdictions. Sent as a structured array of taxonomy country strings (e.g., `["uae", "uk"]`).
  * `area_city`: String dropdown. Localized geographic hub targets. Dynamically updates option loops from the taxonomy API based on chosen country categories.
  * `property_categories`: Multi-select checklists mapping top-level targets. Sent as a string array containing explicit enums: `["Residential", "Commercial", "Off-plan", "Secondary", "Land", "Industrial", "Hospitality", "Investment"]`.
  * `property_types`: Multi-select checklists capturing required structures. Sent as an array containing authorized taxonomy strings (e.g., `["Apartment / flat", "Villa", "Office", "Land / development plot"]`).
  * `market_segments`: Multi-select checklists tracking target property parameters. Sent as an array containing authorized options: `["Off-plan", "Secondary", "Ready", "Under construction", "Income-producing", "Development opportunity", "Distressed/opportunistic", "Bulk units"]`.
  * `ticket_min` / `ticket_max`: Number inputs. Cast to primitive decimals representing budget thresholds.
  * `budget_visibility`: Select dropdown. Value must explicitly match: `Show exact range`, `Show broad range`, `Hide publicly`, `Verified privately`, or `Negotiable`.
  * `target_yield`: Number input. Cast to decimal floating-point strings tracking yield percentage expectations.
  * `risk_preference`: Select dropdown. Value must match: `low`, `medium`, `high`, or `opportunistic`.
  * `timeline`: Select dropdown. Tracking activation urgency.
  * `holding_period`: String selector. Expected duration of property retention.
  * `exit_strategy`: String text field outlining target liquidation approaches.
  * `financing_method`: Select dropdown. Value matches: `cash`, `mortgage`, `mixed`, or `not disclosed`.
  * `accepts_direct_owner` / `accepts_developer` / `accepts_agent`: Boolean switches/checkboxes tracking respondent permission flags. Sent as true boolean values (`true` or `false`).
  * `private_description`: Multi-line text area block. Confidential investor parameter profiling notes completely stripped from search crawlers or public API read calls.
  * `category`: Radio toggle matching segment lines: `residential` or `commercial`.
  * `offering_type`: Radio toggle tracking action: `rent` or `sell`.
  * `rooms` / `bedrooms` / `total_floors` / `parking_spaces`: Number inputs parsed safely into base primitive integers.
  * `furnishing_type`: Select dropdown. Options: `unfurnished`, `semi-furnished`, or `Furnished`.
  * `project_status`: Select dropdown. Options: `resale`, `ready to move`, `on plan`, or `under construction`.
  * `amenities`: Multiple-select checklist. Dispatched over the network as a string array containing authorized amenity tokens.

---

## 4. UI Safeguards & Response Handling
1. **Defensive Parameter Strip:** The frontend component layout must **never** include state manipulation fields like `approval_status`, `public_status`, or `verification_status` within the payload body. These attributes are applied safely on the backend server layer upon code validation.
2. **Network Response Parsing:** On submission complete, prevent double-submit events, clear form states, and display an official luxury confirmation alert modal:
```json
   { "ok": true, "message": "Investor demand profile securely submitted and pending Galaxy Elite review." }