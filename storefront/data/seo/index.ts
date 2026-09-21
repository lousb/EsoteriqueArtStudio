/**
 * Shared SEO constants and small helpers used across every route's
 * `generateMetadata` and structured data. Keeping these in one place means
 * canonical URLs, the site name and the meta-description rules stay
 * consistent everywhere instead of drifting page by page.
 */

// Fallback used whenever Sanity `settings.metadataBase` isn't set. Keep this
// in sync with the domain Vercel serves as canonical (apex esoterique.com.au
// redirects here).
export const SITE_URL = "https://www.esoterique.com.au";

export const SITE_NAME = "Esoterique Art Studio";

export const DEFAULT_DESCRIPTION =
  "Esoterique Art Studio is a contemporary collection of finest accessories including eyewear, jewellery and leather goods. Designed in the Innerwest of Sydney.";

/** Builds an absolute URL from a site-root-relative path, e.g. "/products/foo". */
export function absoluteUrl(path: string, base: string = SITE_URL): string {
  return new URL(path, base).toString();
}

/**
 * Strips HTML tags and collapses whitespace so CMS rich text can safely be
 * used as a plain-text meta description, then truncates it to a search-
 * engine-friendly length without cutting a word in half.
 */
export function toPlainText(html: string | null | undefined, maxLength = 155): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}

/**
 * A Vercel preview/branch deployment (or Sanity draft mode) should never be
 * indexed. Production is the only environment that gets a "follow, index"
 * robots directive by default.
 */
export function isNonProductionDeployment(): boolean {
  return Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";
}

/**
 * `resolveOpenGraphImage` (sanity/utils.ts) only understands Sanity image
 * references (`{ asset: { _ref } }`). Product and collection previews synced
 * from Shopify by Sanity Connect are plain CDN URL strings instead, so they
 * need building into an OG/Twitter image object directly.
 */
export function directOgImage(
  url: string | null | undefined,
  alt?: string | null,
): { url: string; alt?: string } | undefined {
  if (!url) return undefined;
  return { url, ...(alt ? { alt } : {}) };
}
