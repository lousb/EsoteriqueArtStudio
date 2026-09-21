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
import { getProduct, getProducts, getProductRecommendations } from "../../../data/shopify";
import { getStoreProduct, getStoreProducts, isShopifyConfigured } from "../../../data/sanity/store-product";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import s from "./page.module.css";
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
  const ogImage = resolveOpenGraphImage(product?.store?.previewImageUrl);

  return {
    title: product?.store?.title,
    description: product?.store?.descriptionHtml,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
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

console.log("relatedProducts", relatedProducts.length);

  const shipping = await getShipping();

  // Cast keeps this compiling until types are regenerated from the new schema.
  const extra = productPage as unknown as {
    colourway?: string | null;
    productType?: { title?: string | null; excerpt?: string | null } | null;
  } | null;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  return (
    <Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
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
                excerpt={extra?.productType?.excerpt}
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
