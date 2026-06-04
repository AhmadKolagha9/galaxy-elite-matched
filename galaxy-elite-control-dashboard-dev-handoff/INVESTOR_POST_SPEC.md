# INVESTOR_POST_SPEC.md

## Purpose

Investor posts allow serious investors, family offices, companies, and funds to publish or privately submit investment demand. This strengthens the demand-first model and helps Galaxy Elite match capital with suitable private availability or verified listings.

## Route foundations

Existing routes:

```text
/investor-post
/dashboard/investor-post
/api/investor-post
```

Existing component:

```text
components/InvestorPostForm.tsx
```

Existing schema:

```text
sanity/schemas/investorPost.ts
```

## Default rule

Every investor post must start as:

```text
approval_status = pending_review
public_status = hidden
```

Admin decides whether it becomes public, member-only, private-match-only, or rejected.

## Investor types

- Individual investor
- Private investor
- Family office
- Corporate investor
- Developer/JV partner
- Fund/institution
- Relocation/investment buyer

## Investment categories

- Residential
- Commercial
- Off-plan
- Secondary
- Land
- Hospitality
- Industrial
- Mixed-use
- Income-producing asset
- Development opportunity
- Bulk units

## Required fields

### Investor profile

- Investor type
- Name/company
- Country of residence/incorporation
- Contact details
- Verification level
- Proof-of-funds status, optional/private
- Preferred communication route

### Investment request

- Purpose: buy, invest, JV, lease, acquire land, bulk purchase
- Countries
- Area/city preferences
- Project/community preference
- Property category
- Property type
- Market segment: off-plan, secondary, ready, income-producing, distressed, development
- Ticket size / budget range
- Budget visibility: public, hidden, verified privately
- Target yield, if applicable
- Capital growth preference
- Risk preference: low, medium, high, opportunistic
- Timeline
- Holding period
- Exit strategy
- Financing method: cash, mortgage, mixed, not disclosed
- Accepts direct owner/developer/agent
- Description

## Public display options

### Public

Visible on Interest Board or Investor Board after approval.

### Members-only

Visible to logged-in verified members.

### Private match only

Visible only to admin and matched parties.

### Hidden

Not visible externally.

## Public card example

```text
Verified Investor
Looking for: Commercial income asset
Countries: UAE / UK
Ticket size: Hidden publicly, verified privately
Target: Stable yield + capital growth
Timeline: 90 days
Accepts: Direct owners, developers, licensed agents
Status: Open
```

## Admin review checklist

- Is the investor real?
- Is the submission clear?
- Is the budget visibility selected?
- Are categories and areas clear?
- Are responses allowed from agents/developers/owners?
- Should proof of funds be requested?
- Should the post be public, members-only, or private-match-only?
- Is the language compliant and not misleading?

## Matching logic

Investor posts should match against:

- Private availability
- Verified listing requests
- Developer opportunities
- Land opportunities
- Commercial opportunities
- Off-plan inventory
- Secondary market opportunities

Match scoring should include:

- Country/area fit
- Property category/type fit
- Market segment fit
- Budget/ticket size overlap
- Yield/growth objective fit
- Timeline fit
- Risk profile fit
- Respondent type preference fit
- Verification level

## Important privacy rule

Investor identity, proof of funds, source of funds, direct contact details, and internal notes must remain private unless the investor approves sharing in a match room.
