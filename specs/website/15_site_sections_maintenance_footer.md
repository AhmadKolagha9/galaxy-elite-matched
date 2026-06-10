# Website Site Sections, Maintenance Mode, and Footer Spec

## Objective
Add runtime website controls so Galaxy Elite admins can show/hide header navigation sections and place the public website into maintenance mode without redeploying code.

## Header Sections
Managed sections:
- Private Club
- Interest Board
- Private Opportunities
- Market Pulse
- Submit

Rules:
- Hidden sections are removed from the public header.
- Hidden sections are also removed from the primary platform footer navigation where relevant.
- Direct routes remain available unless maintenance mode is enabled; this phase controls navigation visibility, not route deletion.

## Maintenance Mode
- Admins can enable/disable maintenance mode from the admin dashboard.
- Maintenance mode renders a polished public maintenance page for normal website visitors.
- `/login` and `/admin/*` remain reachable so admins can sign in and turn maintenance off.
- The maintenance page must not expose private records, operational internals, or admin data.

## Footer
- Footer should follow the compact old-site structure: brand statement on the left, short navigation on the right, dark premium styling.
- Keep trust/legal links available.
- Use current Galaxy Elite brand assets and existing site metadata.
