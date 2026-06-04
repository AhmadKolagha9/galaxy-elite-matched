export const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const asOptionalString = (value: unknown) => {
  const text = asString(value);
  return text || undefined;
};

export const asBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
};

export const asDateOrNull = (value: unknown) => {
  const text = asString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : text;
};

export const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const text = asString(value);
  return text ? [text] : [];
};
