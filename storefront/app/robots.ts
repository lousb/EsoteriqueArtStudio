import type { MetadataRoute } from "next";
import { SITE_URL, isNonProductionDeployment } from "../data/seo";

/**
 * Served at /robots.txt. A Vercel preview/branch deployment blocks
 * everything so it can never get indexed under the production domain's
 * search results; production allows crawling and points crawlers at the
 * sitemap. /studio (Sanity Studio) and Next's internal /api routes are kept
 * out of the index everywhere since they're not public content.
 */
export default function robots(): MetadataRoute.Robots {
  if (isNonProductionDeployment()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
