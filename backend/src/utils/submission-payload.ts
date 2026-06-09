import type { SubmissionType } from "../domain/submissions.js";

const allowedFields: Record<SubmissionType, Set<string>> = {
  interest: new Set(["role", "purpose", "country", "cityArea", "area", "projectName", "propertyType", "marketSegment", "size", "budget", "budgetVisibility", "timeline", "description", "agentPreference", "name", "email", "phone", "uploadedDocuments", "preferred_payment_method"]),
  availability: new Set(["role", "availabilityType", "listingIntent", "marketSegment", "country", "cityArea", "projectName", "buildingName", "propertyType", "size", "priceRange", "availabilityDate", "privacyLevel", "authority", "description", "name", "email", "phone", "uploadedDocuments", "preferred_payment_method", "verification_documents"]),
  verifiedListing: new Set(["submitterRole", "listingIntent", "marketSegment", "purpose", "country", "cityArea", "projectName", "buildingName", "propertyType", "size", "priceRange", "availabilityDate", "ownershipStatus", "permitStatus", "privacyLevel", "description", "name", "email", "phone", "uploadedDocuments"]),
  investor: new Set(["title", "investorProfile", "investorGoal", "marketSegment", "marketSegments", "country", "countries", "cityArea", "propertyType", "propertyTypes", "ticketSize", "budgetVisibility", "targetYield", "riskPreference", "timeline", "description", "agentPreference", "name", "email", "phone", "uploadedDocuments", "investor_type", "investment_goal", "area_city", "property_categories", "property_types", "market_segments", "ticket_min", "ticket_max", "budget_visibility", "target_yield", "risk_preference", "holding_period", "exit_strategy", "financing_method", "accepts_direct_owner", "accepts_developer", "accepts_agent", "private_description", "category", "offering_type", "rooms", "bedrooms", "total_floors", "parking_spaces", "furnishing_type", "project_status", "amenities"]),
  agent: new Set(["name", "email", "phone", "company", "licenceNumber", "country", "representation", "authority", "uploadedDocuments"]),
  newsletter: new Set(["email", "name", "segment"])
};

const forbiddenStatusFields = new Set([
  "approvalStatus",
  "approval_status",
  "publicStatus",
  "public_status",
  "verificationStatus",
  "verification_status",
  "verificationLevel",
  "verification_level",
  "verified",
  "verifiedAt",
  "verified_at",
  "verifiedBy",
  "verified_by",
  "adminStatus",
  "admin_status",
  "isAdmin",
  "roleOverride",
  "userId",
  "user_id",
  "ownerUserId",
  "owner_user_id"
]);

export const sanitizeSubmissionPayload = (type: SubmissionType, data: Record<string, unknown>) => {
  const allowed = allowedFields[type];
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (forbiddenStatusFields.has(key)) continue;
    if (!allowed.has(key)) continue;
    clean[key] = value;
  }

  return clean;
};
