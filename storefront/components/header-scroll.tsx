"use client";

import { useEffect } from "react";

/** Header stays pinned until the footer's top edge is this far from the top of the screen. */
const RELEASE_AT = 100;

/**
 * Phones only. The header is sticky (see layout.module.css); this slides it up
 * with the page once the footer gets within RELEASE_AT px of the top of the
 * screen, so it is fixed until then and leaves with the footer after.
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
      if (!phone.matches) {
        header.style.transform = "";
        return;
      }
      const y = Math.min(0, footer.getBoundingClientRect().top - RELEASE_AT);
      header.style.transform = y ? `translate3d(0, ${y}px, 0)` : "";
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
