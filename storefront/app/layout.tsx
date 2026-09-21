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
  const [{ data: settings }, { data: home }] = await Promise.all([
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
  ]);
  const title = settings?.title || "Sanity Photon";
  const description =
    home?.pageSeo?.description || "Esoterique Art Studio";

  const ogImage = resolveOpenGraphImage(home?.pageSeo?.ogImage);
  let metadataBase: URL | undefined = undefined;
  try {
    metadataBase = settings?.metadataBase
      ? new URL(settings.metadataBase)
      : undefined;
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: description,
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
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ isEnabled: isDraftMode }, cookieStore, ratesResult] =
    await Promise.all([draftMode(), cookies(), getRates()]);
  const initialCurrency =
    cookieStore.get(CURRENCY_COOKIE)?.value?.toUpperCase() || BASE_CURRENCY;

  return (
    <ViewTransitions>
    <html lang="en" className={inter.className}>
      <body>
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
