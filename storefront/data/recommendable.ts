import { getStoreProducts } from "./sanity/store-product";
import type { Product } from "../shopify/types";

/**
 * Handles of products that are Active in Shopify, read from the product data
 * Sanity Connect syncs (drafts and archived products are not in it). Returns
 * null if it cannot be read, in which case no extra filtering is applied.
 */
export async function getActiveHandles(): Promise<Set<string> | null> {
  try {
    const products = await getStoreProducts();
    return products.length ? new Set(products.map((p) => p.handle)) : null;
  } catch {
    return null;
  }
}

/**
 * Products that are safe to recommend (related products, cart suggestions):
 * never a draft or archived product, and never one with no photo.
 */
export function filterRecommendable(
  products: Product[],
  active: Set<string> | null,
): Product[] {
  return products.filter(
    (p) =>
      (!active || active.has(p.handle)) &&
      !!p.featuredImage?.url &&
      !p.featuredImage.url.startsWith("data:"),
  );
}
