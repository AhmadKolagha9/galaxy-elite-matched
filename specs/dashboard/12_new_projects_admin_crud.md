# New Projects Admin CRUD Spec

## Objective
Add admin dashboard tools to create, edit, publish, archive/delete, and review estate development projects shown on the public website `New Projects` tab.

## Admin Routes
- `/new-projects` lists all projects for admins.
- `/new-projects/new` creates a project.
- `/new-projects/[id]` shows project details and edit controls.
- `/new-projects/[id]/edit` edits an existing project.

## Navigation
- Add `New Projects` to the admin/control navigation.
- Dashboard overview should show project counts for draft, published, and archived.

## List View
The admin list shows:

- reference
- project name
- developer name
- country/city
- price range
- status
- created date
- updated date
- quick actions: edit, publish/unpublish, archive/delete

Filters:

- status
- country
- city
- developer
- keyword/reference
- created date range

## Form Fields
Create and edit forms include:

- project name
- developer name
- start price
- end price
- images
- video
- description
- map location
- phone
- address
- city
- country
- status

System-controlled fields:

- `id`
- `reference`
- `user_id`
- `created_at`
- `updated_at`

## Validation
- Project name and description are required.
- At least one image is required before publishing.
- Prices must be positive when present.
- End price must be greater than or equal to start price.
- Status changes use explicit controls, not accidental text edits.
- Delete action archives by default and requires confirmation.

## Behavior
- Create calls `POST /api/admin/new-projects`.
- Edit calls `PATCH /api/admin/new-projects/:id`.
- Status changes call `PATCH /api/admin/new-projects/:id/status`.
- Delete/archive calls `DELETE /api/admin/new-projects/:id`.
- UI shows loading, saving, saved, validation error, and server error states.
- After create, redirect to the new project detail page.

## Permissions
- Admin and super-admin can create/edit/publish/archive.
- Compliance can view and add notes if needed, but cannot publish unless existing RBAC grants that permission.
- Non-admin users cannot access any New Projects admin route.

## Audit And Safety
- Every create, edit, publish, unpublish, archive, and delete action writes an admin audit event.
- Public preview should show only fields that the public website will receive.
- Raw phone, exact address, and precise map location must be reviewed before public exposure.

## Acceptance Checks
- Admin can add a project and see it as draft.
- Admin can edit all editable fields without changing the generated reference.
- Admin can publish only when required public fields are valid.
- Published projects appear on the public website without login.
- Archived/deleted projects disappear from the public website but remain traceable in admin/audit history.
