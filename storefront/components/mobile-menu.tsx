"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../app/_cart/cart-context";
import { OPEN_CART_EVENT } from "../app/_cart/cart-events";
import type { MenuLinks, NavLink } from "../data/navigation";
import s from "./mobile-menu.module.css";
import { ExternalArrow } from "./external-arrow";

const isExternal = (href: string) =>
  /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);

function MenuAnchor({
  link,
  onNavigate,
  className,
}: {
  link: NavLink;
  onNavigate: () => void;
  className?: string;
}) {
  if (isExternal(link.href)) {
    const newTab = /^(https?:)?\/\//i.test(link.href);
    return (
      <a
        href={link.href}
        className={className}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        onClick={onNavigate}
      >
        {link.label}
        {newTab ? <ExternalArrow /> : null}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  );
}

/**
 * Phone-only header button that opens a full screen menu. The menu has its own
 * copy of the header (logo, cart, close) so it reads as the same bar.
 */
export function MobileMenu({ links }: { links: MenuLinks }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { cart } = useCart();
  const count = mounted ? (cart?.totalQuantity ?? 0) : 0;

  const close = () => setOpen(false);

  useEffect(() => setMounted(true), []);

  // Close whenever the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const openCart = () => {
    setOpen(false);
    window.dispatchEvent(new Event(OPEN_CART_EVENT));
  };

  return (
    <>
      <button
        type="button"
        className={s.trigger}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <svg viewBox="0 0 22 8" width="22" height="8" aria-hidden="true">
          <path d="M0 1h22M0 7h22" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div className={s.menu} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={s.bar}>
              <Link href="/" className={s.logo} onClick={close} aria-label="Home">
                ƎE
              </Link>
              <div className={s.barRight}>
                <button type="button" className={s.plain} onClick={openCart}>
                  Cart{count ? ` ${count}` : " 0"}
                </button>
                <button
                  type="button"
                  className={s.plain}
                  onClick={close}
                  aria-label="Close menu"
                >
                  <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={s.body}>
              <p className={s.intro}>{links.intro}</p>

              <nav className={s.section} aria-label={links.exploreTitle}>
                <p className={s.heading}>{links.exploreTitle}</p>
                <ul className={s.list}>
                  {links.explore.map((l) => (
                    <li key={l.href}>
                      <MenuAnchor link={l} onNavigate={close} className={s.link} />
                    </li>
                  ))}
                </ul>
              </nav>

              <nav className={s.section} aria-label={links.serviceTitle}>
                <p className={s.heading}>{links.serviceTitle}</p>
                <ul className={s.list}>
                  {links.service.map((l) => (
                    <li key={l._key ?? l.href + l.label}>
                      <MenuAnchor link={l} onNavigate={close} className={s.link} />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
