import type { Request } from "express";

import { taxonomyTypes, isTaxonomyType, normalizeCountryScopeForDb, slugifyTaxonomyValue, type TaxonomyMutationInput, type TaxonomyType } from "../domain/taxonomy.js";
import { badRequest } from "../http/errors.js";
import { asOptionalString } from "./strings.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedCountryScopes = new Set(["uae", "uk", "india"]);

const normalizeTaxonomyTypeInput = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

type MutationMode = "create" | "update";

const readAlias = (body: Record<string, unknown>, snake: string, camel: string) => {
  if (Object.prototype.hasOwnProperty.call(body, snake)) return body[snake];
  if (Object.prototype.hasOwnProperty.call(body, camel)) return body[camel];
  return undefined;
};

const hasAlias = (body: Record<string, unknown>, snake: string, camel: string) =>
  Object.prototype.hasOwnProperty.call(body, snake) || Object.prototype.hasOwnProperty.call(body, camel);

export const parseTaxonomyTypeParam = (value: unknown): TaxonomyType | undefined => {
  const text = asOptionalString(value);
  if (!text) return undefined;
  const slug = normalizeTaxonomyTypeInput(text);
  if (isTaxonomyType(slug)) return slug;
  throw badRequest(`Unknown taxonomy type. Allowed values: ${taxonomyTypes.join(", ")}.`);
};

export const parseCountryScopeParam = (value: unknown) => {
  const text = asOptionalString(value);
  if (!text) return undefined;
  const scope = normalizeCountryScopeForDb(text);
  if (!scope) return null;
  if (allowedCountryScopes.has(scope)) return scope;
  throw badRequest("country_scope must be one of: global, uae, uk, india.");
};

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(lower)) return true;
    if (["false", "0", "no", "off"].includes(lower)) return false;
  }
  throw badRequest("is_active must be a boolean value.");
};

const parseSortOrder = (value: unknown) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 100000) {
    throw badRequest("sort_order must be an integer between 0 and 100000.");
  }
  return number;
};

const parseParentId = (value: unknown) => {
  if (value === null || value === "") return null;
  const text = asOptionalString(value);
  if (!text) throw badRequest("parent_id must be a valid UUID or null.");
  if (!uuidPattern.test(text)) throw badRequest("parent_id must be a valid UUID.");
  return text;
};

export const parseTaxonomyMutation = (body: Record<string, unknown>, mode: MutationMode): TaxonomyMutationInput => {
  const mutation: TaxonomyMutationInput = {};

  const typeValue = readAlias(body, "taxonomy_type", "taxonomyType");
  const labelValue = readAlias(body, "label", "label");
  const slugValue = readAlias(body, "slug", "slug");
  const parentValue = readAlias(body, "parent_id", "parentId");
  const scopeValue = readAlias(body, "country_scope", "countryScope");
  const activeValue = readAlias(body, "is_active", "isActive");
  const orderValue = readAlias(body, "sort_order", "sortOrder");

  if (typeValue !== undefined) {
    const taxonomyType = normalizeTaxonomyTypeInput(typeValue);
    if (!isTaxonomyType(taxonomyType)) {
      throw badRequest(`taxonomy_type must be one of: ${taxonomyTypes.join(", ")}.`);
    }
    mutation.taxonomyType = taxonomyType;
  } else if (mode === "create") {
    throw badRequest("taxonomy_type is required.");
  }

  if (labelValue !== undefined) {
    const label = asOptionalString(labelValue);
    if (!label || label.length > 120) throw badRequest("label is required and must be 120 characters or fewer.");
    mutation.label = label;
  } else if (mode === "create") {
    throw badRequest("label is required.");
  }

  if (slugValue !== undefined || mutation.label) {
    const source = asOptionalString(slugValue) ?? mutation.label ?? "";
    const slug = slugifyTaxonomyValue(source);
    if (!slug || slug.length > 140) throw badRequest("slug must contain letters or numbers and be 140 characters or fewer.");
    mutation.slug = slug;
  }

  if (hasAlias(body, "parent_id", "parentId")) {
    mutation.parentId = parseParentId(parentValue);
    mutation.parentIdProvided = true;
  }

  if (hasAlias(body, "country_scope", "countryScope")) {
    const scope = normalizeCountryScopeForDb(scopeValue === null ? null : String(scopeValue ?? ""));
    if (scope && !allowedCountryScopes.has(scope)) {
      throw badRequest("country_scope must be one of: global, uae, uk, india.");
    }
    mutation.countryScope = scope;
    mutation.countryScopeProvided = true;
  }

  if (activeValue !== undefined) mutation.isActive = parseBoolean(activeValue);
  if (orderValue !== undefined) mutation.sortOrder = parseSortOrder(orderValue);

  if (mode === "create") {
    mutation.isActive ??= true;
    mutation.sortOrder ??= 0;
  }

  if (mode === "update" && !Object.keys(mutation).some((key) => !["parentIdProvided", "countryScopeProvided"].includes(key))) {
    throw badRequest("At least one taxonomy field is required for update.");
  }

  return mutation;
};

export const parseTaxonomyListQuery = (request: Request) => ({
  type: parseTaxonomyTypeParam(request.query.type),
  countryScope: parseCountryScopeParam(request.query.country_scope ?? request.query.country)
});
