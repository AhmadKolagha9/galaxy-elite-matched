# VERIFIED_LISTING_SPEC.md

## Purpose

The verified listing workflow allows a user to request Galaxy Elite to review a property or availability and optionally display it as verified. This must be tightly controlled to avoid uncontrolled property advertising and to maintain compliance.

## Route foundations

Existing routes:

```text
/verified-listing
/dashboard/verified-listing
/api/verified-listing
```

Existing form component:

```text
components/VerifiedListingForm.tsx
```

Existing schema:

```text
sanity/schemas/verifiedListingRequest.ts
```

Existing migration support:

```text
supabase/migrations/002_control_dashboard_and_verified_listings.sql
```

## Default rule

Every verified listing request must begin as:

```text
approval_status = pending_review
public_status = hidden
verification_status = documents_required or documents_submitted
```

## Who can submit

- Direct owner
- Direct landlord
- Developer
- Licensed agent
- Property manager
- Owner representative
- Landlord representative
- Developer representative

## Required fields

### Submitter information

- User ID
- Submitter role
- Direct or representative
- Company name, if applicable
- Agent licence number, if applicable
- Authority status

### Property information

- Country
- Area/city
- Project name
- Building/tower/community
- Unit/reference, private only
- Property category
- Property type
- Market segment
- Purpose: sale, rent, lease, investment, development, JV
- Size
- Bedrooms/bathrooms where relevant
- Price/rent range
- Availability date
- Occupancy status
- Furnishing status where relevant
- Description

### Compliance information

- Ownership status
- Permit status
- Exclusive/non-exclusive authority
- Agent/developer authority
- Owner consent
- Public visibility request
- Privacy level

## Property categories

- Residential
- Commercial
- Off-plan
- Secondary
- Land
- Industrial
- Hospitality
- Mixed-use
- Investment

## Property type dropdown examples

- Apartment
- Villa
- Townhouse
- Duplex
- Penthouse
- Branded residence
- Serviced apartment
- Office
- Camp
- Labour camp
- Staff accommodation
- Retail
- Warehouse
- Showroom
- Industrial unit
- Commercial building
- Residential building
- Full floor
- Plot
- Development land
- Agricultural land
- Mixed-use land
- Hotel
- Clinic / medical space
- F&B / restaurant space
- Bulk units

## Required documents

Document requirements depend on country, submitter role, and property type, but the system should support:

### Ownership / authority

- Title deed / ownership proof
- Owner ID / passport / Emirates ID
- Power of Attorney
- Authority letter
- Owner consent form

### Agent / company

- Broker licence
- Company trade licence
- Agent card/licence
- Agency agreement

### Permit / project

- Real estate advertisement permit, where applicable
- RERA / Madmoun / Trakheesi details, where applicable
- Project registration / approval, where applicable
- Developer NOC, where applicable

### Property support

- Floor plan
- Photos
- Tenancy contract, if occupied and relevant
- Vacancy notice, if rental availability
- Service charge / community documents, if relevant

## Document status

Each document should have:

- Type
- File URL/private storage path
- Uploaded by
- Uploaded at
- Expiry date, if any
- Verification status
- Verified by
- Verified at
- Rejection reason, if rejected

## Verification steps

1. Submission received
2. Documents requested or submitted
3. Identity/role check
4. Ownership/authority check
5. Permit/project check where applicable
6. Compliance review
7. Admin decision
8. Public visibility decision
9. Verified badge decision
10. Audit log completed

## Public display rules

Only approved fields should be public.

Allowed public fields, if approved:

- Property category
- Property type
- Country
- Area/city
- Project name if allowed
- Price/rent range if allowed
- Size range
- Verification badge
- Public status
- Match request button

Never public:

- Title deed
- Owner ID
- Passport/Emirates ID
- Direct phone/email
- Private address/unit number
- Sensitive documents
- Internal compliance notes

## Admin decision options

- Approve as hidden/private match only
- Approve as public verified listing
- Request more documents
- Compliance hold
- Reject
- Archive

## Verified badge criteria

A request may be marked verified only if:

- Required documents are uploaded
- Owner/authority is checked
- Submitter role is verified
- Permit/project fields are addressed where applicable
- Compliance reviewer signs off
- Admin publishes the verified status

## Production requirement

The starter currently captures document metadata. Production must implement secure private upload/storage before accepting real documents.
