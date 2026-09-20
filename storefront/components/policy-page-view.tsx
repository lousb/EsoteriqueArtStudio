import type { Metadata } from "next";
import type { PortableTextBlock } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../data/sanity";
import { POLICY_PAGE_QUERY } from "../data/sanity/queries";
import {
  getPolicyDefault,
  policyToPortableText,
} from "../data/policies/defaults";
import { getShipping } from "../data/shipping";
import { CustomPortableText } from "./custom-portable-text";
import { ShippingSelector } from "./shipping-selector";
import s from "./info-page.module.css";

type Section = "pages" | "policies";

type Resolved = {
  title: string;
  lastUpdated: string | null;
  body: PortableTextBlock[];
};

/**
 * Prefer the editable document in Sanity. If it has not been created yet,
 * fall back to the built-in default copy so the page always works.
 */
async function resolvePolicy(
  section: Section,
  slug: string,
): Promise<Resolved | null> {
  const { data: raw } = await sanityFetch({
    query: POLICY_PAGE_QUERY,
    params: { slug, section },
  });
  // Cast keeps this compiling until types are regenerated from the new schema.
  const data = raw as unknown as {
    _id?: string;
    title?: string | null;
    lastUpdated?: string | null;
    body?: unknown[] | null;
  } | null;

  if (data?._id && data.body?.length) {
    return {
      title: data.title || "",
      lastUpdated: data.lastUpdated ?? null,
      body: data.body as unknown as PortableTextBlock[],
    };
  }

  const fallback = getPolicyDefault(section, slug);
  if (!fallback) return null;
  return {
    title: data?.title || fallback.title,
    lastUpdated: data?.lastUpdated ?? fallback.lastUpdated,
    body: policyToPortableText(fallback) as unknown as PortableTextBlock[],
  };
}

function formatDate(date: string | null) {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export async function policyMetadata(
  section: Section,
  slug: string,
): Promise<Metadata> {
  const policy = await resolvePolicy(section, slug);
  return { title: policy?.title };
}

export async function PolicyPageView({
  section,
  slug,
}: {
  section: Section;
  slug: string;
}) {
  const policy = await resolvePolicy(section, slug);
  if (!policy) notFound();

  const updated = formatDate(policy.lastUpdated);
  const shipping =
    section === "pages" && slug === "shipping-taxes" ? await getShipping() : null;

  return (
    <div className={s.page}>
      <div className={s.aside}>
        <h1 className={s.title}>{policy.title}</h1>
        {updated ? <p className={s.meta}>Last updated {updated}</p> : null}
      </div>
      <div className={s.content}>
        {shipping ? (
          <div className={s.selectorBlock}>
            <ShippingSelector
              label={shipping.label}
              regions={shipping.regions}
              defaultOpen
            />
          </div>
        ) : null}
        <CustomPortableText className={s.prose} value={policy.body} />
      </div>
    </div>
  );
}
