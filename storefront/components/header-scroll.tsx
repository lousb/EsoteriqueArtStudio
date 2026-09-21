"use client";

import { useEffect } from "react";

/** The header hides once the footer has scrolled this far into the screen (from the bottom edge). */
const HIDE_WHEN_FOOTER_IN = 100;

/**
 * Phones only. The header is sticky (see layout.module.css). Once the footer's
 * top edge is HIDE_WHEN_FOOTER_IN px up from the bottom of the screen, the header
 * slides out of view, and it comes back when you scroll back up.
 */
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    if (!header || !footer) return;

    const phone = window.matchMedia("(max-width: 768px)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const hide =
        phone.matches &&
        footer.getBoundingClientRect().top <=
          window.innerHeight - HIDE_WHEN_FOOTER_IN;
      header.style.transform = hide ? "translate3d(0, -100%, 0)" : "";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    phone.addEventListener("change", schedule);
    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      phone.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
      header.style.transform = "";
    };
  }, []);

  return null;
}
