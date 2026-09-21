import { absoluteUrl, SITE_NAME, SITE_URL } from "./index";

/**
 * Sitewide Organization + WebSite structured data. Rendered once in the root
 * layout so every page carries it. This is what lets Google associate the
 * site with the brand name, logo and social profiles in search results (and
 * is a prerequisite for a Google Business Profile / knowledge panel to be
 * able to link back to the right "official site").
 */
export function organizationJsonLd({
  instagramUrl,
}: {
  instagramUrl?: string | null;
}) {
  const sameAs = [instagramUrl].filter(Boolean) as string[];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/web-app-manifest-512x512.png"),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd({
  name,
  description,
  images,
  handle,
  availableForSale,
  currencyCode,
  minPrice,
  maxPrice,
  offerCount,
}: {
  name: string;
  description?: string;
  images: string[];
  handle: string;
  availableForSale: boolean;
  currencyCode: string;
  minPrice: string;
  maxPrice: string;
  offerCount: number;
}) {
  const availability = availableForSale
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
  const url = absoluteUrl(`/products/${handle}`);

  const offers =
    minPrice === maxPrice
      ? {
          "@type": "Offer",
          url,
          priceCurrency: currencyCode,
          price: minPrice,
          availability,
        }
      : {
          "@type": "AggregateOffer",
          url,
          priceCurrency: currencyCode,
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount,
          availability,
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description ? { description } : {}),
    image: images,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers,
  };
}

export function blogPostingJsonLd({
  headline,
  description,
  path,
  image,
  datePublished,
  author,
}: {
  headline: string;
  description?: string;
  path: string;
  image?: string;
  datePublished?: string | null;
  author?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    ...(description ? { description } : {}),
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    author: { "@type": author ? "Person" : "Organization", name: author || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}
