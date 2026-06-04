# 04_taxonomy_dropdown_system.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Dynamic Database-Driven Taxonomy Management Engine
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Database Table:** `taxonomy_items`

---

## 2. Taxonomy Architecture & Core Principles
To ensure data clean and matchable across global jurisdictions (UAE, UK, India), the backend must migrate away from static file dropdowns (`lib/taxonomy.ts`) to a relational hierarchy inside the database:

1. **Hierarchical Relationships:** The taxonomy engine must support parent-child mapping using a nullable `parent_id` foreign key (e.g., Country `UAE` $\rightarrow$ City `Dubai` $\rightarrow$ Sub-Area `Palm Jumeirah`).
2. **Geographical Scoping:** Dropdowns must filter dynamically using a `country_scope` property so users matching fields in the UK do not see UAE community options.
3. **Data Integrity:** Base submission endpoints (`POST /api/submissions`) must validate user choices against active database slugs, preventing malicious free-text injection into categorical fields.

---

## 3. Strict Taxonomy Categories & Allowed Enums
The database seed scripts and Express routers must categorize data entries using the exact string properties for `taxonomy_type`:

* `country` — Initial limits: `global`, `uae`, `uk`, `india`.
* `area_city` — Geographic hubs (e.g., `dubai`, `abu_dhabi`, `england`, `scotland`).
* `property_category` — Master fields: `residential`, `commercial`, `off_plan`, `secondary`, `land`, `industrial`, `hospitality`, `mixed_use`, `investment`.
* `property_type` — Structural fields (e.g., `apartment`, `villa`, `office`, `warehouse`, `development_plot`, `labour_camp`).
* `market_segment` — Financial states (e.g., `ready`, `under_construction`, `income_producing`, `distressed`).
* `purpose` — Deal targets: `buy`, `rent`, `sell_privately`, `lease`, `invest`, `joint_venture`.

---

## 4. Required API Endpoints

The Express router must expose the following specific routes protected by matching role access boundaries:

### 4.1 Fetch Public Scoped Dropdowns
* **Route:** `GET /api/taxonomy`
* **Access:** Unauthenticated Public Visitors / Registered Users
* **Parameters:** Query filters `?type=...&country_scope=...`
* **Behavior:** Returns un-nested active arrays sorted by `sort_order`. Only returns records where `is_active = true`.

### 4.2 Fetch Administrative Tree Queue
* **Route:** `GET /api/admin/taxonomy`
* **Access:** `admin`, `super_admin` only
* **Behavior:** Returns the full nested recursive taxonomy tree layout (including inactive elements) for dashboard visibility management.

### 4.3 Create or Update Taxonomy Entry
* **Route:** `POST /api/admin/taxonomy` and `PUT /api/admin/taxonomy/:id`
* **Access:** `super_admin` only
* **Payload:** `{ taxonomy_type: string, label: string, slug: string, parent_id?: string, country_scope?: string, is_active: boolean, sort_order: number }`
* **Behavior:** Mutates database items. Generates an immediate action entry log row inside the `admin_actions` table.

### 4.4 Bulk CSV Taxonomy Import/Export
* **Route:** `POST /api/admin/taxonomy/import`
* **Access:** `super_admin` only
* **Behavior:** Validates, processes, and bulk-inserts standard CSV structural lines directly into `taxonomy_items` using transaction safe rollbacks if parsing fails.

---

## 5. Security & Validation Controls
1. **Sanitization Matrix:** The Express controller must force slug outputs to clean alphanumeric constraints (lowercased, hyphens replacing spaces) during database writes.
2. **Recursive Parent Constraint:** The update route must block assigning an element's `parent_id` to itself or any child under its immediate tracking branch to avoid continuous loops.
3. **Cache Invalidation:** Because dropdown values are rarely altered but constantly requested, the GET handler must configure safe cache header tags (`Cache-Control: public, max-age=3600`), invalidating keys directly upon administrative database modifications.