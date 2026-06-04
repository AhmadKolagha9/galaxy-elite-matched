const sensitiveKeys = new Set([
  "id",
  "userId",
  "user_id",
  "contactName",
  "contact_name",
  "contactEmail",
  "contact_email",
  "contactPhone",
  "contact_phone",
  "email",
  "phone",
  "whatsapp",
  "name",
  "budget",
  "budget_label",
  "priceRange",
  "price_label",
  "ticketSize",
  "uploadedDocuments",
  "uploaded_documents",
  "storagePath",
  "storage_path",
  "filePath",
  "file_path",
  "documentPath",
  "document_path",
  "unit",
  "unitNumber",
  "unit_number",
  "apartmentNumber",
  "apartment_number",
  "villaNumber",
  "villa_number",
  "plotNumber",
  "plot_number",
  "exactAddress",
  "exact_address",
  "internalNotes",
  "internal_notes"
]);

const redactText = (value: string) =>
  value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted]")
    .replace(/(?:\+?\d[\s().-]*){8,}\d/g, "[redacted]")
    .replace(/\b(?:unit|apartment|villa|suite|flat|plot)\s*[#:\-]?[\w-]+/gi, "[redacted]")
    .replace(/(?:private-documents|documents|pending)\/[\w./-]+/gi, "[redacted]");

export const sanitizeOutput = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeOutput);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((record, [key, child]) => {
      if (sensitiveKeys.has(key)) return record;
      record[key] = sanitizeOutput(child);
      return record;
    }, {});
  }
  if (typeof value === "string") return redactText(value);
  return value;
};

export const sanitizePublicRecords = <T>(records: T[]) => records.map((record) => sanitizeOutput(record));
