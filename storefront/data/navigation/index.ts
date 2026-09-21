import { sanityFetch } from "../sanity";
import { SETTINGS_QUERY } from "../sanity/queries";

export type NavLink = { _key?: string; label: string; href: string };

/**
 * Pages hidden from the footer and menu for now. Delete a path from this list
 * to bring its link back.
 */
export const HIDDEN_HREFS = ["/about", "/archive"];

export const isHidden = (href: string) => HIDDEN_HREFS.includes(href);

/** Used when no Instagram link is set in the Sanity settings. */
export const INSTAGRAM_URL = "https://instagram.com/esoteriqueartstudio";

export const DEFAULT_EXPLORE: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Shop", href: "/products" },
  { label: "Stories", href: "/archive" },
];

export const DEFAULT_CUSTOMER_SERVICE: NavLink[] = [
  { label: "Contact", href: "/pages/contact" },
  { label: "Shipping & Taxes", href: "/pages/shipping-taxes" },
  { label: "Returns", href: "/pages/returns" },
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
];

export const MENU_INTRO =
  "Esoterique Art Studio is a contemporary collection of finest accessories including eyewear, jewellery and leather goods. Designed in the Innerwest of Sydney.";

export type MenuLinks = {
  intro: string;
  exploreTitle: string;
  explore: NavLink[];
  serviceTitle: string;
  service: NavLink[];
};

const clean = (links?: (Partial<NavLink> | null)[] | null) =>
  (links ?? []).filter((l): l is NavLink => !!l && !!l.label && !!l.href);

/**
 * Links for the mobile menu, taken from the same Sanity settings as the footer
 * so the two always agree. Explore is Shop, Archive and Instagram.
 */
export async function getMenuLinks(): Promise<MenuLinks> {
  const base = {
    intro: MENU_INTRO,
    exploreTitle: "Explore",
    serviceTitle: "Customer Service",
    service: DEFAULT_CUSTOMER_SERVICE,
  };
  const shopArchive: NavLink[] = [
    { label: "Shop", href: "/products" },
    { label: "Archive", href: "/archive" },
  ].filter((l) => !isHidden(l.href));

  try {
    const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY });
    const footer = settings?.footer;
    const contact = settings?.contact as unknown as
      | { instagramUrl?: string | null }
      | null
      | undefined;

    // Instagram comes from the footer's Explore links if set there, otherwise
    // from the contact settings.
    const instagram =
      clean(footer?.exploreLinks).find((l) => /instagram/i.test(l.label))
        ?.href ??
      contact?.instagramUrl ??
      INSTAGRAM_URL;
    const service = clean(footer?.customerServiceLinks);

    return {
      ...base,
      exploreTitle: footer?.exploreTitle || base.exploreTitle,
      explore: [
        ...shopArchive,
        ...(instagram ? [{ label: "Instagram", href: instagram }] : []),
      ],
      serviceTitle: footer?.customerServiceTitle || base.serviceTitle,
      service: service.length ? service : DEFAULT_CUSTOMER_SERVICE,
    };
  } catch (error) {
    console.warn("[menu] using default links:", error);
    return { ...base, explore: shopArchive };
  }
}
