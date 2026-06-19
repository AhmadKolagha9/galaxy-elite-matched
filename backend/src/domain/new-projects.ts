export const newProjectStatuses = ["draft", "published", "archived"] as const;
export type NewProjectStatus = (typeof newProjectStatuses)[number];

export type NewProjectRow = {
  id: string;
  project_name: string;
  start_price: number | string | null;
  end_price: number | string | null;
  images: unknown;
  video: string | null;
  description: string;
  user_id: string | null;
  map_location: string | null;
  phone: string | null;
  address: string | null;
  status: NewProjectStatus;
  city_id: string | null;
  country_id: string | null;
  developer_name: string | null;
  reference: string;
  created_at: string | Date;
  updated_at: string | Date;
};

export type NewProjectMutation = {
  projectName?: string;
  startPrice?: number | null;
  endPrice?: number | null;
  images?: string[];
  video?: string | null;
  description?: string;
  mapLocation?: string | null;
  phone?: string | null;
  address?: string | null;
  cityId?: string | null;
  countryId?: string | null;
  developerName?: string | null;
  status?: NewProjectStatus;
};

export type PublicNewProject = {
  id: string;
  reference: string;
  projectName: string;
  developerName: string | null;
  startPrice: number | null;
  endPrice: number | null;
  images: string[];
  video: string | null;
  description: string;
  cityId: string | null;
  countryId: string | null;
  publicAddressLabel: string | null;
  publicMapLocation: string | null;
  status: "published";
  createdAt: string;
  updatedAt: string;
};

export type AdminNewProject = Omit<PublicNewProject, "status"> & {
  userId: string | null;
  phone: string | null;
  address: string | null;
  mapLocation: string | null;
  status: NewProjectStatus;
};

export type NewProjectListFilters = {
  status?: NewProjectStatus;
  countryId?: string;
  cityId?: string;
  developerName?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
};

const numericOrNull = (value: number | string | null) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const dateString = (value: string | Date) => new Date(value).toISOString();

const parseImages = (value: unknown): string[] => {
  const parsed = typeof value === "string" ? JSON.parse(value || "[]") : value;
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => String(item ?? "").trim()).filter(Boolean);
};

const publicAddressLabel = (row: NewProjectRow) => {
  const parts = [row.city_id, row.country_id].map((item) => item?.trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

export const toPublicNewProject = (row: NewProjectRow): PublicNewProject => ({
  id: row.id,
  reference: row.reference,
  projectName: row.project_name,
  developerName: row.developer_name,
  startPrice: numericOrNull(row.start_price),
  endPrice: numericOrNull(row.end_price),
  images: parseImages(row.images),
  video: row.video,
  description: row.description,
  cityId: row.city_id,
  countryId: row.country_id,
  publicAddressLabel: publicAddressLabel(row),
  publicMapLocation: null,
  status: "published",
  createdAt: dateString(row.created_at),
  updatedAt: dateString(row.updated_at)
});

export const toAdminNewProject = (row: NewProjectRow): AdminNewProject => ({
  ...toPublicNewProject(row),
  userId: row.user_id,
  phone: row.phone,
  address: row.address,
  mapLocation: row.map_location,
  status: row.status
});
