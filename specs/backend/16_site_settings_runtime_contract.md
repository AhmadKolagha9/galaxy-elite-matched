# Backend Runtime Site Settings Contract Spec

## Objective
Define a small runtime settings contract for website section visibility and maintenance mode.

## Storage
For this build, settings are persisted in the website server local JSON store. A production database table can replace this later with the same shape.

## Settings Shape
```json
{
  "maintenance": {
    "enabled": false,
    "title": "Private Match is being refined.",
    "message": "We are improving the member experience. Please check back shortly.",
    "updatedAt": "ISO date"
  },
  "navigation": {
    "private-club": true,
    "interest-board": true,
    "private-opportunities": true,
    "market-pulse": true,
    "submit": true
  }
}
```

## API
- `GET /api/admin/site-settings` returns settings for authenticated admins.
- `PATCH /api/admin/site-settings` validates and writes settings for authenticated admins.

## Security
- Admin API calls require the existing admin guard.
- Maintenance mode must not block `/login` or `/admin/*`.
- Public APIs should not expose the settings object unless intentionally added later.
