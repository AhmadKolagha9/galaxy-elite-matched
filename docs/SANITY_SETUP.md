# Sanity Setup

This project does not embed Sanity Studio by default, keeping the website lightweight and less fragile.

## Recommended setup

Create a separate Sanity Studio project or add Studio later after launch.

Copy the schema files from:

```text
sanity/schemas
```

Schema types included:

- interestSignal
- privateAvailability
- agentProfile
- matchRoom
- marketPulse
- newsletterSubscriber

## Environment variables

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_VERSION=2026-05-26
SANITY_WRITE_TOKEN=...
```

Forms will save to Sanity when `SANITY_WRITE_TOKEN` is configured. Without it, local submissions are stored in `.data/` for development.
