import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Link } from 'next-view-transitions'
import { Suspense } from "react";
import { PageBuilder } from "../../../components/page-builder";
import Price from "../../../components/price";
import { sanityFetch } from "../../../data/sanity";
import {
  ALL_PRODUCT_PAGES_SLUGS,
  PRODUCT_METADATA_QUERY,
  PRODUCT_QUERY,
} from "../../../data/sanity/queries";
import { getProduct, getProductRecommendations } from "../../../data/shopify";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import { Product } from "../../../shopify/types";
import { AddToCart } from "../../_cart/add-to-cart";
import s from "./page.module.css";
import { ProductProvider } from "./product-context";
import { VariantSelector } from "./variant-selector";
import { CustomPortableText } from "../../../components/custom-portable-text";
import { PortableTextBlock } from "next-sanity";
import { Gallery } from "./gallery";
import { ProductImage } from "./product-image";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_PRODUCT_PAGES_SLUGS,
    // Use the published perspective in generateStaticParams
    perspective: "published",
    stega: false,
  });
  return data;
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_METADATA_QUERY,
    params,
    // Metadata should never contain stega
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

  // get the sanity syncTags from lcapi so we can revalidate the shopify queries, more info: https://github.com/sanity-io/lcapi-examples
  const { tags, data: productPage } = await sanityFetch({
    query: PRODUCT_QUERY,
    params,
  });

  const product = await getProduct({ handle: params.slug, tags });

  if (!product?.id) {
    return notFound();
  }

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
          <div className={s.page}>
            <div className={s.gallery}>
              <Gallery
                variants={product.variants}
                featuredImage={product.featuredImage}
                sanityGallery={productPage?.gallery as any ?? []}
              />
            </div>
            <div className={s.productDetails}>
              <ProductDescription product={product} />
              
            </div>
          </div>
          {!!productPage?.pageBuilder?.length && (
            <PageBuilder page={productPage} />
          )}
        </div>
        <Suspense>
          <aside>
            <RelatedProducts tags={tags} id={product.id} />
          </aside>
        </Suspense>
      </ProductProvider>
    </Suspense>
  );
}

function ProductDescription({ product }: { product: Product }) {
  return (
    <>
      <div className={s.descriptionTop} style={{paddingTop:'60vh'}}>
        <h1>{product.title}</h1>
        {!!product.descriptionHtml && (
          <div
            dangerouslySetInnerHTML={{
              __html: product.descriptionHtml ?? "",
            }}
          />
        )}
        {!!product.variants && (
          <VariantSelector
            priceRange={product.priceRange}
            options={product.options}
            variants={product.variants}
          />
        )}
      </div>
      <div style={{ width: "300px" }}>
      <AddToCart product={product} />
      <svg xmlns="http://www.w3.org/2000/svg" width="185" height="28" viewBox="0 0 185 28" fill="none" style={{filter:'grayscale(100%)'}}>
          <rect x="0.279489" y="0.279489" width="38.5695" height="26.272" rx="3.07438" fill="white" stroke="#D9D9D9" stroke-width="0.558979"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.33076 9.98714C9.85625 10.0315 10.3817 9.72117 10.7102 9.32777C11.0331 8.92328 11.2466 8.38027 11.1919 7.82617C10.7266 7.84834 10.1518 8.13646 9.82341 8.54095C9.52235 8.89003 9.26508 9.45521 9.33076 9.98714ZM15.5819 17.1239V8.48554H18.784C20.4371 8.48554 21.5921 9.63805 21.5921 11.3225C21.5921 13.0069 20.4152 14.1705 18.7403 14.1705H16.9065V17.1239H15.5819ZM11.1863 10.0924C10.7234 10.0654 10.301 10.2333 9.95979 10.369C9.74022 10.4562 9.55428 10.5301 9.41283 10.5301C9.25409 10.5301 9.06047 10.4523 8.84309 10.3649C8.55826 10.2503 8.23261 10.1194 7.89111 10.1257C7.10835 10.1367 6.38034 10.5856 5.98075 11.3003C5.15968 12.7299 5.76727 14.8465 6.56097 16.0101C6.94961 16.5864 7.41489 17.2181 8.02795 17.1959C8.29767 17.1856 8.49168 17.1022 8.69247 17.016C8.92363 16.9167 9.16377 16.8136 9.53872 16.8136C9.90068 16.8136 10.1303 16.914 10.3508 17.0105C10.5604 17.1021 10.7616 17.1902 11.0604 17.1848C11.6954 17.1737 12.095 16.6085 12.4836 16.0323C12.903 15.4138 13.0873 14.8102 13.1153 14.7186L13.1186 14.708C13.1179 14.7073 13.1127 14.7049 13.1036 14.7007C12.9634 14.6357 11.8918 14.1391 11.8815 12.8075C11.8712 11.6897 12.7315 11.1234 12.8669 11.0343C12.8752 11.0289 12.8807 11.0252 12.8832 11.0233C12.3358 10.2032 11.4819 10.1146 11.1863 10.0924ZM24.0116 17.1903C24.8436 17.1903 25.6154 16.7637 25.9657 16.0877H25.9931V17.1239H27.2192V12.8241C27.2192 11.5774 26.234 10.7739 24.7177 10.7739C23.3109 10.7739 22.2709 11.5885 22.2326 12.7077H23.4259C23.5244 12.1758 24.0116 11.8267 24.6794 11.8267C25.4895 11.8267 25.9438 12.209 25.9438 12.9127V13.3893L24.2908 13.489C22.7526 13.5832 21.9206 14.2204 21.9206 15.3286C21.9206 16.4479 22.78 17.1903 24.0116 17.1903ZM24.3673 16.1653C23.6612 16.1653 23.2123 15.8217 23.2123 15.2954C23.2123 14.7523 23.6448 14.4365 24.4713 14.3866L25.9438 14.2924V14.78C25.9438 15.589 25.265 16.1653 24.3673 16.1653ZM31.2862 17.4619C30.7553 18.9745 30.1477 19.4732 28.8559 19.4732C28.7573 19.4732 28.4289 19.4621 28.3523 19.44V18.4038C28.4344 18.4149 28.6369 18.426 28.7409 18.426C29.3266 18.426 29.655 18.1766 29.8576 17.5283L29.978 17.146L27.7337 10.8571H29.1186L30.6786 15.9603H30.706L32.266 10.8571H33.6126L31.2862 17.4619ZM16.9064 9.61589H18.4336C19.5831 9.61589 20.24 10.2365 20.24 11.328C20.24 12.4196 19.5831 13.0457 18.4281 13.0457H16.9064V9.61589Z" fill="black"/>
          <rect x="48.7033" y="0.279489" width="38.5695" height="26.272" rx="3.07438" fill="white" stroke="#D9D9D9" stroke-width="0.558979"/>
          <path d="M73.2168 5.58984C77.4298 5.58986 80.8455 9.04474 80.8457 13.3066C80.8457 17.5687 77.43 21.0244 73.2168 21.0244C71.3279 21.0244 69.6009 20.328 68.2686 19.1777C66.9363 20.3281 65.2092 21.0244 63.3203 21.0244C59.1071 21.0244 55.6914 17.5688 55.6914 13.3066C55.6916 9.04473 59.1073 5.58984 63.3203 5.58984C65.209 5.5899 66.9363 6.28543 68.2686 7.43555C69.6008 6.28546 71.3281 5.58984 73.2168 5.58984Z" fill="#ED0006"/>
          <path d="M73.2158 5.58984C77.4289 5.58984 80.8445 9.04473 80.8447 13.3066C80.8447 17.5688 77.429 21.0244 73.2158 21.0244C71.3269 21.0244 69.5999 20.3281 68.2676 19.1777C69.907 17.7623 70.9482 15.6579 70.9482 13.3066C70.9481 10.9554 69.9071 8.85093 68.2676 7.43555C69.5998 6.28544 71.3271 5.58987 73.2158 5.58984Z" fill="#F9A000"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M68.2676 7.43555C69.9075 8.85103 70.9482 10.9559 70.9482 13.3076C70.9481 15.6589 69.907 17.7623 68.2676 19.1777C66.6285 17.7623 65.588 15.6585 65.5879 13.3076C65.5879 10.9563 66.6281 8.85102 68.2676 7.43555Z" fill="#FF5E00"/>
          <rect x="97.1271" y="0.279489" width="38.5695" height="26.272" rx="3.07438" fill="white" stroke="#D9D9D9" stroke-width="0.558979"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M108.727 18.1763H106.356L104.579 11.3949C104.494 11.083 104.315 10.8072 104.052 10.6772C103.394 10.3506 102.669 10.0906 101.879 9.95954V9.69845H105.697C106.225 9.69845 106.62 10.0906 106.686 10.5461L107.608 15.4378L109.977 9.69845H112.282L108.727 18.1763ZM113.599 18.1763H111.361L113.204 9.69845H115.443L113.599 18.1763ZM118.339 12.0471C118.405 11.5905 118.8 11.3294 119.261 11.3294C119.986 11.2638 120.775 11.3949 121.434 11.7204L121.829 9.89512C121.171 9.63404 120.446 9.50293 119.788 9.50293C117.616 9.50293 116.034 10.6772 116.034 12.307C116.034 13.5469 117.154 14.1979 117.945 14.5901C118.8 14.9812 119.13 15.2422 119.064 15.6333C119.064 16.2199 118.405 16.481 117.747 16.481C116.957 16.481 116.166 16.2855 115.443 15.9588L115.047 17.7853C115.838 18.1108 116.693 18.2419 117.484 18.2419C119.92 18.3063 121.434 17.1331 121.434 15.3722C121.434 13.1547 118.339 13.0247 118.339 12.0471ZM129.269 18.1763L127.491 9.69845H125.582C125.187 9.69845 124.792 9.95954 124.66 10.3506L121.368 18.1763H123.673L124.133 16.9376H126.964L127.228 18.1763H129.269ZM125.911 11.9815L126.569 15.1767H124.726L125.911 11.9815Z" fill="#172B85"/>
          <rect x="145.553" y="0.279489" width="38.5695" height="26.272" rx="3.07438" fill="white" stroke="#D9D9D9" stroke-width="0.558979"/>
          <path d="M170.431 9.99512C171.816 9.99512 173.123 11.2434 173.131 13.5342C173.131 16.0383 171.84 17.1757 170.423 17.1758C169.726 17.1758 169.307 16.8841 169.021 16.6787L169.014 18.9141L167.033 19.333V10.1221H168.775L168.879 10.6113C169.156 10.3586 169.655 9.99512 170.431 9.99512ZM153.54 9.99512C154.197 9.99514 154.847 10.0977 155.504 10.3584V12.2148C154.902 11.891 154.142 11.71 153.54 11.71C153.12 11.71 152.867 11.8279 152.867 12.1357C152.867 13.0205 155.884 12.6021 155.892 14.9561C155.892 16.37 154.759 17.1836 153.112 17.1836C152.431 17.1836 151.687 17.0494 150.95 16.7334V14.8535C151.615 15.2169 152.455 15.4854 153.112 15.4854C153.556 15.4853 153.872 15.367 153.872 15.0039C153.872 14.0639 150.863 14.4107 150.863 12.2305C150.863 10.8325 151.933 9.99512 153.54 9.99512ZM158.212 10.1299H159.717V11.8125H158.212V14.6162C158.212 15.7853 159.463 15.422 159.717 15.3193V16.9229C159.456 17.065 158.98 17.1835 158.331 17.1836C157.159 17.1836 156.279 16.3225 156.279 15.1533L156.287 8.82617L158.22 8.41504L158.212 10.1299ZM176.513 9.99512C178.389 9.99525 179.371 11.5911 179.371 13.6133C179.371 13.8029 179.355 14.2137 179.355 14.3164H175.483C175.571 15.2484 176.251 15.5166 177.02 15.5166C177.803 15.5166 178.421 15.3514 178.959 15.083V16.6621C178.421 16.9622 177.708 17.1758 176.766 17.1758C174.834 17.1757 173.487 15.9752 173.487 13.5977C173.487 11.5912 174.628 9.99512 176.513 9.99512ZM162.18 10.7139C162.647 9.8613 163.573 10.0351 163.826 10.1299V11.9463C163.58 11.8594 162.789 11.7495 162.322 12.3574V17.042H160.342V10.1299H162.053L162.18 10.7139ZM166.297 17.042H164.31V10.1299H166.297V17.042ZM169.955 11.749C169.504 11.7491 169.219 11.9067 169.013 12.1357L169.021 15.0664C169.211 15.2717 169.488 15.4384 169.955 15.4385C170.684 15.4385 171.175 14.6482 171.175 13.5898C171.175 12.555 170.676 11.749 169.955 11.749ZM176.505 11.5986C176.006 11.5986 175.459 11.9706 175.459 12.8633H177.502C177.502 11.9709 176.988 11.5988 176.505 11.5986ZM166.297 9.10254L164.31 9.5293V7.91797L166.297 7.49902V9.10254Z" fill="#6461FC"/>
          </svg>
      </div>
    </>
  );
}

async function RelatedProducts({ id, tags }: { id: string; tags: string[] }) {
  const relatedProducts = await getProductRecommendations({
    productId: id,
    tags,
  });

  if (!relatedProducts.length) return null;

  return (
    <div className="inline-space">
      <h2 className="inline-space">Related Products</h2>
      <ul className="main-grid">
        {relatedProducts.slice(0, 3).map((product) => (
          <li key={product.handle}>
            <Link href={`/products/${product.handle}`} prefetch={true}>
              <div className="product-card">
                <ProductImage
                  shopifyImage={product.featuredImage}
                  objectFit="cover"
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                />
              </div>
              <h3>{product.title}</h3>
              <Price
                amount={product.priceRange.minVariantPrice.amount}
                currencyCode={product.priceRange.minVariantPrice.currencyCode}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
