import type { SubmissionType } from "../domain/submissions.js";
import { slugifyTaxonomyValue } from "../domain/taxonomy.js";
import { badRequest } from "../http/errors.js";
import { activeTaxonomySlugExists } from "../repositories/taxonomy-repository.js";
import { asOptionalString, toStringArray } from "./strings.js";

const normalizeTaxonomyInput = (value: unknown) => {
  const text = asOptionalString(value);
  return text ? slugifyTaxonomyValue(text) : undefined;
};

const assertActiveTaxonomyValue = async (input: { field: string; taxonomyType: string; value: unknown; countryScope?: string | null }) => {
  const slug = normalizeTaxonomyInput(input.value);
  if (!slug) return undefined;
  const exists = await activeTaxonomySlugExists({ taxonomyType: input.taxonomyType, slug, countryScope: input.countryScope });
  if (!exists) throw badRequest(`${input.field} must match an active ${input.taxonomyType} taxonomy slug.`);
  return slug;
};

const normalizeArrayField = async (data: Record<string, unknown>, field: string, taxonomyType: string, countryScope?: string | null) => {
  const values = toStringArray(data[field]);
  if (!values.length) return;
  const normalized: string[] = [];
  for (const value of values) {
    const slug = await assertActiveTaxonomyValue({ field, taxonomyType, value, countryScope });
    if (slug) normalized.push(slug);
  }
  data[field] = normalized;
};

const normalizeSingleField = async (data: Record<string, unknown>, field: string, taxonomyType: string, countryScope?: string | null) => {
  const slug = await assertActiveTaxonomyValue({ field, taxonomyType, value: data[field], countryScope });
  if (slug) data[field] = slug;
  return slug;
};

const normalizePurposeField = async (data: Record<string, unknown>, field: string) => {
  if (data[field] === undefined) return undefined;
  return normalizeSingleField(data, field, "purpose");
};

export const validateSubmissionTaxonomy = async (type: SubmissionType, data: Record<string, unknown>) => {
  if (type === "newsletter") return;

  const country = await normalizeSingleField(data, "country", "country");
  const countryScope = country && country !== "global" ? country : null;

  if (data.cityArea !== undefined) await normalizeSingleField(data, "cityArea", "area_city", countryScope);
  if (data.area !== undefined) await normalizeSingleField(data, "area", "area_city", countryScope);
  if (data.propertyType !== undefined) await normalizeSingleField(data, "propertyType", "property_type");
  if (data.marketSegment !== undefined) await normalizeSingleField(data, "marketSegment", "market_segment");

  await normalizePurposeField(data, "purpose");
  await normalizePurposeField(data, "listingIntent");
  await normalizePurposeField(data, "availabilityType");

  if (type === "investor") {
    await normalizeArrayField(data, "countries", "country");
    await normalizeArrayField(data, "propertyTypes", "property_type");
    await normalizeArrayField(data, "marketSegments", "market_segment");
  }
};
