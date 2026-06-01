"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MediaItem } from "./media-item";
import useEmblaCarousel from "embla-carousel-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type MediaItemType = {
  mediaType: "image" | "video";
  image?: any;
  video?: { playbackId: string; aspectRatio?: string };
};

type ImageBlockProps = {
  items?: MediaItemType[];
  title?: string;
  description?: string;
};

const PARALLAX_AMOUNT = 60;
const TAP_THRESHOLD = 5; // px — below this = tap, above = swipe

export function ImageBlock({ items, title, description }: ImageBlockProps) {
  const n = items?.length ?? 0;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<HTMLDivElement>(null);

  // Pointer delta tracking for tap-vs-swipe detection
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  });

  if (!items || n === 0) return null;
  const isCarousel = n > 1;

  // Sync dot indicator with Embla
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Tap handler — only navigate if pointer barely moved (i.e. it's a real tap, not a swipe)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
  }, []);

  const handleTap = useCallback((dir: 1 | -1) => (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerStartX.current);
    const dy = Math.abs(e.clientY - pointerStartY.current);
    if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
      dir === -1 ? emblaApi?.scrollPrev() : emblaApi?.scrollNext();
    }
  }, [emblaApi]);

  // Parallax
  useEffect(() => {
    if (!containerRef.current) return;

    innerRefs.current.forEach((inner) => {
      if (inner) gsap.set(inner, { y: -PARALLAX_AMOUNT / 2 });
    });

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
    });

    return () => st.kill();
  }, [n]);

  // Dots landing animation (unchanged from original)
  useEffect(() => {
    if (!isCarousel || !containerRef.current || !dotsRef.current) return;

    const container = containerRef.current;
    const dots = dotsRef.current;

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: () => {
        const rect = container.getBoundingClientRect();
        const viewportH = window.innerHeight;
        let y = 0;
        if (rect.bottom > viewportH) y = viewportH - rect.bottom;
        if (y > 0) y = 0;
        gsap.set(dots, { y, overwrite: true });
      },
    });

    return () => st.kill();
  }, [isCarousel]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        data-image-block-container
        style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden" }}
      >
        {/* Embla viewport */}
        <div ref={emblaRef} style={{ width: "100%", height: "100%" }}>
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  minWidth: "100%",
                  height: "100%",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  ref={(el) => { innerRefs.current[i] = el; }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: `calc(100% + ${PARALLAX_AMOUNT}px)`,
                    willChange: "transform",
                  }}
                >
                  <MediaItem
                    mediaType={item.mediaType}
                    image={item.image}
                    video={item.video}
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tap zones — only fire if it wasn't a swipe */}
        {isCarousel && (
          <>
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={handleTap(-1)}
              style={{
                position: "absolute", left: 0, top: 0,
                width: "50%", height: "100%",
                zIndex: 3, cursor: "w-resize",
              }}
            />
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={handleTap(1)}
              style={{
                position: "absolute", right: 0, top: 0,
                width: "50%", height: "100%",
                zIndex: 3, cursor: "e-resize",
              }}
            />
          </>
        )}

        {/* Dots */}
        {isCarousel && (
          <div
            ref={dotsRef}
            style={{
              position: "absolute",
              bottom: "0.75rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "0.35rem",
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            {items.map((_, i) => (
              <div
                key={i}
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "white",
                  opacity: i === selectedIndex ? 1 : 0.3,
                  transition: "opacity 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {(title || description) && (
        <div style={{ paddingTop: "0.5rem" }}>
          {title && <p style={{ margin: 0 }}>{title}</p>}
          {description && <p style={{ margin: 0, opacity: 0.6, fontSize: "0.85em" }}>{description}</p>}
        </div>
      )}
    </div>
  );
}