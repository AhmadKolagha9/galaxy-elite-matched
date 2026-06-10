# Admin Site Settings Controls Spec

## Objective
Add a Site Settings admin screen for runtime public website controls.

## Route
- `/admin/site-settings`

## Controls
- Toggle maintenance mode on/off.
- Edit maintenance page title.
- Edit maintenance page message.
- Toggle each public header tab visible/hidden.

## Behavior
- Changes save through `PATCH /api/admin/site-settings`.
- UI shows saving/saved/error states.
- Admin overview and admin navigation link to Site Settings.
- Controls must be clear and hard to confuse with user content approvals.
