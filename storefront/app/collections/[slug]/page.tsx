import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "../../../data/sanity";
import {
  ALL_COLLECTION_PAGES_SLUGS,
  ALL_COLLECTIONS_QUERY,
  COLLECTION_QUERY,
} from "../../../data/sanity/queries";
import { PageBuilder } from "../../../components/page-builder";
import { directOgImage, toPlainText } from "../../../data/seo";
import { breadcrumbJsonLd } from "../../../data/seo/json-ld";
import { PLP } from "../../../components/plp";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_COLLECTION_PAGES_SLUGS,
    // // Use the published perspective in generateStaticParams
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
  const { data: collection } = await sanityFetch({
    query: COLLECTION_QUERY,
    params,
    // Metadata should never contain stega
    stega: false,
  });
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = directOgImage(collection?.store?.imageUrl, collection?.store?.title);
  const description = toPlainText(collection?.store?.descriptionHtml);
  const path = `/collections/${params.slug}`;

  return {
    title: collection?.store?.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: collection?.store?.title ?? undefined,
      description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: collection?.store?.title ?? undefined,
      description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  } satisfies Metadata;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { data: collectionPage, tags } = await sanityFetch({
    query: COLLECTION_QUERY,
    params,
  });

  if (!collectionPage?._id) {
    return notFound();
  }

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Shop", path: "/products" },
    { name: collectionPage.name, path: `/collections/${params.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {!!collectionPage.editorial && (
        <PageBuilder page={collectionPage.editorial} />
      )}
      <PLP tags={tags} collectionSlug={collectionPage.store?.slug?.current} />
    </>
  );
}
