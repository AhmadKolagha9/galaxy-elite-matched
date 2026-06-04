# 02_website_availability_submission_integration.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Public Website Auth Enforcement, Dynamic Cascading Dropdowns, and Property Availability Form Integration
* **Frontend Architecture:** Next.js App Router (React + TypeScript)
* **Target Backend:** Node.js + Express REST API backed by a MySQL Database Engine

---

## 2. Authentication Gate & Session Handling
The property/land availability form must cleanly capture and enforce explicit authentication parameters prior to payload compilation:

1. **Unauthenticated Intent Interception:**
   * If an unauthenticated public visitor attempts to view or fill out the availability layout, redirect them instantly to `/login?next=/private-availability`.
2. **Identity Propagation:**
   * Extract the active user's authorization token using the Firebase JS Client SDK.
   * Inject this token inside the `Authorization: Bearer <Firebase_ID_Token>` header string for all outbound requests.

---

## 3. Relational Dropdown Filtering (Cascading Taxonomy)
To guarantee strict compliance with backend foreign key lookups, dropdown options must update dynamically based on the user's sequential selections:

* **Country Selection (`country`):** Fetch available countries from `GET /api/taxonomy?type=country`.
* **Area/City Cascade (`area_city`):** Once a country is selected (e.g., `UAE`), trigger an immediate client-side fetch to `GET /api/taxonomy?type=area_city&country_scope=uae` to cleanly populate regional sub-menus (e.g., Abu Dhabi, Dubai, Sharjah) without hardcoding values.

---

## 4. Public Form Data Submission Protocol (Available / Supply)
When a supply-side user (Owner, Landlord, Developer, or Agent) submits an available property or plot option, the form state manager must cast, map, and serialize all 27 attributes exactly to match the backend MySQL expectations:

* **Target Path:** `POST /api/availability`
* **Payload Mappings & Value Constraints:**
  * `title`: String input. Required headline description.
  * `user_role`: Select dropdown. Value must match: `Direct owner`, `Direct landlord`, `Developer`, `Licensed agent with authority`, `Property manager with authority`, or `Representative with written mandate`.
  * `availability_type`: Select dropdown. Value must match: `May rent privately`, `Upcoming vacancy`, `May sell privately`, `Developer inventory`, `Land opportunity`, `Commercial opportunity`, `Verified listing request`, or `Private matching only`.
  * `listing_intent`: Select dropdown. Value must match: `Keep private - match only`, `Request verified private listing`, `Request public listing after compliance approval`, or `Deal room reveal only`.
  * `market_segment`: Select dropdown. Value must match: `Residential`, `Commercial`, `Off-plan`, `Secondary`, `Land`, `Industrial`, `Hospitality`, `Investment`, `Special purpose`, or `Other`.
  * `property_type`: Select dropdown. Value must match one of the 34 strict operational variants (e.g., `Apartment / flat`, `Villa`, `Office`, `Warehouse`, `Labour camp / staff accommodation`, `Residential land`, `Mixed-use land`).
  * `country`: String. Selected taxonomy identifier code.
  * `area_city`: String. Filtered localized regional hub identifier code.
  * `project_name`: String input. Optional community or master development filter (Nullable).
  * `building_name`: String input. Optional tower or specific building block filter (Nullable).
  * `size_sqft`: Number input. Strict decimal representation of internal workspace/living dimensions.
  * `price_min` / `price_max`: Number inputs. Strict decimal ranges mapping financial expectations.
  * `availability_date`: Date picker string wrapper formatted exactly as `YYYY-MM-DD`.
  * `privacy_level`: Select dropdown. Value must match: `Admin only`, `Matched users only`, `Deal room only`, or `Public advertising only with permit`.
  * `authority_declaration`: Select dropdown. Value must match: `I am the direct owner/landlord`, `I have written authority`, `I represent a developer`, or `I am a licensed agent and will upload proof later`.
  * `private_description`: Multi-line Text Area. Strict confidential profile text completely isolated from public board query indexes.
  * `category`: Button toggle / Radio. Options: `residential` or `commercial`.
  * `offering_type`: Button toggle / Radio. Options: `rent` or `sell`.
  * `rooms` / `bedrooms` / `total_floors` / `parking_spaces`: Number inputs. Parsed into true integer values before submission.
  * `furnishing_type`: Select dropdown. Options: `unfurnished`, `semi-furnished`, or `Furnished`.
  * `project_status`: Select dropdown. Options: `resale`, `ready to move`, `on plan`, or `under construction`.
  * `amenities`: Multiple-select structural checklist. Transmitted over the wire as a flat string array (e.g., `["Central A/C", "Covered Parking", "Security"]`). Values must belong strictly to the 24 authorized amenity string tokens.

---

## 5. User Interface Safeguards & Submittal Control
1. **Dynamic Section Gating:** If the user selects a role other than a direct principal (e.g., `Licensed agent with authority`), dynamically display a notification text block indicating: *"Verification required: Professional brokerage credentials must be uploaded within your profile dashboard to validate active matching capability."*
2. **Defensive Status Omission:** The frontend code must **never** append operational state properties (`approval_status`, `public_status`) to the outbound payload body. These parameters are handled exclusively by server-side controllers.
3. **API Response Parsing:** Upon successful submittal, block form re-submission, clear local storage temporary drafts, and display an official luxury confirmation panel:
   ```json
   { "ok": true, "message": "Availability profile securely logged. Pending Galaxy Elite administrative review." }