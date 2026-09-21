import type { MetadataRoute } from "next";
import { sanityFetch } from "../data/sanity";
import {
  ALL_COLLECTION_PAGES_SLUGS,
  ALL_PAGES_SLUGS,
  ALL_POLICY_PAGE_SLUGS,
  ALL_POST_SLUGS,
  ALL_PRODUCT_PAGES_SLUGS,
} from "../data/sanity/queries";
import { getActiveHandles } from "../data/recommendable";
import { POLICY_DEFAULTS } from "../data/policies/defaults";
import { SITE_URL } from "../data/seo";

type Entry = MetadataRoute.Sitemap[number];

const url = (path: string, overrides: Partial<Entry> = {}): Entry => ({
  url: `${SITE_URL}${path}`,
  lastModified: new Date(),
  ...overrides,
});

/**
 * Served at /sitemap.xml. This is the single list of every URL on the site
 * that's safe to send to Google: the shop (the effective homepage, since "/"
 * redirects there), every active product and collection, every editorial
 * page and policy page, and the archive. Draft and archived products are
 * left out on purpose, since their pages 404.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    { data: productSlugs },
    { data: collectionSlugs },
    { data: pageSlugs },
    { data: postSlugs },
    { data: policySlugs },
    activeHandles,
  ] = await Promise.all([
    sanityFetch({ query: ALL_PRODUCT_PAGES_SLUGS, perspective: "published", stega: false }),
    sanityFetch({ query: ALL_COLLECTION_PAGES_SLUGS, perspective: "published", stega: false }),
    sanityFetch({ query: ALL_PAGES_SLUGS, perspective: "published", stega: false }),
    sanityFetch({ query: ALL_POST_SLUGS, perspective: "published", stega: false }),
    sanityFetch({ query: ALL_POLICY_PAGE_SLUGS, perspective: "published", stega: false }),
    getActiveHandles(),
  ]);

  const products = (productSlugs ?? [])
    .filter((p: { slug: string | null }): p is { slug: string } => !!p.slug)
    .filter((p) => !activeHandles || activeHandles.has(p.slug))
    .map((p) => url(`/products/${p.slug}`, { changeFrequency: "weekly", priority: 0.8 }));

  const collections = (collectionSlugs ?? [])
    .filter((c: { slug: string | null }): c is { slug: string } => !!c.slug)
    .map((c) => url(`/collections/${c.slug}`, { changeFrequency: "weekly", priority: 0.6 }));

  const pages = (pageSlugs ?? [])
    .filter((p: { slug: string | null }): p is { slug: string } => !!p.slug)
    .map((p) => url(`/${p.slug}`, { changeFrequency: "monthly", priority: 0.5 }));

  const posts = (postSlugs ?? [])
    .filter((p: { slug: string | null }): p is { slug: string } => !!p.slug)
    .map((p) => url(`/archive/${p.slug}`, { changeFrequency: "monthly", priority: 0.5 }));

  // Customer-service pages: the fixed defaults (shipping, returns, privacy,
  // terms) plus any extra policyPage document created in Sanity that isn't
  // one of those slugs already.
  const knownPolicyPaths = new Set(
    POLICY_DEFAULTS.map((d) => `/${d.section}/${d.slug}`),
  );
  const policies = [
    ...POLICY_DEFAULTS.map((d) => url(`/${d.section}/${d.slug}`, { changeFrequency: "yearly", priority: 0.3 })),
    ...(policySlugs ?? [])
      .filter((p: { slug: string; section: string }) => !knownPolicyPaths.has(`/${p.section}/${p.slug}`))
      .map((p: { slug: string; section: string }) =>
        url(`/${p.section}/${p.slug}`, { changeFrequency: "yearly", priority: 0.3 }),
      ),
  ];

  return [
    url("/products", { changeFrequency: "daily", priority: 1 }),
    url("/archive", { changeFrequency: "weekly", priority: 0.5 }),
    url("/pages/contact", { changeFrequency: "yearly", priority: 0.4 }),
    ...products,
    ...collections,
    ...pages,
    ...posts,
    ...policies,
  ];
}
