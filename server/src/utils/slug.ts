import crypto from "crypto";

export function generateSlug(base: string): string {
  const normalized = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${normalized || "item"}-${suffix}`;
}
