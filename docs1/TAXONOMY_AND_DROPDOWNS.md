# TAXONOMY_AND_DROPDOWNS.md

## Purpose

The platform must use clean dropdowns so posts are structured, searchable, matchable, and easy for admin to moderate.

The starter currently includes taxonomy support in:

```text
lib/taxonomy.ts
```

Production should make taxonomy admin-editable through:

```text
/admin/taxonomy
```

## Country dropdown

Initial priority countries:

- Global
- UAE
- UK
- India

Future countries:

- Saudi Arabia
- Qatar
- Oman
- Bahrain
- USA
- Canada
- Australia
- Singapore
- Portugal
- Spain
- France
- Italy
- Greece
- Turkey
- South Africa
- Kenya
- Other

## UAE area/city dropdown

- Abu Dhabi
- Al Ain
- Dubai
- Sharjah
- Ajman
- Fujairah
- Ras Al Khaimah
- Umm Al Quwain
- Other UAE

Optional future subareas:

- Dubai Marina
- Downtown Dubai
- Business Bay
- Palm Jumeirah
- JBR
- JVC
- Dubai Hills
- Arabian Ranches
- Meydan
- Saadiyat Island
- Yas Island
- Al Reem Island
- Al Raha
- Khalifa City

## UK location dropdown

- England
- Scotland
- Wales
- Northern Ireland
- Other UK

Optional future filters:

- London
- Manchester
- Birmingham
- Liverpool
- Leeds
- Bristol
- Oxford
- Cambridge
- Edinburgh
- Glasgow

## India location dropdown

Launch version:

- India

Do not overcomplicate India at first. Add city/state filters later after local partner and compliance workflow is stable.

## Project name dropdown

This must initially allow free text because projects vary by market. Later, build project database.

Fields:

- Project name
- Building/tower name
- Community name
- Developer name
- Project status
- Country
- City/area
- Approved/active flag

## Top-level property categories

- Residential
- Commercial
- Off-plan
- Secondary
- Land
- Industrial
- Hospitality
- Mixed-use
- Investment

## Market segment dropdown

- Off-plan
- Secondary
- Ready
- Under construction
- New development
- Resale
- Rental
- Short-term rental
- Income-producing
- Development opportunity
- Distressed/opportunistic
- Bulk units

## Property type dropdown

### Residential

- Apartment
- Villa
- Townhouse
- Duplex
- Penthouse
- Mansion
- Branded residence
- Serviced apartment
- Studio
- Full floor
- Full building
- Student housing
- Co-living

### Commercial

- Office
- Retail shop
- Showroom
- Restaurant / F&B
- Clinic / medical space
- Commercial floor
- Commercial building
- Co-working space

### Industrial / operational

- Warehouse
- Industrial unit
- Logistics facility
- Factory
- Camp
- Labour camp
- Staff accommodation
- Storage facility

### Land

- Residential land
- Commercial land
- Industrial land
- Agricultural land
- Mixed-use land
- Development plot
- Waterfront land
- Hospitality land

### Hospitality / special asset

- Hotel
- Resort
- Holiday home portfolio
- Wellness retreat
- Farmhouse
- Private island / rare asset

### Investment

- Income property
- Bulk units
- Portfolio
- REIT-style asset
- JV opportunity
- Development opportunity

## Purpose dropdown

- Buy
- Rent
- Sell privately
- Lease
- Invest
- Buy land
- Lease commercial
- Joint venture
- Development opportunity
- Submit availability
- Request verified listing

## Submitter role dropdown

- Buyer
- Tenant
- Investor
- Land seeker
- Owner
- Landlord
- Developer
- Licensed agent
- Property manager
- Representative
- Company
- Family office

## Agent/representation dropdown

- Direct owner
- Direct landlord
- Direct buyer
- Direct tenant
- Licensed agent
- Buyer representative
- Tenant representative
- Seller representative
- Landlord representative
- Developer representative
- Property manager

## Budget visibility dropdown

- Show exact range
- Show broad range
- Hide publicly
- Verified privately
- Negotiable

## Public status dropdown

- Hidden
- Open
- Matching
- Matched
- Archived

## Approval status dropdown

- Draft
- Pending Review
- Documents Requested
- Under Verification
- Compliance Hold
- Approved
- Rejected
- Archived

## Verification status dropdown

- Unverified
- Basic Checked
- Documents Submitted
- Under Review
- Verified
- Failed
- Expired

## Document type dropdown

- Title deed / ownership proof
- Owner ID
- Passport
- Emirates ID
- Power of Attorney
- Authority letter
- Broker licence
- Company licence
- Real estate advertisement permit
- RERA / Madmoun / Trakheesi document
- Project approval
- Developer NOC
- Floor plan
- Photos
- Tenancy contract
- Vacancy notice
- Proof of funds
- Source of funds
- Other

## Production requirement

Taxonomy should eventually be stored in database tables with:

- ID
- Type
- Label
- Slug
- Country scope
- Parent ID
- Active/inactive
- Sort order
- Created by
- Updated by
