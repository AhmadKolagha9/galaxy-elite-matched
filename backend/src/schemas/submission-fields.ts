import { z } from "zod";

export const availabilityUserRoles = [
  "Direct owner",
  "Direct landlord",
  "Developer",
  "Licensed agent with authority",
  "Property manager with authority",
  "Representative with written mandate"
] as const;

export const interestUserRoles = [
  "Buyer",
  "Investor",
  "Developer",
  "agent",
  "Property manager",
  "Corporate client",
  "Admin"
] as const;

export const availabilityTypes = [
  "May rent privately",
  "Upcoming vacancy",
  "May sell privately",
  "Developer inventory",
  "Land opportunity",
  "Commercial opportunity",
  "Verified listing request",
  "Private matching only"
] as const;

export const listingIntents = [
  "Keep private - match only",
  "Request verified private listing",
  "Request public listing after compliance approval",
  "Deal room reveal only"
] as const;

export const marketSegments = [
  "Residential",
  "Commercial",
  "Off-plan",
  "Secondary",
  "Land",
  "Industrial",
  "Hospitality",
  "Investment",
  "Special purpose",
  "Other"
] as const;

export const propertyTypes = [
  "Apartment / flat",
  "Studio apartment",
  "Serviced apartment",
  "Villa",
  "Townhouse",
  "Duplex",
  "Penthouse",
  "Mansion / luxury home",
  "Residential building",
  "Whole building / bulk units",
  "Land / development plot",
  "Residential land",
  "Commercial land",
  "Agricultural land",
  "Industrial land",
  "Mixed-use land",
  "Office",
  "Retail shop",
  "Showroom",
  "Warehouse",
  "Industrial unit",
  "Labour camp / staff accommodation",
  "Camp",
  "Commercial building",
  "Hotel / hospitality",
  "Restaurant / F&B space",
  "Clinic / medical space",
  "Farmhouse / rural property",
  "Short-term rental opportunity",
  "Off-plan unit",
  "New development unit",
  "Branded residence",
  "Investment property",
  "Other / bespoke requirement"
] as const;

export const privacyLevels = [
  "Admin only",
  "Matched users only",
  "Deal room only",
  "Public advertising only with permit"
] as const;

export const authorityDeclarations = [
  "I am the direct owner/landlord",
  "I have written authority",
  "I represent a developer",
  "I am a licensed agent and will upload proof later"
] as const;

export const categories = ["residential", "commercial"] as const;
export const offeringTypes = ["rent", "sell"] as const;
export const furnishingTypes = ["unfurnished", "semi-furnished", "Furnished"] as const;
export const projectStatuses = ["resale", "ready to move", "on plan", "under construction"] as const;
export const preferredPaymentMethods = ["Cash", "Crypto", "Installments"] as const;

export const amenities = [
  "Balcony",
  "Built-in wardrobes",
  "central A/C",
  "covered Parking",
  "private Gym",
  "Private jacuzzi",
  "kitchen appliances",
  "Maids room",
  "pets allowed",
  "private garden",
  "private pool",
  "study",
  "view of water",
  "security",
  "concierge",
  "shared spa",
  "shared Gym",
  "Maid service",
  "walk-in closet",
  "view of landmark",
  "children's play Area",
  "lobby in building",
  "childer;s pool",
  "vastu-copliant"
] as const;

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().trim().max(max).optional()
  );

const numericInput = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return Number.NaN;
    return Number(trimmed);
  }

  return value;
};

const decimalMax = (precision: number, scale: number) => Number(`${"9".repeat(precision - scale)}.${"9".repeat(scale)}`);

const decimalField = (precision: number, scale: number) => {
  const multiplier = 10 ** scale;
  return z.preprocess(
    numericInput,
    z
      .number()
      .finite()
      .min(0)
      .max(decimalMax(precision, scale))
      .refine((value) => Math.abs(value * multiplier - Math.round(value * multiplier)) < 1e-8, {
        message: `Must have at most ${scale} decimal places.`
      })
  );
};

const intField = z.preprocess(numericInput, z.number().int().min(0).max(2147483647));

const verificationFileSchema = z.object({
  document_type: optionalText(120),
  storage_path: optionalText(500),
  file_path: optionalText(500),
  url: optionalText(500),
  original_filename: optionalText(255),
  mime_type: optionalText(120),
  file_size: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return numericInput(value);
  }, z.number().int().min(1).max(10 * 1024 * 1024).optional())
}).passthrough();

const optionalVerificationFiles = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  return value;
}, z.array(verificationFileSchema).max(20).optional());

const dateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must use YYYY-MM-DD format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Must be a valid calendar date.");

const amenitiesField = z
  .preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed) as unknown;
      } catch {
        return value;
      }
    }

    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
  }, z.array(z.enum(amenities)).min(1).max(64))
  .transform((values) => Array.from(new Set(values)));

const commonSubmissionFields = {
  title: requiredText(255),
  availability_type: z.enum(availabilityTypes),
  listing_intent: z.enum(listingIntents),
  market_segment: z.enum(marketSegments),
  property_type: z.enum(propertyTypes),
  country: requiredText(100),
  area_city: requiredText(100),
  project_name: optionalText(255),
  building_name: optionalText(255),
  size_sqft: decimalField(12, 2),
  price_min: decimalField(15, 2),
  price_max: decimalField(15, 2),
  availability_date: dateField,
  privacy_level: z.enum(privacyLevels),
  private_description: requiredText(65535),
  category: z.enum(categories),
  offering_type: z.enum(offeringTypes),
  rooms: intField,
  bedrooms: intField,
  total_floors: intField,
  parking_spaces: intField,
  furnishing_type: z.enum(furnishingTypes),
  project_status: z.enum(projectStatuses),
  amenities: amenitiesField,
  preferred_payment_method: z.enum(preferredPaymentMethods)
} as const;

const withPriceBoundary = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  schema.superRefine((data, context) => {
    const submission = data as { price_min: number; price_max: number };
    if (submission.price_max < submission.price_min) {
      context.addIssue({
        code: "custom",
        path: ["price_max"],
        message: "price_max must be greater than or equal to price_min."
      });
    }
  });

export const privateAvailabilitySchema = withPriceBoundary(
  z.object({
    ...commonSubmissionFields,
    user_role: z.enum(availabilityUserRoles),
    authority_declaration: z.enum(authorityDeclarations),
    verification_documents: optionalVerificationFiles,
    uploadedDocuments: optionalVerificationFiles
  })
);

export const interestSignalSchema = withPriceBoundary(
  z.object({
    ...commonSubmissionFields,
    user_role: z.enum(interestUserRoles)
  })
);

export type PrivateAvailabilityPayload = z.infer<typeof privateAvailabilitySchema>;
export type InterestSignalPayload = z.infer<typeof interestSignalSchema>;
