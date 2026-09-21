import { getProducts } from "../shopify";
import { getStoreProducts, isShopifyConfigured } from "../sanity/store-product";
import { filterRecommendable, getActiveHandles } from "../recommendable";
import type { Product } from "../../shopify/types";

/**
 * Products offered in the cart's "add another" carousel. Heavy fields are
 * blanked because this list is sent to the browser with every page.
 */
export async function getCartSuggestions(): Promise<Product[]> {
  try {
    const all = isShopifyConfigured()
      ? await getProducts({ sortKey: "TITLE", reverse: false, query: "" })
      : await getStoreProducts();

    const active = await getActiveHandles();
    return filterRecommendable(all, active)
      .filter((p) => p.availableForSale && p.variants.length > 0)
      .map((p) => ({
        ...p,
        description: "",
        descriptionHtml: "",
        images: [],
        seo: { title: "", description: "" },
      }));
  } catch (error) {
    console.warn("[cart] could not load suggestions:", error);
    return [];
  }
}
