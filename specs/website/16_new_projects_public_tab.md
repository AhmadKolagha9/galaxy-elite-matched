# New Projects Public Tab Website Spec

## Objective
Add a public website tab named `New Projects` for browsing approved estate development projects. The page is public and must not require login to view project cards or project detail pages.

## Routes
- Header navigation includes `New Projects`.
- `/new-projects` lists published projects.
- `/new-projects/[reference]` opens a public project detail page.

## Data Source
- List page reads from `GET /api/new-projects`.
- Detail page reads from `GET /api/new-projects/:reference`.
- Only records with `status = published` are shown.

## Public Fields
Project cards show:

- project name
- developer name
- start/end price range
- first image
- city/country label
- short description
- reference

Project detail pages show:

- project name
- developer name
- image gallery
- video when provided
- price range
- full public description
- public city/country label
- approved public map/address label
- reference
- enquiry call-to-action

## Privacy Rules
- Do not require login for browse or detail.
- Do not public-render raw `phone` by default.
- Do not public-render exact private address or precise map pin unless the backend marks the values as public-safe.
- Use a Galaxy Elite enquiry CTA when direct contact is not approved.
- Do not expose admin status controls, `user_id`, or internal timestamps beyond normal created/updated display needs.

## UI Rules
- The first screen should be the project browsing experience, not a marketing-only landing page.
- Cards should be scan-friendly with stable image ratios and price formatting.
- Add filters for country, city, developer, price range, and keyword/reference search.
- Empty state should make it clear that no published projects match the filters.
- Loading and error states should not leak backend details.

## SEO
- `/new-projects` is indexable.
- Published detail pages are indexable.
- Draft or archived project URLs return not found or redirect to `/new-projects`.
- Metadata uses project name, developer name, country/city, and safe description only.
- Add `New Projects` to sitemap only for published records.

## Acceptance Checks
- Logged-out users can open `/new-projects` and published project details.
- Header tab appears on desktop and mobile navigation.
- Filters update the visible project list without layout jumps.
- Draft/archived project references are not visible and do not render detail content.
- Public pages do not show raw phone, `user_id`, admin status controls, or private address data.
