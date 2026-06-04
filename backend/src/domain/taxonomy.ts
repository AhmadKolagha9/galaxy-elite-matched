export const taxonomyTypes = [
  "country",
  "area_city",
  "property_category",
  "property_type",
  "market_segment",
  "purpose"
] as const;

export type TaxonomyType = (typeof taxonomyTypes)[number];

export type TaxonomyItemRow = {
  id: string;
  taxonomy_type: string;
  label: string;
  slug: string;
  parent_id: string | null;
  country_scope: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
};

export type TaxonomyItem = {
  id: string;
  taxonomyType: TaxonomyType;
  label: string;
  slug: string;
  parentId: string | null;
  countryScope: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: TaxonomyItem[];
};

export type TaxonomyMutationInput = {
  taxonomyType?: TaxonomyType;
  label?: string;
  slug?: string;
  parentId?: string | null;
  countryScope?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  parentIdProvided?: boolean;
  countryScopeProvided?: boolean;
};

const taxonomyTypeSet = new Set<string>(taxonomyTypes);

export const isTaxonomyType = (value: string): value is TaxonomyType => taxonomyTypeSet.has(value);

export const slugifyTaxonomyValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const normalizeCountryScopeForDb = (value: string | null | undefined) => {
  if (value === null) return null;
  const slug = slugifyTaxonomyValue(String(value ?? ""));
  if (!slug || slug === "global") return null;
  return slug;
};

export const toTaxonomyItem = (row: TaxonomyItemRow): TaxonomyItem => ({
  id: row.id,
  taxonomyType: row.taxonomy_type as TaxonomyType,
  label: row.label,
  slug: row.slug,
  parentId: row.parent_id,
  countryScope: row.country_scope,
  isActive: row.is_active,
  sortOrder: Number(row.sort_order),
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString()
});

const sortTaxonomyItems = (items: TaxonomyItem[]) => {
  items.sort((a, b) => {
    const type = a.taxonomyType.localeCompare(b.taxonomyType);
    if (type) return type;
    const order = a.sortOrder - b.sortOrder;
    if (order) return order;
    return a.label.localeCompare(b.label);
  });
  for (const item of items) {
    if (item.children?.length) sortTaxonomyItems(item.children);
  }
};

export const buildTaxonomyTree = (rows: TaxonomyItemRow[]) => {
  const byId = new Map<string, TaxonomyItem>();
  const roots: TaxonomyItem[] = [];

  for (const row of rows) {
    byId.set(row.id, { ...toTaxonomyItem(row), children: [] });
  }

  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }

  sortTaxonomyItems(roots);
  return roots;
};
