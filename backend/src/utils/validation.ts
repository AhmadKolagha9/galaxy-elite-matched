import { badRequest } from "../http/errors.js";
import type { SubmissionType } from "../domain/submissions.js";
import { submissionTypes } from "../domain/submissions.js";
import { asString } from "./strings.js";

const allowedPaymentMethods = new Set(["Cash", "Crypto", "Installments"]);

const requiredFields: Record<SubmissionType, string[]> = {
  interest: ["role", "purpose", "country", "cityArea", "propertyType", "budgetVisibility", "timeline", "description", "name", "email", "phone", "preferred_payment_method"],
  availability: ["role", "availabilityType", "listingIntent", "marketSegment", "country", "cityArea", "propertyType", "priceRange", "availabilityDate", "privacyLevel", "authority", "description", "name", "email", "phone", "preferred_payment_method"],
  verifiedListing: ["submitterRole", "listingIntent", "marketSegment", "purpose", "country", "cityArea", "propertyType", "priceRange", "ownershipStatus", "permitStatus", "description", "name", "email", "phone"],
  investor: ["investorProfile", "investorGoal", "marketSegment", "country", "cityArea", "propertyType", "ticketSize", "riskPreference", "timeline", "budgetVisibility", "description", "name", "email", "phone"],
  agent: ["name", "email", "phone", "company", "licenceNumber", "country", "representation", "authority"],
  newsletter: ["email"]
};

export const parseSubmissionType = (value: string): SubmissionType => {
  if (submissionTypes.includes(value as SubmissionType)) return value as SubmissionType;
  throw badRequest("Unknown submission type.");
};

export const requireObjectBody = (body: unknown) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
};

export const validateSubmission = (type: SubmissionType, data: Record<string, unknown>) => {
  const missing = requiredFields[type].filter((field) => !asString(data[field]));
  if (missing.length) {
    throw badRequest(`Missing required field(s): ${missing.join(", ")}.`);
  }

  if (["interest", "availability"].includes(type)) {
    const paymentMethod = asString(data.preferred_payment_method);
    if (!allowedPaymentMethods.has(paymentMethod)) {
      throw badRequest("preferred_payment_method must be one of: Cash, Crypto, Installments.");
    }
  }

  if (asString(data.email) && !/^\S+@\S+\.\S+$/.test(asString(data.email))) {
    throw badRequest("Email must be valid.");
  }
};
