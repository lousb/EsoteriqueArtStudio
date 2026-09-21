import type { Metadata } from "next";
import { PageBuilder } from "../components/page-builder";
import { sanityFetch } from "../data/sanity/";
import { HOME_QUERY } from "../data/sanity/queries";
import { DEFAULT_DESCRIPTION } from "../data/seo";

// "/" permanently redirects to /products (see next.config.ts), so this route
// is never crawled directly. Metadata is still correct here in case that
// redirect is ever removed.
export async function generateMetadata(): Promise<Metadata> {
  const { data: home } = await sanityFetch({ query: HOME_QUERY, stega: false });
  const description = home?.pageSeo?.description || DEFAULT_DESCRIPTION;
  return {
    description,
    alternates: { canonical: "/" },
  } satisfies Metadata;
}

export default async function Page() {
  const { data: home } = await sanityFetch({
    query: HOME_QUERY,
    // Metadata should never contain stega
    stega: false,
  });

  if (!home?._id) {
    return <>NO HOME PAGE FOUND</>;
  }

  return (
    <div>
      <PageBuilder page={home} />
    </div>
  );
}
