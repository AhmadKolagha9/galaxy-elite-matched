# 07_submission_fields_validation.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Request Payload Validation, Type Casting, and Relational Schema Integrity for Availability (Supply) and Interested (Demand) Tables
* **Runtime Stack:** Node.js + Express REST API (TypeScript)
* **Database Layer:** MySQL Relational Database Engine
* **Target Tables:** `private_availability`, `interest_signals`, `taxonomy_items`

---

## 2. General Data Rules & SQL Integrity
To prevent database corruption, SQL injection attacks, and lookup misalignment within the matching engine, the Express server must execute strict schema validation check layers (using Joi, Zod, or express-validator) before issuing SQL insertion or update statements:

1. **Server-Side Payload Overwrites:** Even if properties like `approval_status`, `public_status`, or `verification_status` are passed directly within the client body, the Express controller must explicitly overwrite them with system baseline defaults (`pending_review`, `hidden`, `unverified`).
2. **Foreign Key & Taxonomy Scoping:** The `country` and `area_city` parameters must correspond to valid entries inside your `taxonomy_items` data table. The `area_city` entry must be checked to confirm its relation to the chosen country scope.
3. **Data Type Casting:** Numeric values must be safely parsed into primitives (`INT`, `DECIMAL`) before being executed inside a query. 
4. **Relational Array Handling (Amenities):** Since MySQL does not feature native unstructured arrays, string options picked from multiple-select forms (such as `amenities`) must be normalized. They must either be stored as a comma-separated text string, structured as a `JSON` column data type, or mapped into a secondary relational junction table.

---

## 3. Supply Stream Schema: Private Availability (`private_availability`)
Applied to entries submitted by users who possess land, homes, or property portfolios.

### 3.1 Field Mappings & MySQL Types
* `title`: `VARCHAR(255)`. Required. User-defined headline.
* `user_role`: `ENUM`. Required. Allowed values:
  * `'Direct owner'`, `'Direct landlord'`, `'Developer'`, `'Licensed agent with authority'`, `'Property manager with authority'`, `'Representative with written mandate'`
* `availability_type`: `ENUM`. Required. Allowed values:
  * `'May rent privately'`, `'Upcoming vacancy'`, `'May sell privately'`, `'Developer inventory'`, `'Land opportunity'`, `'Commercial opportunity'`, `'Verified listing request'`, `'Private matching only'`
* `listing_intent`: `ENUM`. Required. Allowed values:
  * `'Keep private - match only'`, `'Request verified private listing'`, `'Request public listing after compliance approval'`, `'Deal room reveal only'`
* `market_segment`: `ENUM`. Required. Allowed values:
  * `'Residential'`, `'Commercial'`, `'Off-plan'`, `'Secondary'`, `'Land'`, `'Industrial'`, `'Hospitality'`, `'Investment'`, `'Special purpose'`, `'Other'`
* `property_type`: `ENUM`. Required. Allowed values:
  * `'Apartment / flat'`, `'Studio apartment'`, `'Serviced apartment'`, `'Villa'`, `'Townhouse'`, `'Duplex'`, `'Penthouse'`, `'Mansion / luxury home'`, `'Residential building'`, `'Whole building / bulk units'`, `'Land / development plot'`, `'Residential land'`, `'Commercial land'`, `'Agricultural land'`, `'Industrial land'`, `'Mixed-use land'`, `'Office'`, `'Retail shop'`, `'Showroom'`, `'Warehouse'`, `'Industrial unit'`, `'Labour camp / staff accommodation'`, `'Camp'`, `'Commercial building'`, `'Hotel / hospitality'`, `'Restaurant / F&B space'`, `'Clinic / medical space'`, `'Farmhouse / rural property'`, `'Short-term rental opportunity'`, `'Off-plan unit'`, `'New development unit'`, `'Branded residence'`, `'Investment property'`, `'Other / bespoke requirement'`
* `country`: `VARCHAR(100)`. Required. Cross-referenced against `taxonomy_items`.
* `area_city`: `VARCHAR(100)`. Required. Relational lookup validated against selected country.
* `project_name`: `VARCHAR(255)`. Optional (Nullable). Free-text master project field.
* `building_name`: `VARCHAR(255)`. Optional (Nullable). Free-text building or tower field.
* `size_sqft`: `DECIMAL(12,2)`. Required. Internal space dimension.
* `price_min`: `DECIMAL(15,2)`. Required. Lower boundary of financial target.
* `price_max`: `DECIMAL(15,2)`. Required. Upper boundary of financial target.
* `availability_date`: `DATE`. Required. Calendar eligibility marker.
* `privacy_level`: `ENUM`. Required. Allowed values:
  * `'Admin only'`, `'Matched users only'`, `'Deal room only'`, `'Public advertising only with permit'`
* `authority_declaration`: `ENUM`. Required. Allowed values:
  * `'I am the direct owner/landlord'`, `'I have written authority'`, `'I represent a developer'`, `'I am a licensed agent and will upload proof later'`
* `private_description`: `TEXT`. Required. Confidential description text completely excluded from public endpoints.
* `category`: `ENUM('residential', 'commercial')`. Required. Top-level segment divider.
* `offering_type`: `ENUM('rent', 'sell')`. Required. Core deal type pointer.
* `rooms`: `INT`. Required. Total count of internal rooms.
* `bedrooms`: `INT`. Required. Total count of dedicated bedrooms.
* `total_floors`: `INT`. Required. Vertical building floors count.
* `parking_spaces`: `INT`. Required. Available vehicle parking stalls count.
* `furnishing_type`: `ENUM('unfurnished', 'semi-furnished', 'Furnished')`. Required.
* `project_status`: `ENUM('resale', 'ready to move', 'on plan', 'under construction')`. Required.
* `amenities`: `JSON` or `TEXT`. Required. Multi-select container validation check layer. Entries must strictly resolve to text parameters from the allowed pool:
  * `Balcony`, `Built-in wardrobes`, `central A/C`, `covered Parking`, `private Gym`, `Private jacuzzi`, `kitchen appliances`, `Maids room`, `pets allowed`, `private garden`, `private pool`, `study`, `view of water`, `security`, `concierge`, `shared spa`, `shared Gym`, `Maid service`, `walk-in closet`, `view of landmark`, `children's play Area`, `lobby in building`, `childer;s pool`, `vastu-copliant`

---

## 4. Demand Stream Schema: Interested Profile (`interest_signals`)
Applied to entries submitted by matching users seeking property or land options.

### 4.1 Field Mappings & MySQL Types
* `title`: `VARCHAR(255)`. Required. User headline tracking demand preferences.
* `user_role`: `ENUM('Buyer', 'Investor', 'Developer', 'agent', 'Property manager', 'Corporate client', 'Admin')`. Required.
* `availability_type`: `ENUM` (Options mirror availability table precisely). Required.
* `listing_intent`: `ENUM` (Options mirror availability table precisely). Required.
* `market_segment`: `ENUM` (Options mirror availability table precisely). Required.
* `property_type`: `ENUM` (Options mirror availability table precisely). Required.
* `country`: `VARCHAR(100)`. Required.
* `area_city`: `VARCHAR(100)`. Required.
* `project_name`: `VARCHAR(255)`. Optional (Nullable).
* `building_name`: `VARCHAR(255)`. Optional (Nullable).
* `size_sqft`: `DECIMAL(12,2)`. Required. Minimum scale dimension targets.
* `price_min`: `DECIMAL(15,2)`. Required. Budget floor.
* `price_max`: `DECIMAL(15,2)`. Required. Budget ceiling.
* `availability_date`: `DATE`. Required. Desired activation timeframe window.
* `privacy_level`: `ENUM` (Options mirror availability table precisely). Required.
* `private_description`: `TEXT`. Required. Confidential profiling context details.
* `category`: `ENUM('residential', 'commercial')`. Required.
* `offering_type`: `ENUM('rent', 'sell')`. Required.
* `rooms`: `INT`. Required. Minimum acceptable room allocations.
* `bedrooms`: `INT`. Required. Minimum acceptable bedroom allocations.
* `total_floors`: `INT`. Required. Maximum or preferred structural levels.
* `parking_spaces`: `INT`. Required. Minimum acceptable vehicle stalls.
* `furnishing_type`: `ENUM('unfurnished', 'semi-furnished', 'Furnished')`. Required.
* `project_status`: `ENUM('resale', 'ready to move', 'on plan', 'under construction')`. Required.
* `amenities`: `JSON` or `TEXT`. Required. Structured data validating multiple-select selections.

---

## 5. Security & Query Mutation Controls
1. **Defensive Mutation Control:** The Express controllers mapping database query parameters must strip values sent for status identifiers. The route code must enforce:
```json
   {
     "approval_status": "pending_review",
     "public_status": "hidden",
     "verification_status": "unverified",
     "user_id": "req.user.uid"
   }