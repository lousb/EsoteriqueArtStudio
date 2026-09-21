import type { Metadata } from "next";
import { sanityFetch } from "../../data/sanity/";
import { SHOP_QUERY } from "../../data/sanity/queries";
import { ShopGrid } from "../../components/shop-grid";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "../../data/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data: shop } = await sanityFetch({ query: SHOP_QUERY, stega: false });
  const title = shop?.pageSeo?.title || "Shop";
  const description = shop?.pageSeo?.description || DEFAULT_DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical: "/products" },
    openGraph: { type: "website", url: "/products", title: `${title} | ${SITE_NAME}`, description },
    twitter: { card: "summary_large_image", title, description },
  } satisfies Metadata;
}

export default async function Page() {
  const { data: shop } = await sanityFetch({
    query: SHOP_QUERY,
    stega: false,
  });

  if (!shop?._id) {
    return <>NO SHOP PAGE FOUND — create the Shop document in Sanity Studio</>;
  }

  return (
    <div>
      <ShopGrid
        pageBuilder={shop.pageBuilder ?? []}
        pageId={shop._id}
        pageType={shop._type}
        title={shop.pageSeo?.title ?? null}
        description={shop.pageSeo?.description ?? null}
      />
    </div>
  );
}