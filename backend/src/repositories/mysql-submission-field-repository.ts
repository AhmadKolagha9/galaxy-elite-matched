import { randomUUID } from "node:crypto";

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { mysqlExecute, withMySqlTransaction, type MySqlConnection } from "../db/mysql.js";
import { slugifyTaxonomyValue } from "../domain/taxonomy.js";
import { badRequest } from "../http/errors.js";
import type { InterestSignalPayload, PrivateAvailabilityPayload } from "../schemas/submission-fields.js";

type TaxonomyRow = RowDataPacket & {
  id: string;
  label: string;
  slug: string;
  parent_id: string | null;
  country_scope: string | null;
};

type CreatedSubmission = {
  id: string;
  status: "pending_review";
  message: string;
};

const pendingMessage = "Submission received and pending Galaxy Elite review.";

const findTaxonomyItem = async (
  input: { taxonomyType: "country" | "area_city"; value: string; countryScope?: string | null },
  connection?: MySqlConnection
) => {
  const slug = slugifyTaxonomyValue(input.value);
  const params: unknown[] = [input.taxonomyType, input.value, slug];
  const countryScopeClause = input.countryScope === undefined ? "" : " and country_scope <=> ?";

  if (input.countryScope !== undefined) {
    params.push(input.countryScope);
  }

  const rows = await mysqlExecute<TaxonomyRow[]>(
    `select id, label, slug, parent_id, country_scope
     from taxonomy_items
     where taxonomy_type = ?
       and is_active = true
       and (label = ? or slug = ?)
       ${countryScopeClause}
     limit 1`,
    params,
    connection
  );

  return rows[0];
};

const normalizeLocationTaxonomy = async <T extends { country: string; area_city: string }>(payload: T, connection?: MySqlConnection) => {
  const country = await findTaxonomyItem({ taxonomyType: "country", value: payload.country }, connection);
  if (!country) {
    throw badRequest("country must match an active country taxonomy item.");
  }

  const countryScope = country.slug === "global" ? null : country.slug;
  const areaCity = await findTaxonomyItem({ taxonomyType: "area_city", value: payload.area_city, countryScope }, connection);
  if (!areaCity) {
    throw badRequest("area_city must match an active area_city taxonomy item scoped to the selected country.");
  }

  return {
    ...payload,
    country: country.slug,
    area_city: areaCity.slug
  };
};

const insertSubmission = async (
  table: "private_availability" | "interest_signals",
  values: Record<string, unknown>,
  connection: MySqlConnection
) => {
  const columns = Object.keys(values);
  const placeholders = columns.map(() => "?").join(", ");

  await mysqlExecute<ResultSetHeader>(
    `insert into ${table} (${columns.join(", ")}) values (${placeholders})`,
    columns.map((column) => values[column]),
    connection
  );

  return {
    id: String(values.id),
    status: "pending_review",
    message: pendingMessage
  } satisfies CreatedSubmission;
};

const hardcodedSecurityColumns = (userId: string) => ({
  user_id: userId,
  approval_status: "pending_review",
  public_status: "hidden",
  verification_status: "unverified"
});

const serializeAmenities = (amenities: readonly string[]) => JSON.stringify(amenities);

const hasVerificationFilesAttached = (payload: PrivateAvailabilityPayload) => {
  const documents = payload.verification_documents ?? payload.uploadedDocuments ?? [];
  return documents.some((document) => {
    const candidate = document.storage_path ?? document.file_path ?? document.url ?? document.original_filename;
    return typeof candidate === "string" && candidate.trim().length > 0;
  });
};

export const createPrivateAvailability = async (input: { payload: PrivateAvailabilityPayload; userId: string }) =>
  withMySqlTransaction(async (connection) => {
    const payload = await normalizeLocationTaxonomy(input.payload, connection);

    return insertSubmission(
      "private_availability",
      {
        id: randomUUID(),
        ...hardcodedSecurityColumns(input.userId),
        title: payload.title,
        user_role: payload.user_role,
        availability_type: payload.availability_type,
        listing_intent: payload.listing_intent,
        market_segment: payload.market_segment,
        property_type: payload.property_type,
        country: payload.country,
        area_city: payload.area_city,
        project_name: payload.project_name ?? null,
        building_name: payload.building_name ?? null,
        size_sqft: payload.size_sqft,
        price_min: payload.price_min,
        price_max: payload.price_max,
        availability_date: payload.availability_date,
        privacy_level: payload.privacy_level,
        authority_declaration: payload.authority_declaration,
        private_description: payload.private_description,
        category: payload.category,
        offering_type: payload.offering_type,
        rooms: payload.rooms,
        bedrooms: payload.bedrooms,
        total_floors: payload.total_floors,
        parking_spaces: payload.parking_spaces,
        furnishing_type: payload.furnishing_type,
        project_status: payload.project_status,
        amenities: serializeAmenities(payload.amenities),
        preferred_payment_method: payload.preferred_payment_method,
        has_verification_files_attached: hasVerificationFilesAttached(payload)
      },
      connection
    );
  });

export const createInterestSignal = async (input: { payload: InterestSignalPayload; userId: string }) =>
  withMySqlTransaction(async (connection) => {
    const payload = await normalizeLocationTaxonomy(input.payload, connection);

    return insertSubmission(
      "interest_signals",
      {
        id: randomUUID(),
        ...hardcodedSecurityColumns(input.userId),
        title: payload.title,
        user_role: payload.user_role,
        availability_type: payload.availability_type,
        listing_intent: payload.listing_intent,
        market_segment: payload.market_segment,
        property_type: payload.property_type,
        country: payload.country,
        area_city: payload.area_city,
        project_name: payload.project_name ?? null,
        building_name: payload.building_name ?? null,
        size_sqft: payload.size_sqft,
        price_min: payload.price_min,
        price_max: payload.price_max,
        availability_date: payload.availability_date,
        privacy_level: payload.privacy_level,
        private_description: payload.private_description,
        category: payload.category,
        offering_type: payload.offering_type,
        rooms: payload.rooms,
        bedrooms: payload.bedrooms,
        total_floors: payload.total_floors,
        parking_spaces: payload.parking_spaces,
        furnishing_type: payload.furnishing_type,
        project_status: payload.project_status,
        amenities: serializeAmenities(payload.amenities),
        preferred_payment_method: payload.preferred_payment_method
      },
      connection
    );
  });
