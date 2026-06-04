import { query, type Queryable } from "../db/pool.js";
import type { DbSubmissionRow } from "../db/rows.js";
import type { AdminSubmissionRecord, SubmissionInput, SubmissionRecord, SubmissionType } from "../domain/submissions.js";
import type { ApprovalStatus, PublicStatus, VerificationStatus } from "../domain/status.js";
import { notFound } from "../http/errors.js";
import { asBoolean, asDateOrNull, asOptionalString, toStringArray } from "../utils/strings.js";

const pendingMessage = "Submission received and pending Galaxy Elite review.";

type SubmissionTableConfig = {
  type: SubmissionType;
  table: string;
  label: string;
  approvalDefault: ApprovalStatus;
  publicDefault: PublicStatus;
  verificationDefault: VerificationStatus;
  publicSelectable: boolean;
  insertColumns: (input: SubmissionInput) => Record<string, unknown>;
};

const baseContact = (data: Record<string, unknown>, userId?: string) => ({
  user_id: userId ?? null,
  contact_name: asOptionalString(data.name) ?? null,
  contact_email: asOptionalString(data.email) ?? null,
  contact_phone: asOptionalString(data.phone) ?? null
});

const configs: Record<SubmissionType, SubmissionTableConfig> = {
  interest: {
    type: "interest",
    table: "interest_signals",
    label: "Interest Posts",
    approvalDefault: "pending_review",
    publicDefault: "hidden",
    verificationDefault: "unverified",
    publicSelectable: true,
    insertColumns: ({ data, userId }) => ({
      ...baseContact(data, userId),
      submitter_role: asOptionalString(data.role) ?? null,
      purpose: asOptionalString(data.purpose) ?? null,
      country: asOptionalString(data.country) ?? null,
      area_city: asOptionalString(data.cityArea) ?? asOptionalString(data.area) ?? null,
      project_name: asOptionalString(data.projectName) ?? null,
      property_type: asOptionalString(data.propertyType) ?? null,
      market_segment: asOptionalString(data.marketSegment) ?? null,
      size_label: asOptionalString(data.size) ?? null,
      budget_label: asOptionalString(data.budget) ?? null,
      budget_visibility: asOptionalString(data.budgetVisibility) ?? null,
      timeline: asOptionalString(data.timeline) ?? null,
      description: asOptionalString(data.description) ?? null,
      accepts_direct_owner: String(data.agentPreference ?? "").toLowerCase().includes("owner"),
      accepts_landlord: String(data.agentPreference ?? "").toLowerCase().includes("landlord"),
      accepts_developer: String(data.agentPreference ?? "").toLowerCase().includes("developer"),
      accepts_agent: !String(data.agentPreference ?? "").toLowerCase().includes("direct owner only"),
      preferred_payment_method: asOptionalString(data.preferred_payment_method) ?? null
    })
  },
  availability: {
    type: "availability",
    table: "private_availability",
    label: "Private Availability",
    approvalDefault: "pending_review",
    publicDefault: "hidden",
    verificationDefault: "unverified",
    publicSelectable: false,
    insertColumns: ({ data, userId }) => ({
      ...baseContact(data, userId),
      submitter_role: asOptionalString(data.role) ?? null,
      is_representative: String(data.role ?? data.authority ?? "").toLowerCase().includes("representative"),
      represented_party_type: asOptionalString(data.authority) ?? null,
      country: asOptionalString(data.country) ?? null,
      area_city: asOptionalString(data.cityArea) ?? null,
      project_name: asOptionalString(data.projectName) ?? null,
      building_name: asOptionalString(data.buildingName) ?? null,
      property_type: asOptionalString(data.propertyType) ?? null,
      market_segment: asOptionalString(data.marketSegment) ?? null,
      purpose: asOptionalString(data.listingIntent) ?? asOptionalString(data.availabilityType) ?? null,
      size_label: asOptionalString(data.size) ?? null,
      price_label: asOptionalString(data.priceRange) ?? null,
      availability_date: asDateOrNull(data.availabilityDate),
      privacy_level: asOptionalString(data.privacyLevel) ?? null,
      authority_status: asOptionalString(data.authority) ?? null,
      description: asOptionalString(data.description) ?? null,
      preferred_payment_method: asOptionalString(data.preferred_payment_method) ?? null,
      has_verification_files_attached: hasAvailabilityVerificationFiles(data)
    })
  },
  verifiedListing: {
    type: "verifiedListing",
    table: "verified_listing_requests",
    label: "Verified Listing Requests",
    approvalDefault: "pending_review",
    publicDefault: "hidden",
    verificationDefault: "documents_submitted",
    publicSelectable: true,
    insertColumns: ({ data, userId, uploadedDocuments }) => ({
      ...baseContact(data, userId),
      submitter_role: asOptionalString(data.submitterRole) ?? null,
      country: asOptionalString(data.country) ?? null,
      area_city: asOptionalString(data.cityArea) ?? null,
      project_name: asOptionalString(data.projectName) ?? null,
      building_name: asOptionalString(data.buildingName) ?? null,
      property_type: asOptionalString(data.propertyType) ?? null,
      market_segment: asOptionalString(data.marketSegment) ?? null,
      purpose: asOptionalString(data.purpose) ?? asOptionalString(data.listingIntent) ?? null,
      size_label: asOptionalString(data.size) ?? null,
      price_label: asOptionalString(data.priceRange) ?? null,
      availability_date: asDateOrNull(data.availabilityDate),
      ownership_status: asOptionalString(data.ownershipStatus) ?? null,
      permit_status: asOptionalString(data.permitStatus) ?? null,
      privacy_level: asOptionalString(data.privacyLevel) ?? null,
      description: asOptionalString(data.description) ?? null,
      uploaded_documents: JSON.stringify(uploadedDocuments ?? [])
    })
  },
  investor: {
    type: "investor",
    table: "investor_posts",
    label: "Investor Posts",
    approvalDefault: "pending_review",
    publicDefault: "hidden",
    verificationDefault: "unverified",
    publicSelectable: true,
    insertColumns: ({ data, userId }) => ({
      ...baseContact(data, userId),
      investor_type: asOptionalString(data.investorProfile) ?? null,
      investment_goal: asOptionalString(data.investorGoal) ?? null,
      countries: JSON.stringify(toStringArray(data.countries ?? data.country)),
      area_city: asOptionalString(data.cityArea) ?? null,
      property_types: JSON.stringify(toStringArray(data.propertyTypes ?? data.propertyType)),
      market_segments: JSON.stringify(toStringArray(data.marketSegments ?? data.marketSegment)),
      ticket_label: asOptionalString(data.ticketSize) ?? null,
      budget_visibility: asOptionalString(data.budgetVisibility) ?? null,
      target_yield: asOptionalString(data.targetYield) ?? null,
      risk_preference: asOptionalString(data.riskPreference) ?? null,
      timeline: asOptionalString(data.timeline) ?? null,
      description: asOptionalString(data.description) ?? null,
      accepts_direct_owner: String(data.agentPreference ?? "").toLowerCase().includes("owner"),
      accepts_developer: String(data.agentPreference ?? "").toLowerCase().includes("developer"),
      accepts_agent: !String(data.agentPreference ?? "").toLowerCase().includes("direct owner only")
    })
  },
  agent: {
    type: "agent",
    table: "agent_profiles",
    label: "Agent Registrations",
    approvalDefault: "pending_review",
    publicDefault: "hidden",
    verificationDefault: "unverified",
    publicSelectable: false,
    insertColumns: ({ data, userId }) => ({
      user_id: userId ?? null,
      full_name: asOptionalString(data.name) ?? null,
      email: asOptionalString(data.email) ?? null,
      phone: asOptionalString(data.phone) ?? null,
      company_name: asOptionalString(data.company) ?? null,
      country: asOptionalString(data.country) ?? null,
      licence_number: asOptionalString(data.licenceNumber) ?? null,
      represents: asOptionalString(data.representation) ?? null,
      authority_status: asOptionalString(data.authority) ?? null
    })
  },
  newsletter: {
    type: "newsletter",
    table: "newsletter_subscribers",
    label: "Newsletter",
    approvalDefault: "approved",
    publicDefault: "hidden",
    verificationDefault: "unverified",
    publicSelectable: false,
    insertColumns: ({ data }) => ({
      email: asOptionalString(data.email) ?? null,
      full_name: asOptionalString(data.name) ?? null,
      segment: asOptionalString(data.segment) ?? null,
      status: "subscribed"
    })
  }
};

const typeEntries = Object.entries(configs) as Array<[SubmissionType, SubmissionTableConfig]>;

const parseJsonField = (value: unknown) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const hasVerificationFileLocation = (document: unknown) => {
  if (!document || typeof document !== "object" || Array.isArray(document)) return false;
  const values = document as Record<string, unknown>;
  return [values.storage_path, values.file_path, values.url, values.original_filename].some(
    (value) => typeof value === "string" && value.trim().length > 0
  );
};

const hasAvailabilityVerificationFiles = (data: Record<string, unknown>) => {
  const documents = Array.isArray(data.verification_documents) ? data.verification_documents : data.uploadedDocuments;
  return Array.isArray(documents) && documents.some(hasVerificationFileLocation);
};

const publicRowData = (row: DbSubmissionRow) => {
  const formData = parseJsonField(row.form_data);
  if (formData && typeof formData === "object") return formData as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !["approval_status", "public_status", "verification_status", "created_at", "updated_at"].includes(key))
      .map(([key, value]) => [key, parseJsonField(value)])
  );
};

const insertRow = async (client: Queryable, config: SubmissionTableConfig, input: SubmissionInput) => {
  const standardColumns = config.type === "newsletter"
    ? {}
    : {
        approval_status: config.approvalDefault,
        public_status: config.publicDefault,
        verification_status: config.verificationDefault
      };
  const values: Record<string, unknown> = {
    ...config.insertColumns(input),
    ...standardColumns,
    form_data: JSON.stringify(input.data)
  };
  const columns = Object.keys(values).filter((key) => values[key] !== undefined);
  const placeholders = columns.map(() => "?");
  const result = await client.query<DbSubmissionRow>(
    `insert into ${config.table} (${columns.join(", ")}) values (${placeholders.join(", ")}) returning *`,
    columns.map((column) => values[column])
  );
  return result.rows[0];
};

const toSubmissionRecord = (type: SubmissionType, row: DbSubmissionRow): SubmissionRecord => ({
  id: row.id,
  type,
  approvalStatus: (row.approval_status ?? (type === "newsletter" ? "approved" : "pending_review")) as ApprovalStatus,
  publicStatus: (row.public_status ?? "hidden") as PublicStatus,
  verificationStatus: (row.verification_status ?? "unverified") as VerificationStatus,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  data: publicRowData(row)
});

const titleStatus = (approvalStatus: string, publicStatus: string) => {
  if (approvalStatus === "approved" && publicStatus !== "hidden") return publicStatus[0]?.toUpperCase() + publicStatus.slice(1);
  if (approvalStatus === "documents_requested") return "Documents Requested";
  if (approvalStatus === "under_verification") return "Under Verification";
  if (approvalStatus === "compliance_hold") return "Compliance Hold";
  if (approvalStatus === "rejected") return "Rejected";
  if (approvalStatus === "archived") return "Archived";
  if (approvalStatus === "approved") return "Approved Private";
  return "Pending Review";
};

const verificationLabel = (verificationStatus: string) => {
  const map: Record<string, string> = {
    unverified: "Not started",
    basic_checked: "Identity received",
    documents_submitted: "Ownership / authority received",
    under_review: "Compliance review",
    verified: "Verified listing approved",
    failed: "Rejected / insufficient documents",
    expired: "Rejected / insufficient documents"
  };
  return map[verificationStatus] ?? "Not started";
};

const publicLabel = (publicStatus: string) => publicStatus[0]?.toUpperCase() + publicStatus.slice(1);

const adminApprovalLabel = (approvalStatus: string) => {
  const map: Record<string, string> = {
    pending_review: "pending",
    documents_requested: "request_documents",
    under_verification: "pending",
    compliance_hold: "compliance_hold",
    approved: "approved",
    rejected: "rejected",
    archived: "archived"
  };
  return map[approvalStatus] ?? approvalStatus;
};

const toAdminRecord = (type: SubmissionType, row: DbSubmissionRow): AdminSubmissionRecord => {
  const approvalStatus = String(row.approval_status ?? (type === "newsletter" ? "approved" : "pending_review"));
  const publicStatus = String(row.public_status ?? "hidden");
  const verificationStatus = String(row.verification_status ?? "unverified");
  const formData = publicRowData(row);
  const uploadedDocuments = type === "verifiedListing" ? { uploadedDocuments: row.uploaded_documents ?? formData.uploadedDocuments ?? [] } : {};

  return {
    ...formData,
    ...uploadedDocuments,
    id: row.id,
    submittedAt: new Date(row.created_at).toISOString(),
    submissionType: type,
    approvalStatus: adminApprovalLabel(approvalStatus),
    publicStatus: publicLabel(publicStatus),
    status: titleStatus(approvalStatus, publicStatus),
    verificationLevel: verificationLabel(verificationStatus),
    approvalStatusRaw: approvalStatus as ApprovalStatus,
    publicStatusRaw: publicStatus as PublicStatus,
    verificationStatusRaw: verificationStatus as VerificationStatus
  };
};

export const createSubmission = async (client: Queryable, input: SubmissionInput) => {
  const row = await insertRow(client, configs[input.type], input);
  return toSubmissionRecord(input.type, row);
};

export const createDocumentRowsForUploadSummaries = async (client: Queryable, record: SubmissionRecord, input: SubmissionInput) => {
  if (!input.uploadedDocuments?.length) return;
  for (const doc of input.uploadedDocuments) {
    await client.query(
      `insert into document_uploads (owner_user_id, related_object_type, related_object_id, document_type, storage_bucket, storage_path, original_filename, mime_type, file_size)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [input.userId ?? null, input.type, record.id, doc.field, "private-documents", `pending/${record.id}/${doc.name}`, doc.name, doc.type, doc.size]
    );
  }
};

export const listAdminCollections = async () => {
  const collections = [];
  for (const [type, config] of typeEntries) {
    const result = await query<DbSubmissionRow>(`select * from ${config.table} order by created_at desc limit 250`);
    collections.push({ key: type, label: config.label, records: result.rows.map((row) => toAdminRecord(type, row)) });
  }
  return collections;
};

export const listAdminSubmissions = async (filters: { type?: SubmissionType; approvalStatus?: string }) => {
  const entries = filters.type ? ([[filters.type, configs[filters.type]]] as Array<[SubmissionType, SubmissionTableConfig]>) : typeEntries;
  const records: AdminSubmissionRecord[] = [];
  for (const [type, config] of entries) {
    const values: unknown[] = [];
    const where = [];
    if (filters.approvalStatus) {
      values.push(filters.approvalStatus);
      where.push("approval_status = ?");
    }
    const result = await query<DbSubmissionRow>(`select * from ${config.table}${where.length ? ` where ${where.join(" and ")}` : ""} order by created_at desc limit 250`, values);
    records.push(...result.rows.map((row) => toAdminRecord(type, row)));
  }
  return records.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
};

export const getAdminSummary = async () => {
  const collections = await listAdminCollections();
  const total = collections.reduce((sum, collection) => sum + collection.records.length, 0);
  const pending = collections.reduce((sum, collection) => sum + collection.records.filter((record) => record.approvalStatusRaw === "pending_review").length, 0);
  const approved = collections.reduce((sum, collection) => sum + collection.records.filter((record) => ["approved"].includes(String(record.approvalStatusRaw)) || record.verificationStatusRaw === "verified").length, 0);
  const holds = collections.reduce((sum, collection) => sum + collection.records.filter((record) => ["documents_requested", "compliance_hold"].includes(String(record.approvalStatusRaw))).length, 0);
  return { total, pending, approved, holds, collections };
};

export const findSubmissionById = async (id: string) => {
  for (const [type, config] of typeEntries) {
    const result = await query<DbSubmissionRow>(`select * from ${config.table} where id = ? limit 1`, [id]);
    if (result.rows[0]) return { type, config, row: result.rows[0], record: toAdminRecord(type, result.rows[0]) };
  }
  throw notFound("Submission not found.");
};

export const updateSubmissionStatus = async (
  client: Queryable,
  id: string,
  patch: Partial<{ approvalStatus: ApprovalStatus; publicStatus: PublicStatus; verificationStatus: VerificationStatus }>
) => {
  const found = await findSubmissionById(id);
  const updates: string[] = [];
  const values: unknown[] = [];
  if (patch.approvalStatus) {
    values.push(patch.approvalStatus);
    updates.push("approval_status = ?");
  }
  if (patch.publicStatus) {
    values.push(patch.publicStatus);
    updates.push("public_status = ?");
  }
  if (patch.verificationStatus) {
    values.push(patch.verificationStatus);
    updates.push("verification_status = ?");
    if (patch.verificationStatus === "verified") {
      updates.push("verified_at = now()");
    }
  }
  if (!updates.length) return found.record;
  values.push(id);
  const result = await client.query<DbSubmissionRow>(
    `update ${found.config.table} set ${updates.join(", ")}, updated_at = now() where id = ? returning *`,
    values
  );
  return toAdminRecord(found.type, result.rows[0]);
};

export const listPublicRecords = async (type: SubmissionType) => {
  const config = configs[type];
  if (!config.publicSelectable) return [];
  const result = await query<DbSubmissionRow>(
    `select * from ${config.table}
     where approval_status = 'approved' and public_status in ('open','matching','matched','archived')
     order by created_at desc limit 100`
  );
  return result.rows.map((row) => toSubmissionRecord(type, row));
};

export const normalizeAdminApproval = (value: string): ApprovalStatus => {
  const map: Record<string, ApprovalStatus> = {
    pending: "pending_review",
    request_documents: "documents_requested",
    verified: "approved",
    pending_review: "pending_review",
    documents_requested: "documents_requested",
    under_verification: "under_verification",
    compliance_hold: "compliance_hold",
    approved: "approved",
    rejected: "rejected",
    archived: "archived"
  };
  return map[value] ?? "pending_review";
};

export const normalizePublicStatus = (value: string): PublicStatus => {
  const lower = value.toLowerCase();
  if (["open", "matching", "matched", "archived"].includes(lower)) return lower as PublicStatus;
  return "hidden";
};

export const normalizeVerificationStatus = (value: string, approvalStatus?: string): VerificationStatus => {
  if (approvalStatus === "verified") return "verified";
  const lower = value.toLowerCase();
  if (lower.includes("compliance")) return "under_review";
  if (lower.includes("document") || lower.includes("ownership")) return "documents_submitted";
  if (lower.includes("identity")) return "basic_checked";
  if (lower.includes("rejected")) return "failed";
  return "unverified";
};

export { pendingMessage };
