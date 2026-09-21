import "../styles/globals.css";

import type { Metadata } from "next";
import { VisualEditing } from "next-sanity";
import { cookies, draftMode } from "next/headers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"

import { DraftModeToast } from "./draft-mode-toast";

import { sanityFetch, SanityLive } from "../data/sanity";
import { HOME_QUERY, SETTINGS_QUERY } from "../data/sanity/queries";
import { resolveOpenGraphImage } from "../sanity/utils";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  isNonProductionDeployment,
} from "../data/seo";
import { organizationJsonLd, websiteJsonLd } from "../data/seo/json-ld";
import { handleError } from "./client-utils";

import { Inter } from 'next/font/google'

import { SiteFooter } from "../components/site-footer";
import { CurrencyProvider } from "../components/currency-provider";
import { getRates } from "../data/currency/rates";
import { BASE_CURRENCY, CURRENCY_COOKIE } from "../data/currency/currencies";
import { CartProvider } from "./_cart/cart-context";
import { LocalCart } from "./_cart/local-cart";
import s from "./layout.module.css";

import { Link, ViewTransitions } from 'next-view-transitions'
import LenisProvider from "../components/lenis-provider";
import { Suspense } from "react";
import { NavLinks } from "../components/nav-links";
import { getCartSuggestions } from "../data/cart/suggestions";
import { getMenuLinks } from "../data/navigation";
import { MobileMenu } from "../components/mobile-menu";
import { HeaderScroll } from "../components/header-scroll";

const inter = Inter({
  subsets: ['latin'],
  weight: ['500'], // medium only
  display: 'swap', // prevents invisible text
})


/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: home }, draft] = await Promise.all([
    sanityFetch({
      query: SETTINGS_QUERY,
      // Metadata should never contain stega
      stega: false,
    }),
    sanityFetch({
      query: HOME_QUERY,
      // Metadata should never contain stega
      stega: false,
    }),
    draftMode(),
  ]);
  const title = settings?.title || SITE_NAME;
  const description = home?.pageSeo?.description || DEFAULT_DESCRIPTION;

  const ogImage = resolveOpenGraphImage(home?.pageSeo?.ogImage);
  let metadataBase: URL;
  try {
    metadataBase = settings?.metadataBase
      ? new URL(settings.metadataBase)
      : new URL(SITE_URL);
  } catch {
    metadataBase = new URL(SITE_URL);
  }

  // A Sanity draft-mode preview or a Vercel preview/branch deployment should
  // never show up in search results, only the real production site.
  const noindex = draft.isEnabled || isNonProductionDeployment();

  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: description,
    applicationName: SITE_NAME,
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    // Favicon files live in /public so they are served from the site root.
    icons: {
      icon: [
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    manifest: "/site.webmanifest",
    other: { "apple-mobile-web-app-title": "Esoterique" },
    openGraph: {
      type: "website",
      siteName: title,
      locale: "en_AU",
      url: "/",
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage.url] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ isEnabled: isDraftMode }, cookieStore, ratesResult, { data: settings }] =
    await Promise.all([
      draftMode(),
      cookies(),
      getRates(),
      sanityFetch({ query: SETTINGS_QUERY, stega: false }),
    ]);
  const initialCurrency =
    cookieStore.get(CURRENCY_COOKIE)?.value?.toUpperCase() || BASE_CURRENCY;

  return (
    <ViewTransitions>
    <html lang="en" className={inter.className}>
      <body>
        {/* Sitewide structured data: lets Google associate the site with the
            brand name, logo and social profiles (Organization + WebSite). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationJsonLd({ instagramUrl: settings?.contact?.instagramUrl }),
              websiteJsonLd(),
            ]),
          }}
        />
        {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
        <Toaster />
        {isDraftMode && (
          <>
            <DraftModeToast />
            {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
            <VisualEditing />
          </>
        )}
        {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
        <SanityLive onError={handleError} />
        {/* We'll keep a static store to demonstrate functionality. For a complete e-commerce solution, the cart should have server state in the form of cookies */}
        <CurrencyProvider
          initialCurrency={initialCurrency}
          rates={ratesResult.rates}
          ratesDate={ratesResult.date}
        >
        <CartProvider>
          <Header />
          <HeaderScroll />
          <main>
            <Suspense fallback={null}>
            <LenisProvider>
              <div className="overlay"></div>
              <div className="overlay-shadow"></div>
              {children}
              </LenisProvider>
            </Suspense>
           </main>
         
          <SiteFooter />
        </CartProvider>
        </CurrencyProvider>
        <Analytics />
      </body>
    </html>
    </ViewTransitions>
  );
}

export async function Header() {
  const [suggestions, menuLinks] = await Promise.all([
    getCartSuggestions(),
    getMenuLinks(),
  ]);
  return (
    <header className={s.header} data-site-header>
      <nav className={s.nav}>
        <div className={s.headerGrid}>
          <div><Link href="/">Esoterique Art Studio</Link></div>
          <div />
          <div><NavLinks /></div>
          <div className={s.cartCol}>
            <LocalCart suggestions={suggestions} />
            <MobileMenu links={menuLinks} />
          </div>
        </div>
      </nav>
    </header>
  );
}
