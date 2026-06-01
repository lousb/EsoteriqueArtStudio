"use client";

import { useEffect, useRef, useState } from "react";
import { MediaItem } from "./media-item";
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

export function ImageBlock({ items, title, description }: ImageBlockProps) {
  const n = items?.length ?? 0;
  const [index, setIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(true);
  const isAnimating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<HTMLDivElement>(null);

  if (!items || n === 0) return null;
  const isCarousel = n > 1;

  const slides = [items[n - 1], ...items, items[0]];
  const total = slides.length;
  const current = (index - 1 + n) % n;

  const go = (dir: 1 | -1) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setTransitioning(true);
    setIndex((i) => i + dir);
  };

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
  }, [slides.length]);

  // Dots landing animation
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

      // If bottom is below viewport → pin to viewport bottom
      if (rect.bottom > viewportH) {
        y = viewportH - rect.bottom;
      }

      // Clamp so it never goes past natural position
      if (y > 0) y = 0;

      gsap.set(dots, {
        y,
        overwrite: true,
      });
    },
  });

  return () => st.kill();
}, [isCarousel]);

  // Carousel loop
  useEffect(() => {
    if (!transitioning) return;
    const timer = setTimeout(() => {
      if (index === 0) {
        setTransitioning(false);
        setIndex(n);
      } else if (index === total - 1) {
        setTransitioning(false);
        setIndex(1);
      }
      isAnimating.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [index, transitioning, n, total]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        data-image-block-container
        style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            transform: `translateX(-${index * 100}%)`,
            transition: transitioning
              ? "transform 0.6s cubic-bezier(0.77, 0, 0.175, 1)"
              : "none",
          }}
        >
          {slides.map((item, i) => (
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
                  priority={i === 1}
                />
              </div>
            </div>
          ))}
        </div>

        {isCarousel && (
          <>
            <div onClick={() => go(-1)} style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", zIndex: 3, cursor: "w-resize" }} />
            <div onClick={() => go(1)} style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", zIndex: 3, cursor: "e-resize" }} />
          </>
        )}

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
                  opacity: i === current ? 1 : 0.3,
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