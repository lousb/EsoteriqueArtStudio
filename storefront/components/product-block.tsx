"use client";

import NextImage from "next/image";
import NextLink from "next/link";
import Price from "./price";
import MuxPlayer from "@mux/mux-player-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

type HoverMedia = {
  mediaType: "image" | "video";
  imageUrl?: string | null;
  playbackId?: string | null;
};

type ProductBlockProps = {
  product: {
    title: string;
    slug: string;
    price: number;
    imageUrl: string;
    hoverMedia?: HoverMedia | null;
  };
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function ProductBlock({ product }: ProductBlockProps) {
  if (!product) return null;

  const hover = product.hoverMedia;
  const hasHover = hover && (hover.imageUrl || hover.playbackId);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const slides = [
    { type: "image" as const, src: product.imageUrl },
    ...(hasHover && hover.mediaType === "image" && hover.imageUrl
      ? [{ type: "image" as const, src: hover.imageUrl }]
      : []),
    ...(hasHover && hover.mediaType === "video" && hover.playbackId
      ? [{ type: "video" as const, playbackId: hover.playbackId }]
      : []),
  ];

  const showCarousel = isMobile && slides.length > 1;

  return (
    <NextLink href={`/products/${product.slug}`} className="product-block">
      <figure ref={containerRef} className="product-card">
        {showCarousel ? (
          <div
            ref={emblaRef}
            style={{
              // "clip" (not "hidden") so the dots inside can stick to the
              // viewport. It does not create a scroll container.
              overflow: "clip",
              position: "absolute",
              inset: 0,
            }}
          >
            <div
              className="product-card-image"
              style={{ display: "flex", height: "100%" }}
            >
              {slides.map((slide, i) =>
                slide.type === "image" ? (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      minWidth: "100%",
                      height: "100%",
                      flexShrink: 0,
                    }}
                  >
                    <NextImage
                      src={slide.src}
                      fill
                      alt={`${product.title} view ${i + 1}`}
                      style={{ objectFit: "cover" }}
                      sizes="100vw"
                    />
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      minWidth: "100%",
                      height: "100%",
                      flexShrink: 0,
                    }}
                  >
                    <MuxPlayer
                      playbackId={slide.playbackId}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                )
              )}
            </div>

            {/* Dots. Pinned to the bottom of the visible part of the card with
                position: sticky, so they move with the native scroll exactly,
                Lenis included, with no JavaScript involved. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: "0.75rem",
                zIndex: 4,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "sticky",
                  bottom: "0.75rem",
                  display: "flex",
                  gap: "0.35rem",
                }}
              >
                {slides.map((_, i) => (
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
            </div>
          </div>
        ) : (
          <>
            <NextImage
              src={product.imageUrl}
              fill
              alt={`Image for product: ${product.title}`}
              style={{ objectFit: "cover" }}
              sizes="25vw"
              className="product-block__primary"
            />

            {hasHover && hover.mediaType === "image" && hover.imageUrl && (
              <NextImage
                src={hover.imageUrl}
                fill
                alt={`${product.title} alternate view`}
                style={{ objectFit: "cover" }}
                sizes="25vw"
                className="product-block__hover hover-image"
              />
            )}

            {hasHover && hover.mediaType === "video" && hover.playbackId && (
              <MuxPlayer
                playbackId={hover.playbackId}
                autoPlay
                muted
                loop
                playsInline
                className="product-block__hover hover-video"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        )}
      </figure>

      <figcaption style={{ paddingTop: "0.5rem" }}>
        {product.title}
      </figcaption>

      <p>
        <Price amount={String(product.price)} currencyCode="AUD" />
      </p>

      <style jsx>{`
        .product-card {
          position: relative;
          overflow: hidden;
          overflow: clip;
        }

        .product-block__primary,
        .product-block__hover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.4s ease;
        }

        .hover-image,
        .hover-video {
          opacity: 0;
          pointer-events: none;
        }

        .product-card:hover .hover-image,
        .product-card:hover .hover-video {
          opacity: 1;
        }

        .product-card:hover .product-block__primary {
          opacity: 0.2;
        }
      `}</style>
    </NextLink>
  );
}