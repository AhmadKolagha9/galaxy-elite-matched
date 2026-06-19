import type { Request } from "express";

import { newProjectStatuses, type NewProjectListFilters, type NewProjectMutation, type NewProjectStatus } from "../domain/new-projects.js";
import { badRequest } from "../http/errors.js";
import { asOptionalString } from "./strings.js";
import { requireObjectBody } from "./validation.js";

const statusSet = new Set<string>(newProjectStatuses);

const readAlias = (body: Record<string, unknown>, snake: string, camel: string) => {
  if (Object.prototype.hasOwnProperty.call(body, snake)) return body[snake];
  if (Object.prototype.hasOwnProperty.call(body, camel)) return body[camel];
  return undefined;
};

const hasAlias = (body: Record<string, unknown>, snake: string, camel: string) =>
  Object.prototype.hasOwnProperty.call(body, snake) || Object.prototype.hasOwnProperty.call(body, camel);

const optionalText = (value: unknown, maxLength: number, field: string) => {
  if (value === null || value === "") return null;
  const text = asOptionalString(value);
  if (!text) return null;
  if (text.length > maxLength) throw badRequest(`${field} must be ${maxLength} characters or fewer.`);
  return text;
};

const requiredText = (value: unknown, maxLength: number, field: string) => {
  const text = asOptionalString(value);
  if (!text) throw badRequest(`${field} is required.`);
  if (text.length > maxLength) throw badRequest(`${field} must be ${maxLength} characters or fewer.`);
  return text;
};

const optionalMoney = (value: unknown, field: string) => {
  if (value === null || value === "") return null;
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw badRequest(`${field} must be a positive number.`);
  return number;
};

const parseImages = (value: unknown) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  throw badRequest("images must be an array or a comma/newline separated string.");
};

export const parseNewProjectStatus = (value: unknown): NewProjectStatus => {
  const status = String(value ?? "").trim().toLowerCase();
  if (statusSet.has(status)) return status as NewProjectStatus;
  throw badRequest(`status must be one of: ${newProjectStatuses.join(", ")}.`);
};

export const parseNewProjectMutation = (bodyInput: unknown, mode: "create" | "update"): NewProjectMutation => {
  const body = requireObjectBody(bodyInput);
  const mutation: NewProjectMutation = {};

  if (hasAlias(body, "project_name", "projectName")) {
    mutation.projectName = requiredText(readAlias(body, "project_name", "projectName"), 180, "project_name");
  } else if (mode === "create") {
    throw badRequest("project_name is required.");
  }

  if (hasAlias(body, "description", "description")) {
    mutation.description = requiredText(readAlias(body, "description", "description"), 20000, "description");
  } else if (mode === "create") {
    throw badRequest("description is required.");
  }

  if (hasAlias(body, "start_price", "startPrice")) mutation.startPrice = optionalMoney(readAlias(body, "start_price", "startPrice"), "start_price");
  if (hasAlias(body, "end_price", "endPrice")) mutation.endPrice = optionalMoney(readAlias(body, "end_price", "endPrice"), "end_price");
  if (hasAlias(body, "images", "images")) mutation.images = parseImages(readAlias(body, "images", "images"));
  if (hasAlias(body, "video", "video")) mutation.video = optionalText(readAlias(body, "video", "video"), 500, "video");
  if (hasAlias(body, "map_location", "mapLocation")) mutation.mapLocation = optionalText(readAlias(body, "map_location", "mapLocation"), 500, "map_location");
  if (hasAlias(body, "phone", "phone")) mutation.phone = optionalText(readAlias(body, "phone", "phone"), 40, "phone");
  if (hasAlias(body, "address", "address")) mutation.address = optionalText(readAlias(body, "address", "address"), 500, "address");
  if (hasAlias(body, "city_id", "cityId")) mutation.cityId = optionalText(readAlias(body, "city_id", "cityId"), 64, "city_id");
  if (hasAlias(body, "country_id", "countryId")) mutation.countryId = optionalText(readAlias(body, "country_id", "countryId"), 64, "country_id");
  if (hasAlias(body, "developer_name", "developerName")) mutation.developerName = optionalText(readAlias(body, "developer_name", "developerName"), 180, "developer_name");
  if (hasAlias(body, "status", "status")) mutation.status = parseNewProjectStatus(readAlias(body, "status", "status"));

  if (mutation.startPrice !== undefined && mutation.endPrice !== undefined && mutation.startPrice !== null && mutation.endPrice !== null && mutation.endPrice < mutation.startPrice) {
    throw badRequest("end_price must be greater than or equal to start_price.");
  }

  if (mode === "update" && !Object.keys(mutation).length) throw badRequest("At least one project field is required for update.");
  return mutation;
};

const optionalQueryMoney = (value: unknown, field: string) => {
  const text = asOptionalString(value);
  if (!text) return undefined;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0) throw badRequest(`${field} must be a positive number.`);
  return number;
};

export const parsePublicNewProjectFilters = (request: Request): NewProjectListFilters => ({
  countryId: asOptionalString(request.query.country_id ?? request.query.country),
  cityId: asOptionalString(request.query.city_id ?? request.query.city),
  developerName: asOptionalString(request.query.developer),
  keyword: asOptionalString(request.query.keyword ?? request.query.q),
  minPrice: optionalQueryMoney(request.query.min_price ?? request.query.minPrice, "min_price"),
  maxPrice: optionalQueryMoney(request.query.max_price ?? request.query.maxPrice, "max_price")
});

export const parseAdminNewProjectFilters = (request: Request): NewProjectListFilters => ({
  ...parsePublicNewProjectFilters(request),
  status: request.query.status ? parseNewProjectStatus(request.query.status) : undefined
});
