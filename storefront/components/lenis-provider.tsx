"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren } from "react";

gsap.registerPlugin(ScrollTrigger);

const LenisProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<Lenis | null>(null);

  const isStudio = pathname.startsWith("/studio");

  useEffect(() => {
    if (isStudio) return; // Skip initializing Lenis in Sanity Studio

    const lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Drive Lenis from GSAP's ticker and update ScrollTrigger inside the same
    // frame Lenis moves the page. Without this, ScrollTrigger only reacts to
    // the browser's scroll event on the next frame, so anything positioned
    // from it (carousel dots, pinned elements) trails the smoothed scroll.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, [isStudio]);

  useEffect(() => {
    if (isStudio) return;

    const handleNavigation = () => {
      if (lenisRef.current) {
        lenisRef.current.stop();
      }
      window.scrollTo(0, 0);
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    };

    handleNavigation();
  }, [pathname, searchParams, isStudio]);

  return <>{children}</>;
};

export default LenisProvider;
