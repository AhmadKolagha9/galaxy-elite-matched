# COMPLIANCE_AND_VERIFICATION.md

## Important note

This document is a product and developer compliance guide, not legal advice. Galaxy Elite should obtain country-specific legal advice before full public launch.

## Core compliance principle

Galaxy Elite Private Match must keep a clear separation between:

1. **Public interest** — what a buyer/tenant/investor is looking for.
2. **Private property supply** — owner/landlord/developer/agent information, documents, addresses, and property details.
3. **Verified listing** — only allowed after Galaxy Elite review and required compliance/document checks.

## Why this matters

The platform should not accidentally become an uncontrolled public property advertising portal.

Dubai Land Department states that customers can scan QR codes on real estate advertisements to verify authorised details, and real estate companies can activate QR codes through Trakheesi/Madmoun. This means Dubai-specific public property advertising needs proper permit handling where applicable.

UK HMRC guidance says a business carrying out estate agency activity may need AML supervision registration if it acts for customers wanting to buy, sell or let land, introduces customers to third parties, or helps secure a transaction after introduction.

The UAE data protection framework gives individuals rights over personal data and requires careful handling of private information. The platform will process sensitive data such as identity documents, ownership records, budgets, and contact details, so privacy must be designed into the system.

## Official references for legal/compliance review

- Dubai Land Department Madmoun / real estate ad verification: https://dubailand.gov.ae/en/news-media/dubai-land-department-provides-madmoun-service-to-verify-validity-of-real-estate-ads-via-qr-codes
- Dubai Land Department Real Estate Ad Permit service: https://dubailand.gov.ae/en/eservices/real-estate-ad-permit/
- GOV.UK HMRC estate agency business AML registration guide: https://www.gov.uk/guidance/registration-guide-for-estate-agency-businesses
- UAE Federal Personal Data Protection Law reference: https://uaelegislation.gov.ae/en/legislations/1972/download

## Platform rules

### Rule 1 — No public/private data leakage

Never display:

- Title deed
- Owner ID
- Passport/Emirates ID
- Phone number
- Email
- Unit number
- Full private address
- POA/authority documents
- Broker licence document
- Proof of funds
- Internal notes

### Rule 2 — No hidden agents

Agents must disclose:

- Name
- Company
- Licence number
- Country of licence
- Who they represent
- Whether they have authority
- Whether commission is involved, where required

### Rule 3 — Verified means reviewed

A verified badge can only appear after:

- Identity/role check
- Ownership/authority check
- Document review
- Admin/compliance approval
- Audit log entry

### Rule 4 — Contact unlock by approval only

Contact details should unlock only after:

- Match is proposed
- Both sides approve
- Admin permits reveal if required
- Match room is opened

### Rule 5 — Admin audit trail

All admin decisions must be logged.

## Verification checklists

### Buyer / tenant / investor

- Email/phone check
- Role declaration
- Budget range
- Budget visibility
- Proof of funds, optional/required for premium or high-value matches
- AML/KYC where required

### Owner / landlord

- Identity check
- Ownership proof
- Title deed/ownership document
- Authority/consent
- Price/rent range
- Privacy preference

### Agent

- Identity check
- Broker licence
- Company licence
- Representation role
- Authority document if submitting property
- Agent disclosure agreement

### Developer

- Company registration
- Project approval/registration where relevant
- Authority of representative
- Permit/advertising status if public promotion is requested

### Verified listing

- Owner/authority checked
- Required documents present
- Permit status reviewed where applicable
- Privacy settings reviewed
- Public display fields approved

## Data retention

Production system should define:

- How long documents are retained
- When expired documents are removed/reverified
- How users request deletion
- How admin audit logs are retained
- How backups are handled

## Launch requirement

Before public launch, prepare/finalise:

- Terms of Use
- Privacy Policy
- Cookie Policy
- Brokerage Disclosure
- Agent Disclosure Policy
- No Public Property Advertising Policy
- Verification Policy
- Document Handling Policy
- Data Retention Policy
- AML/KYC Policy, where required
