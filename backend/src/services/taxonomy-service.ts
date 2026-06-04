import { withTransaction } from "../db/pool.js";
import { buildTaxonomyTree, slugifyTaxonomyValue, type TaxonomyItem, type TaxonomyMutationInput } from "../domain/taxonomy.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest } from "../http/errors.js";
import { recordAdminAction } from "../repositories/admin-action-repository.js";
import { createTaxonomyItem, findTaxonomyItemBySlug, listAdminTaxonomyRows, listPublicTaxonomy, updateTaxonomyItem, archiveTaxonomyItem } from "../repositories/taxonomy-repository.js";
import { parseTaxonomyMutation } from "../utils/taxonomy-validation.js";

let taxonomyCacheVersion = 1;

const mutationNote = (item: TaxonomyItem) => JSON.stringify({ taxonomyType: item.taxonomyType, slug: item.slug, countryScope: item.countryScope });

const handleTaxonomyWriteError = (error: unknown): never => {
  if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "23505") {
    throw badRequest("A taxonomy item with this taxonomy_type, slug, and country_scope already exists.");
  }
  throw error;
};

export const getTaxonomyCacheVersion = () => taxonomyCacheVersion;

export const invalidateTaxonomyCache = () => {
  taxonomyCacheVersion += 1;
  return taxonomyCacheVersion;
};

export const taxonomyService = {
  listPublic: async (filters: { type?: string; countryScope?: string | null }) => listPublicTaxonomy(filters),

  getAdminTree: async (filters: { type?: string; countryScope?: string | null }) => {
    const rows = await listAdminTaxonomyRows(filters);
    return { items: rows, tree: buildTaxonomyTree(rows) };
  },

  create: async (actor: AuthPrincipal, input: TaxonomyMutationInput, ipAddress?: string) => {
    try {
      return await withTransaction(async (client) => {
        const item = await createTaxonomyItem(client, input);
        await recordAdminAction(client, {
          actor,
          actionType: "taxonomy_create",
          objectType: "taxonomy_item",
          objectId: item.id,
          newStatus: item.isActive ? "active" : "inactive",
          note: mutationNote(item),
          ipAddress
        });
        invalidateTaxonomyCache();
        return item;
      });
    } catch (error) {
      return handleTaxonomyWriteError(error);
    }
  },

  update: async (actor: AuthPrincipal, id: string, input: TaxonomyMutationInput, ipAddress?: string) => {
    try {
      return await withTransaction(async (client) => {
        const { previous, item } = await updateTaxonomyItem(client, id, input);
        await recordAdminAction(client, {
          actor,
          actionType: "taxonomy_update",
          objectType: "taxonomy_item",
          objectId: item.id,
          previousStatus: previous.isActive ? "active" : "inactive",
          newStatus: item.isActive ? "active" : "inactive",
          note: JSON.stringify({ before: mutationNote(previous), after: mutationNote(item) }),
          ipAddress
        });
        invalidateTaxonomyCache();
        return item;
      });
    } catch (error) {
      return handleTaxonomyWriteError(error);
    }
  },

  archive: async (actor: AuthPrincipal, id: string, ipAddress?: string) => {
    return await withTransaction(async (client) => {
      const { previous, item } = await archiveTaxonomyItem(client, id);
      await recordAdminAction(client, {
        actor,
        actionType: "taxonomy_archive",
        objectType: "taxonomy_item",
        objectId: item.id,
        previousStatus: previous.isActive ? "active" : "inactive",
        newStatus: item.isActive ? "active" : "inactive",
        note: mutationNote(item),
        ipAddress
      });
      invalidateTaxonomyCache();
      return item;
    });
  },

  importCsv: async (actor: AuthPrincipal, csv: string, ipAddress?: string) => {
    const rows = parseTaxonomyCsv(csv);
    if (!rows.length) throw badRequest("CSV import did not contain any taxonomy rows.");

    try {
      return await withTransaction(async (client) => {
        const imported: TaxonomyItem[] = [];

        for (const row of rows) {
          const mutation = parseTaxonomyMutation(row, "create");
          if (row.parent_slug && !mutation.parentIdProvided) {
            const parentSlug = slugifyTaxonomyValue(String(row.parent_slug));
            const parentType = row.parent_taxonomy_type ? String(row.parent_taxonomy_type).trim().toLowerCase().replace(/[\s-]+/g, "_") : mutation.taxonomyType;
            const parent = await findTaxonomyItemBySlug(client, {
              taxonomyType: parentType ?? "",
              slug: parentSlug,
              countryScope: row.parent_country_scope ? String(row.parent_country_scope) : mutation.countryScope
            });
            if (!parent) throw badRequest(`CSV parent_slug not found: ${row.parent_slug}.`);
            mutation.parentId = parent.id;
            mutation.parentIdProvided = true;
          }

          const item = await createTaxonomyItem(client, mutation);
          await recordAdminAction(client, {
            actor,
            actionType: "taxonomy_import_create",
            objectType: "taxonomy_item",
            objectId: item.id,
            newStatus: item.isActive ? "active" : "inactive",
            note: mutationNote(item),
            ipAddress
          });
          imported.push(item);
        }

        invalidateTaxonomyCache();
        return imported;
      });
    } catch (error) {
      return handleTaxonomyWriteError(error);
    }
  }
};

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (quoted) throw badRequest("CSV contains an unterminated quoted field.");
  cells.push(current.trim());
  return cells;
};

export const parseTaxonomyCsv = (csv: string) => {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map((header) => slugifyTaxonomyValue(header).replace(/-/g, "_"));
  const requiredHeaders = ["taxonomy_type", "label"];
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length) throw badRequest(`CSV missing required header(s): ${missing.join(", ")}.`);

  return lines.slice(1).map((line, lineIndex) => {
    const values = parseCsvLine(line);
    if (values.length > headers.length) throw badRequest(`CSV line ${lineIndex + 2} has more values than headers.`);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
};
