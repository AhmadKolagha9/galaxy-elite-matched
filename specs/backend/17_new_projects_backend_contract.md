# New Projects Backend Contract Spec

## Objective
Add a backend contract for public, admin-managed estate development projects shown in the website `New Projects` tab. Visitors can browse approved projects without login, while create, edit, delete, and publish controls remain admin-only.

## Table
Create a `new_projects` SQL table with these product fields:

- `id char(36) primary key`
- `project_name varchar(180) not null`
- `start_price decimal(14,2) null`
- `end_price decimal(14,2) null`
- `images json not null`
- `video varchar(500) null`
- `description text not null`
- `user_id varchar(64) null`
- `map_location varchar(500) null`
- `phone varchar(40) null`
- `address varchar(500) null`
- `status enum('draft','published','archived') not null default 'draft'`
- `city_id varchar(64) null`
- `country_id varchar(64) null`
- `developer_name varchar(180) null`
- `reference varchar(32) not null unique`
- `created_at timestamp default current_timestamp`
- `updated_at timestamp default current_timestamp on update current_timestamp`

## Field Rules
- `reference` is server-generated with an `NP-` prefix and must be stable.
- `images` stores ordered image URLs or storage keys as a JSON array.
- `video` stores one approved video URL or storage key.
- `user_id` is server-authoritative when tied to the admin or developer account.
- `status = published` is the only state visible through public APIs.
- `phone`, exact `address`, and precise `map_location` are admin/private fields unless Galaxy Elite explicitly approves them as public marketing information.

## Public API
- `GET /api/new-projects`
- `GET /api/new-projects/:reference`

Public responses do not require login and return only published, public-safe fields:

- `id`
- `reference`
- `projectName`
- `developerName`
- `startPrice`
- `endPrice`
- `images`
- `video`
- `description`
- `cityId`
- `countryId`
- `publicAddressLabel`
- `publicMapLocation`
- `status`
- `createdAt`
- `updatedAt`

## Admin API
- `GET /api/admin/new-projects`
- `GET /api/admin/new-projects/:id`
- `POST /api/admin/new-projects`
- `PATCH /api/admin/new-projects/:id`
- `DELETE /api/admin/new-projects/:id`
- `PATCH /api/admin/new-projects/:id/status`

Admin create/update validation:

- `project_name` is required.
- `description` is required.
- `start_price` and `end_price` must be positive when present.
- `end_price` must be greater than or equal to `start_price` when both exist.
- `images` must be an array and must contain at least one item before publish.
- `status` can only be changed by admin API logic.

## Architecture
- Add route modules under `backend/src/routes/new-projects.ts` and `backend/src/routes/admin/new-projects.ts`.
- Add repository methods under `backend/src/repositories/new-project-repository.ts`.
- Add domain/service logic under `backend/src/services/new-project-service.ts`.
- Add output sanitizing helpers so public responses cannot accidentally include admin-only fields.
- Mount public routes from `backend/src/routes/index.ts` and admin routes from `backend/src/routes/admin/index.ts`.

## Security
- Public routes are read-only and rate-limited.
- Admin routes require existing admin/compliance guard.
- Never trust `user_id`, `status`, `reference`, `created_at`, or `updated_at` from clients.
- Delete should be soft-delete by setting `status = archived` unless a super-admin hard-delete path is added later.
- Audit every admin create, update, status change, and delete/archive action.

## Acceptance Checks
- Logged-out visitors can list and open published projects.
- Draft and archived projects are never returned by public APIs.
- Admins can create, edit, archive/delete, and publish projects.
- Public responses do not include raw `phone` or exact private `address` by default.
- Invalid price ranges, empty publish images, and unsupported statuses are rejected.
