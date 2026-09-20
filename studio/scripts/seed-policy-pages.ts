/**
 * Creates the editable Customer Service pages in Sanity, using the default
 * copy that lives in storefront/data/policies/defaults.ts.
 *
 * Run from the studio folder:
 *   npx sanity exec scripts/seed-policy-pages.ts --with-user-token
 *
 * It is safe to run more than once: existing documents are left untouched,
 * so anything you have edited in the Studio is never overwritten.
 */
import { getCliClient } from "sanity/cli";
import {
  POLICY_DEFAULTS,
  policyToPortableText,
} from "../../storefront/data/policies/defaults";

const client = getCliClient({ apiVersion: "2024-10-28" });

async function main() {
  for (const page of POLICY_DEFAULTS) {
    const _id = `policyPage.${page.section}.${page.slug}`;
    const doc = await client.createIfNotExists({
      _id,
      _type: "policyPage",
      title: page.title,
      section: page.section,
      slug: { _type: "slug", current: page.slug },
      lastUpdated: page.lastUpdated,
      body: policyToPortableText(page),
    });
    const created = doc._createdAt === doc._updatedAt;
    console.log(`${created ? "Created" : "Already exists"}: ${page.title} (${_id})`);
  }
}

async function seedProductTypes() {
  const doc = await client.createIfNotExists({
    _id: "productType.eyewear",
    _type: "productType",
    title: "Eyewear",
    slug: { _type: "slug", current: "eyewear" },
    excerpt: "Premium eyewear. Fits most head shapes.",
  });
  const created = doc._createdAt === doc._updatedAt;
  console.log(`${created ? "Created" : "Already exists"}: Product type Eyewear`);
}

main()
  .then(seedProductTypes)
  .catch((error) => {
  console.error(error);
  process.exit(1);
});
