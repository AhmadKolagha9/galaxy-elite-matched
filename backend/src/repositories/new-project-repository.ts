import { randomUUID } from "node:crypto";

import type { Queryable } from "../db/pool.js";
import { query } from "../db/pool.js";
import type { NewProjectListFilters, NewProjectMutation, NewProjectRow, NewProjectStatus } from "../domain/new-projects.js";
import { notFound } from "../http/errors.js";

const selectColumns = `id, project_name, start_price, end_price, images, video, description, user_id, map_location, phone, address, status, city_id, country_id, developer_name, reference, created_at, updated_at`;

const buildFilters = (filters: NewProjectListFilters, options: { publicOnly: boolean }) => {
  const values: unknown[] = [];
  const where: string[] = [];

  if (options.publicOnly) where.push("status = 'published'");
  else if (filters.status) {
    values.push(filters.status);
    where.push("status = ?");
  }

  if (filters.countryId) {
    values.push(filters.countryId);
    where.push("country_id = ?");
  }
  if (filters.cityId) {
    values.push(filters.cityId);
    where.push("city_id = ?");
  }
  if (filters.developerName) {
    values.push(`%${filters.developerName}%`);
    where.push("developer_name like ?");
  }
  if (filters.keyword) {
    const keyword = `%${filters.keyword}%`;
    values.push(keyword, keyword, keyword, keyword);
    where.push("(project_name like ? or developer_name like ? or reference like ? or description like ?)");
  }
  if (filters.minPrice !== undefined) {
    values.push(filters.minPrice);
    where.push("(end_price is null or end_price >= ?)");
  }
  if (filters.maxPrice !== undefined) {
    values.push(filters.maxPrice);
    where.push("(start_price is null or start_price <= ?)");
  }

  return { values, where };
};

export const generateNewProjectReference = (id: string) => `NP-${id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;

export const listPublicNewProjects = async (filters: NewProjectListFilters = {}) => {
  const { values, where } = buildFilters(filters, { publicOnly: true });
  const result = await query<NewProjectRow>(
    `select ${selectColumns} from new_projects${where.length ? ` where ${where.join(" and ")}` : ""} order by created_at desc`,
    values
  );
  return result.rows;
};

export const listAdminNewProjects = async (filters: NewProjectListFilters = {}) => {
  const { values, where } = buildFilters(filters, { publicOnly: false });
  const result = await query<NewProjectRow>(
    `select ${selectColumns} from new_projects${where.length ? ` where ${where.join(" and ")}` : ""} order by updated_at desc, created_at desc`,
    values
  );
  return result.rows;
};

export const findPublicNewProjectByReference = async (reference: string) => {
  const result = await query<NewProjectRow>(`select ${selectColumns} from new_projects where reference = ? and status = 'published' limit 1`, [reference]);
  return result.rows[0] ?? null;
};

export const findAdminNewProjectById = async (client: Queryable, id: string) => {
  const result = await client.query<NewProjectRow>(`select ${selectColumns} from new_projects where id = ? limit 1`, [id]);
  return result.rows[0] ?? null;
};

export const findAdminNewProjectByIdOrThrow = async (client: Queryable, id: string) => {
  const row = await findAdminNewProjectById(client, id);
  if (!row) throw notFound("New project not found.");
  return row;
};

export const createNewProject = async (client: Queryable, input: NewProjectMutation & { userId?: string | null }) => {
  const id = randomUUID();
  const reference = generateNewProjectReference(id);
  const result = await client.query<NewProjectRow>(
    `insert into new_projects (id, project_name, start_price, end_price, images, video, description, user_id, map_location, phone, address, status, city_id, country_id, developer_name, reference)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     returning ${selectColumns}`,
    [
      id,
      input.projectName,
      input.startPrice ?? null,
      input.endPrice ?? null,
      JSON.stringify(input.images ?? []),
      input.video ?? null,
      input.description,
      input.userId ?? null,
      input.mapLocation ?? null,
      input.phone ?? null,
      input.address ?? null,
      input.status ?? "draft",
      input.cityId ?? null,
      input.countryId ?? null,
      input.developerName ?? null,
      reference
    ]
  );
  return result.rows[0];
};

export const updateNewProject = async (client: Queryable, id: string, input: NewProjectMutation) => {
  const updates: string[] = [];
  const values: unknown[] = [];
  const add = (column: string, value: unknown) => {
    updates.push(`${column} = ?`);
    values.push(value);
  };

  if (input.projectName !== undefined) add("project_name", input.projectName);
  if (input.startPrice !== undefined) add("start_price", input.startPrice);
  if (input.endPrice !== undefined) add("end_price", input.endPrice);
  if (input.images !== undefined) add("images", JSON.stringify(input.images));
  if (input.video !== undefined) add("video", input.video);
  if (input.description !== undefined) add("description", input.description);
  if (input.mapLocation !== undefined) add("map_location", input.mapLocation);
  if (input.phone !== undefined) add("phone", input.phone);
  if (input.address !== undefined) add("address", input.address);
  if (input.status !== undefined) add("status", input.status);
  if (input.cityId !== undefined) add("city_id", input.cityId);
  if (input.countryId !== undefined) add("country_id", input.countryId);
  if (input.developerName !== undefined) add("developer_name", input.developerName);

  if (!updates.length) return findAdminNewProjectByIdOrThrow(client, id);

  values.push(id);
  const result = await client.query<NewProjectRow>(
    `update new_projects set ${updates.join(", ")}, updated_at = current_timestamp where id = ? returning ${selectColumns}`,
    values
  );
  return result.rows[0];
};

export const updateNewProjectStatus = async (client: Queryable, id: string, status: NewProjectStatus) => updateNewProject(client, id, { status });
export const archiveNewProject = async (client: Queryable, id: string) => updateNewProjectStatus(client, id, "archived");

export const getNewProjectStatusCounts = async () => {
  const result = await query<{ status: NewProjectStatus; count: number | string }>(`select status, count(*) as count from new_projects group by status`);
  return result.rows.reduce<Record<NewProjectStatus, number>>(
    (counts, row) => ({ ...counts, [row.status]: Number(row.count) || 0 }),
    { draft: 0, published: 0, archived: 0 }
  );
};
