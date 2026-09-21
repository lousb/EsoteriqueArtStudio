import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { PageBuilder } from "../../../components/page-builder";
import { sanityFetch } from "../../../data/sanity";

import {
  ALL_PRODUCT_PAGES_SLUGS,
  PRODUCT_METADATA_QUERY,
  PRODUCT_QUERY,
} from "../../../data/sanity/queries";
import { getCollectionProducts, getProduct, getProducts, getProductRecommendations } from "../../../data/shopify";
import { getStoreProduct, getStoreProducts, isShopifyConfigured } from "../../../data/sanity/store-product";
import { directOgImage, toPlainText } from "../../../data/seo";
import { breadcrumbJsonLd, productJsonLd } from "../../../data/seo/json-ld";
import s from "./page.module.css";

const EYEWEAR_EXCERPT = "Premium eyewear. Fits most head shapes.";
import { ProductProvider } from "./product-context";
import { Gallery } from "./gallery";
import { ProductDetails } from "./product-details";
import { getShipping } from "../../../data/shipping";
import { filterRecommendable, getActiveHandles } from "../../../data/recommendable";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_PRODUCT_PAGES_SLUGS,
    perspective: "published",
    stega: false,
  });
  return data;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_METADATA_QUERY,
    params,
    stega: false,
  });
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = directOgImage(product?.store?.previewImageUrl, product?.store?.title);
  const description = toPlainText(product?.store?.descriptionHtml);
  const path = `/products/${params.slug}`;

  return {
    title: product?.store?.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: product?.store?.title ?? undefined,
      description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: product?.store?.title ?? undefined,
      description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  } satisfies Metadata;
}

export default async function Page(props: Props) {
  const params = await props.params;

  const { tags, data: productPage } = await sanityFetch({
    query: PRODUCT_QUERY,
    params,
  });

  // Use live Shopify data when the Storefront API is configured; otherwise fall back to
  // the product data Sanity Connect already syncs into Sanity.
  const useShopify = isShopifyConfigured();
  const product = useShopify
    ? await getProduct({ handle: params.slug, tags })
    : await getStoreProduct(params.slug);

  if (!product?.id) {
    return notFound();
  }

const allProducts = useShopify
  ? await getProducts({ sortKey: "TITLE", reverse: false, query: "" })
  : await getStoreProducts();
const activeHandles = await getActiveHandles();
const otherProducts = filterRecommendable(allProducts, activeHandles).filter(p => p.id !== product.id);
const seed = product.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
const relatedProducts = [0, 1, 2].map(i => otherProducts[(seed + i) % otherProducts.length]).filter(Boolean);


  const shipping = await getShipping();

  // Only products in the Shopify "Eyewear" collection get the eyewear line under
  // the price. Everything else (card holders and so on) shows nothing there.
  let inEyewear = false;
  if (useShopify) {
    try {
      const eyewear = await getCollectionProducts({ collection: "eyewear" });
      inEyewear = eyewear.some((p) => p.handle === product.handle);
    } catch {
      inEyewear = false;
    }
  }

  // Cast keeps this compiling until types are regenerated from the new schema.
  const extra = productPage as unknown as {
    colourway?: string | null;
    productType?: { title?: string | null; excerpt?: string | null } | null;
  } | null;

  const productLd = productJsonLd({
    name: product.title,
    description: product.description,
    images: (product.images?.length ? product.images.map((i) => i.url) : [product.featuredImage.url]),
    handle: product.handle,
    availableForSale: product.availableForSale,
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
    minPrice: product.priceRange.minVariantPrice.amount,
    maxPrice: product.priceRange.maxVariantPrice.amount,
    offerCount: product.variants.length || 1,
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Shop", path: "/products" },
    { name: product.title, path: `/products/${product.handle}` },
  ]);

  return (
    <Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productLd, breadcrumbLd]),
        }}
      />
      <ProductProvider>
        <div>
          <div className={s.page} data-product-page>
            <div className={s.gallery}>
              <Gallery
                variants={product.variants}
                featuredImage={product.featuredImage}
                sanityGallery={productPage?.gallery as any ?? []}
              />
            </div>
            <div className={s.productDetails}>
              <ProductDetails
                product={product}
                colourway={extra?.colourway}
                excerpt={inEyewear ? EYEWEAR_EXCERPT : null}
                relatedProducts={relatedProducts}
                shipping={shipping}
              />
            </div>
          </div>
          {!!productPage?.pageBuilder?.length && (
            <PageBuilder page={productPage} />
          )}
        </div>
      </ProductProvider>
    </Suspense>
  );
}
