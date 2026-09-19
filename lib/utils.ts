import type { Locale, ML } from "./types";

export const uid = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Resolve a multilingual field with graceful fallback to English. */
export const L = (field: ML | undefined | null, locale: Locale): string => {
  if (!field) return "";
  return field[locale] ?? field.en ?? "";
};

export const ml = (en: string, fr: string, ar: string): ML => ({ en, fr, ar });

export const fmtPrice = (price: number, currency: string) => {
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "MAD" ? "MAD " : currency + " ";
  return `${sym}${price.toLocaleString("en-US")}`;
};

export const fmtDate = (iso: string, locale: Locale = "en") =>
  new Date(iso).toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");
