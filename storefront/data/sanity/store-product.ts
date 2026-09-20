import { sanityFetch } from "./index";
import { ALL_STORE_PRODUCTS_QUERY, STORE_PRODUCT_QUERY } from "./queries";
import type { Image, Money, Product, ProductVariant } from "../../shopify/types";

/**
 * Builds the storefront `Product` shape from the product documents that
 * Sanity Connect keeps in sync with Shopify. This lets the product page render
 * with only Sanity credentials, e.g. on a fresh machine that has no Shopify
 * Storefront token yet. Live Shopify data is still used whenever it is configured.
 *
 * Sanity does not store a currency, so it comes from NEXT_PUBLIC_STORE_CURRENCY.
 */
const CURRENCY = process.env.NEXT_PUBLIC_STORE_CURRENCY || "AUD";

// 4:5 transparent placeholder for products with no image, so next/image never gets an empty src.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="800" height="1000" fill="#f1f1f1"/></svg>',
  );

type StoreVariant = {
  store: {
    title?: string | null;
    gid?: string | null;
    price?: number | null;
    option1?: string | null;
    option2?: string | null;
    option3?: string | null;
    previewImageUrl?: string | null;
    inventory?: { isAvailable?: boolean | null } | null;
    status?: string | null;
    isDeleted?: boolean | null;
  } | null;
} | null;

type StoreProduct = {
  store: {
    title?: string | null;
    gid?: string | null;
    handle?: string | null;
    descriptionHtml?: string | null;
    priceRange?: { minVariantPrice?: number | null; maxVariantPrice?: number | null } | null;
    previewImageUrl?: string | null;
    options?: { name?: string | null; values?: string[] | null }[] | null;
    tags?: string | null;
    updatedAt?: string | null;
  } | null;
  variants?: StoreVariant[] | null;
} | null;

const money = (amount: number | null | undefined): Money => ({
  amount: String(amount ?? 0),
  currencyCode: CURRENCY,
});

const toImage = (url: string | null | undefined, altText: string): Image => ({
  url: url || PLACEHOLDER_IMAGE,
  altText,
  width: 800,
  height: 1000,
});

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** True when the Shopify Storefront API can be used (real values, not empty or Vercel's "[SENSITIVE]" placeholders). */
export function isShopifyConfigured() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  return (
    !!domain &&
    !!token &&
    !/[[\]]/.test(domain) &&
    !/[[\]]/.test(token)
  );
}

function toProduct(doc: StoreProduct): Product | undefined {
  const store = doc?.store;
  if (!store?.gid || !store.handle) return undefined;

  const title = store.title ?? "";
  const options = (store.options ?? []).filter((o) => o?.name);
  const featuredImage = toImage(store.previewImageUrl, title);

  const variants: ProductVariant[] = (doc?.variants ?? [])
    .filter((v): v is NonNullable<StoreVariant> => !!v?.store?.gid)
    .filter((v) => v.store!.status !== "archived" && !v.store!.isDeleted)
    .map((v) => {
      const s = v.store!;
      const values = [s.option1, s.option2, s.option3];
      return {
        id: s.gid!,
        title: s.title ?? "",
        availableForSale: s.inventory?.isAvailable ?? true,
        image: toImage(s.previewImageUrl ?? store.previewImageUrl, title),
        selectedOptions: options
          .map((o, i) => ({ name: o.name!, value: values[i] ?? "" }))
          .filter((o) => o.value),
        price: money(s.price),
      };
    });

  const descriptionHtml = store.descriptionHtml ?? "";
  const description = stripHtml(descriptionHtml);

  return {
    id: store.gid,
    handle: store.handle,
    availableForSale: variants.some((v) => v.availableForSale),
    title,
    description,
    descriptionHtml,
    options: options.map((o) => ({
      id: o.name!,
      name: o.name!,
      values: o.values ?? [],
    })),
    priceRange: {
      minVariantPrice: money(store.priceRange?.minVariantPrice),
      maxVariantPrice: money(store.priceRange?.maxVariantPrice),
    },
    variants,
    featuredImage,
    images: [featuredImage],
    seo: { title, description },
    tags: store.tags ? store.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    updatedAt: store.updatedAt ?? "",
  };
}

export async function getStoreProduct(handle: string): Promise<Product | undefined> {
  const { data } = await sanityFetch({
    query: STORE_PRODUCT_QUERY,
    params: { slug: handle },
    stega: false,
  });
  return toProduct(data as StoreProduct);
}

export async function getStoreProducts(): Promise<Product[]> {
  const { data } = await sanityFetch({
    query: ALL_STORE_PRODUCTS_QUERY,
    stega: false,
  });
  return ((data ?? []) as StoreProduct[])
    .map(toProduct)
    .filter((p): p is Product => !!p);
}
