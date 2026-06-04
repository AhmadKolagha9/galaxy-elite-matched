# 04_website_market_pulse_public_boards.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Public Interest Board Hydration, Market Pulse Sanity CMS Feed Integration, and Anonymity Layer enforcement
* **Frontend Architecture:** Next.js App Router (React + TypeScript)
* **Target Data Layer:** Node.js + Express API (MySQL Read View) and Sanity CMS API Client

---

## 2. Public Read Endpoints & Anonymity Safeguards
To adhere to cross-border listing regulations and maintain the platform's unique positioning, the public-facing pages must never overexpose user attributes.

1. **Read Criteria Constraints:** The public endpoints must strictly stream records that possess an `approval_status == 'approved'` and a `public_status` that is explicitly active (e.g., `'open'`).
2. **Absolute Data Masking:** Public interest cards must completely replace identification details with placeholder values. The frontend template must format names into anonymous tags (e.g., *"Verified Investor"*, *"Registered Tenant"*).
3. **Budget Masking Logic:** If a row's `budget_visibility` or `ticket_visibility` attribute equals `'Hide publicly'` or `'Verified privately'`, the card layout must hide the specific numerical range and render text stating: *"Hidden publicly, verified privately"*.

---

## 3. Module 1: The Public Interest Board Integration (`/interest-board`)
This layout handles pulling approved demand data from the MySQL-backed Express server and displaying it as readable search matrices.

* **Target API:** `GET /api/interest`
* **Query Filter Hooks:** The view should feed standard search variables directly to the URL string parameters (`?country=...&market_segment=...&property_type=...`).
* **Card UI Component Mapping:**
  * Render a clean header displaying the `title`, anonymous `user_role` tier, and a `verified_badge` asset if the matching `verification_status == 'verified'`.
  * Map and display structural requirements: `property_type`, `area_city`, `size_sqft`, `timeline`, and the allowed flat array parameters for `amenities`.
  * Render an interactive match button labeled **"Propose Matching Availability"**. If an authenticated owner clicks this button, it should open a workflow mapping their available units directly to the demand target ID.

---

## 4. Module 2: The Market Pulse Integration (`/market-pulse`)
This page displays non-sensitive real estate intelligence articles, local demand metrics, and educational guides pulled directly from Sanity CMS.

* **Sanity Setup Variables:**
  * `NEXT_PUBLIC_SANITY_PROJECT_ID`
  * `NEXT_PUBLIC_SANITY_DATASET="production"`
* **GROQ Content Query:**
```graphql
  *[_type == "marketPulse" && active == true] | order(publishedAt desc) {
    id,
    title,
    slug,
    category,
    summary,
    body,
    publishedAt,
    mainImage
  }