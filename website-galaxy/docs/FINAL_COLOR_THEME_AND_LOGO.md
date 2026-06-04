# Final Color Theme and Logo System

## Identity

- **Company / brokerage:** Galaxy Elite Real Estate
- **Digital product:** Galaxy Elite Private Match
- **Website vision ID:** `GE-PM-VISION-002`
- **Theme ID:** `GE-PM-COLOR-002`
- **Logo system ID:** `GE-PM-LOGO-002`
- **Core promise:** Public Interest. Private Property. Verified Match.

## Visual direction

The final website should feel like a private club, luxury brokerage, matching engine and trusted data room — not like a public listing portal.

The chosen direction is:

> **Obsidian privacy + Midnight authority + Champagne Gold prestige + Ivory clarity + Teal verification.**

This supports the innovation:

- Public interest is visible and readable.
- Private property remains protected.
- Verification and mutual approval are visually clear.
- Galaxy Elite looks premium, trustworthy and global.

## Primary palette

| Token | Hex | Use |
|---|---:|---|
| Obsidian | `#03060B` | Header, footer, dark hero, premium backgrounds |
| Midnight | `#07111F` | Dark panels, dashboard nav, private match areas |
| Deep Navy | `#0D1A2D` | Gradients, cards on dark backgrounds |
| Champagne Gold | `#D4AF66` | Primary CTA, logo accent, key lines, premium labels |
| Heritage Gold | `#A77A35` | Deeper gold for contrast and borders |
| Soft Gold | `#F5DFAA` | Highlight text on dark backgrounds |
| Pearl | `#FFFAF0` | Light surfaces and clean editorial backgrounds |
| Cream | `#FBF6EB` | Main page background |
| Sand | `#EFE5D0` | Soft panels and secondary backgrounds |
| Teal Verification | `#18AD9A` | Verified, live status, trust signals |
| Success Green | `#2BB673` | Open/positive statuses |
| Risk Red | `#BC4D4D` | Error states and warnings |

## CSS variables

These are implemented in `app/globals.css`:

```css
:root {
  --obsidian: #03060b;
  --midnight: #07111f;
  --midnight-2: #0d1a2d;
  --navy: #10243c;
  --gold: #d4af66;
  --gold-deep: #a77a35;
  --gold-soft: #f5dfaa;
  --pearl: #fffaf0;
  --cream: #fbf6eb;
  --sand: #efe5d0;
  --teal: #18ad9a;
}
```

## Logo implementation

The uploaded Galaxy Elite logo has been adapted into the final color system using gold/ivory/dark-background variants.

### Website header

Use:

```text
public/brand/galaxy-elite-header-logo-transparent.png
```

The header uses a dark obsidian background so the logo can appear in a premium gold/ivory treatment.

### Hero / product lockup

Use:

```text
public/brand/galaxy-elite-private-match-horizontal-transparent.png
```

This lockup includes the Private Match product label and supports the hero message.

### Footer

Use:

```text
public/brand/galaxy-elite-private-match-horizontal-transparent.png
```

### Favicon and app icons

Use:

```text
public/icons/icon-256.png
public/icons/icon-512.png
public/icons/apple-touch-icon.png
```

### Social / SEO preview

Use:

```text
public/og/private-match-og.png
```

## Status colors

| Status | Meaning | Color |
|---|---|---:|
| Open | Accepting responses | Success Green `#2BB673` |
| Matching | Under review | Heritage Gold `#A77A35` |
| Matched | Successful match made | Blue `#3D82D7` |
| Archived | No longer active | Muted Slate `#667085` |

## Role badge direction

Badges should remain subtle, premium and trust-based:

- Verified Buyer
- Verified Tenant
- Verified Owner
- Verified Landlord
- Licensed Agent
- Developer Verified
- Budget Verified Privately
- Galaxy Elite Reviewed

Badge base:

```css
background: rgba(255, 250, 240, 0.74);
border: 1px solid rgba(8,17,31,.10);
color: #142235;
```

On dark UI:

```css
background: rgba(255,255,255,.07);
border: 1px solid rgba(245,223,170,.20);
color: #F5DFAA;
```

## Design rules

1. Use dark obsidian for navigation, hero, footer and private areas.
2. Use cream/pearl for form-heavy and information-heavy sections.
3. Use gold sparingly for authority, not decoration everywhere.
4. Use teal only for verified/live trust signals.
5. Do not use bright property-portal colors.
6. Avoid cluttered listing-page layouts.
7. Keep the experience private, spacious, calm and premium.

## Final visual promise

> **No public listings. No spam. No hidden agents. Just verified private matches.**
