import { query, type Queryable } from "../db/pool.js";
import { normalizeCountryScopeForDb, toTaxonomyItem, type TaxonomyItem, type TaxonomyItemRow, type TaxonomyMutationInput } from "../domain/taxonomy.js";
import { badRequest, notFound } from "../http/errors.js";

export type TaxonomyListFilters = {
  type?: string;
  countryScope?: string | null;
};

const taxonomySelect = `id, taxonomy_type, label, slug, parent_id, country_scope, is_active, sort_order, created_at, updated_at`;

const buildFilterClause = (filters: TaxonomyListFilters, options: { activeOnly: boolean }) => {
  const values: unknown[] = [];
  const where: string[] = [];

  if (options.activeOnly) where.push("is_active = true");

  if (filters.type) {
    values.push(filters.type);
    where.push("taxonomy_type = ?");
  }

  if (filters.countryScope !== undefined) {
    if (filters.countryScope === null) {
      where.push("country_scope is null");
    } else {
      values.push(filters.countryScope);
      where.push("(country_scope is null or country_scope = ?)");
    }
  }

  return { values, where };
};

const taxonomyOrder = "taxonomy_type, country_scope, sort_order, label";

export const listPublicTaxonomy = async (filters: TaxonomyListFilters = {}) => {
  const { values, where } = buildFilterClause(filters, { activeOnly: true });
  const result = await query<TaxonomyItemRow>(
    `select ${taxonomySelect} from taxonomy_items${where.length ? ` where ${where.join(" and ")}` : ""} order by ${taxonomyOrder}`,
    values
  );
  return result.rows.map(toTaxonomyItem);
};

export const listAdminTaxonomyRows = async (filters: TaxonomyListFilters = {}) => {
  const { values, where } = buildFilterClause(filters, { activeOnly: false });
  const result = await query<TaxonomyItemRow>(
    `select ${taxonomySelect} from taxonomy_items${where.length ? ` where ${where.join(" and ")}` : ""} order by ${taxonomyOrder}`,
    values
  );
  return result.rows;
};

export const findTaxonomyItemById = async (client: Queryable, id: string) => {
  const result = await client.query<TaxonomyItemRow>(`select ${taxonomySelect} from taxonomy_items where id = ? limit 1`, [id]);
  return result.rows[0] ?? null;
};

const assertParentIsValid = async (client: Queryable, mutation: TaxonomyMutationInput, current?: TaxonomyItemRow) => {
  const parentId = mutation.parentIdProvided ? mutation.parentId : current?.parent_id ?? null;
  if (!parentId) return;

  if (current && parentId === current.id) {
    throw badRequest("parent_id cannot reference the same taxonomy item.");
  }

  const parent = await findTaxonomyItemById(client, parentId);
  if (!parent) throw badRequest("parent_id does not reference an existing taxonomy item.");

  const nextScope = mutation.countryScopeProvided ? mutation.countryScope ?? null : current?.country_scope ?? null;
  if (parent.country_scope && parent.country_scope !== nextScope) {
    throw badRequest("A taxonomy item cannot be nested under a parent from a different country_scope.");
  }

  if (current) {
    const cycle = await client.query<{ id: string }>(
      `with recursive descendants as (
         select id from taxonomy_items where parent_id = ?
         union all
         select child.id
         from taxonomy_items child
         inner join descendants d on child.parent_id = d.id
       )
       select id from descendants where id = ? limit 1`,
      [current.id, parentId]
    );
    if (cycle.rows[0]) throw badRequest("parent_id cannot point to a child item because that would create a taxonomy loop.");
  }
};

const normalizeMutationForWrite = (mutation: TaxonomyMutationInput) => ({
  ...mutation,
  countryScope: mutation.countryScopeProvided ? normalizeCountryScopeForDb(mutation.countryScope) : mutation.countryScope
});

export const createTaxonomyItem = async (client: Queryable, input: TaxonomyMutationInput): Promise<TaxonomyItem> => {
  const mutation = normalizeMutationForWrite(input);
  await assertParentIsValid(client, mutation);

  const result = await client.query<TaxonomyItemRow>(
    `insert into taxonomy_items (taxonomy_type, label, slug, parent_id, country_scope, is_active, sort_order)
     values (?, ?, ?, ?, ?, ?, ?)
     returning ${taxonomySelect}`,
    [
      mutation.taxonomyType,
      mutation.label,
      mutation.slug,
      mutation.parentId ?? null,
      mutation.countryScope ?? null,
      mutation.isActive ?? true,
      mutation.sortOrder ?? 0
    ]
  );
  return toTaxonomyItem(result.rows[0]);
};

export const updateTaxonomyItem = async (client: Queryable, id: string, input: TaxonomyMutationInput): Promise<{ previous: TaxonomyItem; item: TaxonomyItem }> => {
  const current = await findTaxonomyItemById(client, id);
  if (!current) throw notFound("Taxonomy item not found.");

  const mutation = normalizeMutationForWrite(input);
  await assertParentIsValid(client, mutation, current);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (mutation.taxonomyType) {
    values.push(mutation.taxonomyType);
    updates.push("taxonomy_type = ?");
  }
  if (mutation.label) {
    values.push(mutation.label);
    updates.push("label = ?");
  }
  if (mutation.slug) {
    values.push(mutation.slug);
    updates.push("slug = ?");
  }
  if (mutation.parentIdProvided) {
    values.push(mutation.parentId ?? null);
    updates.push("parent_id = ?");
  }
  if (mutation.countryScopeProvided) {
    values.push(mutation.countryScope ?? null);
    updates.push("country_scope = ?");
  }
  if (mutation.isActive !== undefined) {
    values.push(mutation.isActive);
    updates.push("is_active = ?");
  }
  if (mutation.sortOrder !== undefined) {
    values.push(mutation.sortOrder);
    updates.push("sort_order = ?");
  }

  if (!updates.length) return { previous: toTaxonomyItem(current), item: toTaxonomyItem(current) };

  values.push(id);
  const result = await client.query<TaxonomyItemRow>(
    `update taxonomy_items set ${updates.join(", ")}, updated_at = now() where id = ? returning ${taxonomySelect}`,
    values
  );

  return { previous: toTaxonomyItem(current), item: toTaxonomyItem(result.rows[0]) };
};

export const archiveTaxonomyItem = async (client: Queryable, id: string) => {
  return updateTaxonomyItem(client, id, { isActive: false });
};

export const findTaxonomyItemBySlug = async (client: Queryable, input: { taxonomyType: string; slug: string; countryScope?: string | null }) => {
  const scope = normalizeCountryScopeForDb(input.countryScope);
  const result = scope
    ? await client.query<TaxonomyItemRow>(
        `select ${taxonomySelect}
         from taxonomy_items
         where taxonomy_type = ? and slug = ? and (country_scope is null or country_scope = ?)
         limit 1`,
        [input.taxonomyType, input.slug, scope]
      )
    : await client.query<TaxonomyItemRow>(
        `select ${taxonomySelect}
         from taxonomy_items
         where taxonomy_type = ? and slug = ? and country_scope is null
         limit 1`,
        [input.taxonomyType, input.slug]
      );
  return result.rows[0] ? toTaxonomyItem(result.rows[0]) : null;
};

export const activeTaxonomySlugExists = async (input: { taxonomyType: string; slug: string; countryScope?: string | null }) => {
  const scope = normalizeCountryScopeForDb(input.countryScope);
  const result = scope
    ? await query<{ exists: number }>(
        `select exists (
           select 1 from taxonomy_items
           where taxonomy_type = ? and slug = ? and is_active = true and (country_scope is null or country_scope = ?)
         ) as \`exists\``,
        [input.taxonomyType, input.slug, scope]
      )
    : await query<{ exists: number }>(
        `select exists (
           select 1 from taxonomy_items
           where taxonomy_type = ? and slug = ? and is_active = true and country_scope is null
         ) as \`exists\``,
        [input.taxonomyType, input.slug]
      );
  return Boolean(result.rows[0]?.exists);
};

export const taxonomyRepository = {
  list: listPublicTaxonomy,
  listAdminRows: listAdminTaxonomyRows,
  create: createTaxonomyItem,
  update: updateTaxonomyItem,
  archive: archiveTaxonomyItem,
  findBySlug: findTaxonomyItemBySlug,
  activeSlugExists: activeTaxonomySlugExists
};
