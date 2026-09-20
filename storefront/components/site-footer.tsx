import { Link } from "next-view-transitions";
import { sanityFetch } from "../data/sanity";
import { SETTINGS_QUERY } from "../data/sanity/queries";
import { CurrencySelect } from "./currency-select";
import s from "./site-footer.module.css";

type FooterLink = { _key?: string; label: string; href: string };

const DEFAULT_EXPLORE: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Shop", href: "/products" },
  { label: "Stories", href: "/archive" },
];

const DEFAULT_CUSTOMER_SERVICE: FooterLink[] = [
  { label: "Contact", href: "/pages/contact" },
  { label: "Shipping & Taxes", href: "/pages/shipping-taxes" },
  { label: "Returns", href: "/pages/returns" },
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
];

const DEFAULT_ACKNOWLEDGEMENT =
  "Respectfully acknowledging the Gadigal people of the Eora Nation as the Traditional Custodians of the land we work on. Sydney, Australia.";

function isExternal(href: string) {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

function FooterAnchor({ href, children }: { href: string; children: string }) {
  if (isExternal(href)) {
    const newTab = /^(https?:)?\/\//i.test(href);
    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return <Link href={href}>{children}</Link>;
}

function LinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h4 className={s.heading}>{title}</h4>
      <ul role="list" className={s.list}>
        {links.map((link) => (
          <li key={link._key ?? link.href + link.label}>
            <FooterAnchor href={link.href}>{link.label}</FooterAnchor>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function SiteFooter() {
  const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY });

  const footer = settings?.footer;
  // Cast keeps this compiling until types are regenerated from the new schema.
  const contact = settings?.contact as unknown as
    | { instagramUrl?: string | null }
    | null
    | undefined;

  const clean = (links?: (Partial<FooterLink> | null)[] | null) =>
    (links ?? []).filter(
      (l): l is FooterLink => !!l && !!l.label && !!l.href,
    );

  const exploreLinks = clean(footer?.exploreLinks);
  const serviceLinks = clean(footer?.customerServiceLinks);

  // Explore falls back to the defaults, plus Instagram when we have a URL.
  const explore: FooterLink[] = exploreLinks.length
    ? exploreLinks
    : [
        ...DEFAULT_EXPLORE,
        ...(contact?.instagramUrl
          ? [{ label: "Instagram", href: contact.instagramUrl }]
          : []),
      ];

  const service = serviceLinks.length ? serviceLinks : DEFAULT_CUSTOMER_SERVICE;

  const legalName = footer?.legalName || "Esoterique Art Studio";
  const year = new Date().getFullYear();

  return (
    <div className={s.wrap}>
      <Link href="/products" className={s.shopLabel}>
        {footer?.shopLabel || "Shop Eyewear"}
      </Link>

      <footer className={s.footer}>
        {/* Level one */}
        <div className={`${s.grid} ${s.levelOne}`}>
          <div className={`${s.block} ${s.b1}`}>
            <Link href="/" className={s.logo} aria-label="Home">
              ƎE
            </Link>
          </div>
          <div className={`${s.block} ${s.b2}`}>
            <LinkList
              title={footer?.exploreTitle || "Explore"}
              links={explore}
            />
          </div>
          <div className={`${s.block} ${s.b3}`}>
            <LinkList
              title={footer?.customerServiceTitle || "Customer Service"}
              links={service}
            />
          </div>
        </div>

        {/* Level two */}
        <div className={`${s.grid} ${s.levelTwo}`}>
          <p className={`${s.block} ${s.b1} ${s.acknowledgement}`}>
            {footer?.acknowledgement || DEFAULT_ACKNOWLEDGEMENT}
          </p>
          <div className={`${s.block} ${s.b2}`}>
            <h4 className={s.heading}>Country / Region</h4>
            <CurrencySelect />
          </div>
          <p className={`${s.block} ${s.b3} ${s.copyright}`}>
            © {year} {legalName}. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
