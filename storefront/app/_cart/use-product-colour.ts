"use client";

import { useEffect, useState } from "react";

export type ProductColour = { background: string; text: string } | null;

/**
 * Picks the main colour of a product from its photo, ignoring the light studio
 * background and soft shadows. A blue card holder gives blue, black eyewear
 * gives black, olive eyewear gives olive. Returns null until the photo has been
 * read (or if it can't be), so the button keeps its default black.
 */
export function useProductColour(imageUrl?: string | null): ProductColour {
  const [colour, setColour] = useState<ProductColour>(null);

  useEffect(() => {
    if (!imageUrl || imageUrl.startsWith("data:")) return;
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      try {
        const result = pickColour(img);
        if (result && !cancelled) setColour(result);
      } catch {
        // Canvas blocked (no CORS) or similar: keep the default colour.
      }
    };
    img.src = smallVersion(imageUrl);

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return colour;
}

/** Ask the image CDN for a small copy, there's no need to read a full-size photo. */
function smallVersion(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "cdn.shopify.com") u.searchParams.set("width", "200");
    if (u.hostname === "cdn.sanity.io") u.searchParams.set("w", "200");
    return u.toString();
  } catch {
    return url;
  }
}

function pickColour(img: HTMLImageElement): ProductColour {
  const w = 60;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Group similar pixels into buckets (5 bits per channel) and keep a running
  // sum so the final colour is the true average of the winning bucket.
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Skip the light background, grain and soft grey shadows.
    if (max > 235) continue;
    if (max > 185 && max - min < 30) continue;
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n++; bucket.r += r; bucket.g += g; bucket.b += b;
    buckets.set(key, bucket);
  }

  // Find the most common colour, counting each bucket together with its close
  // neighbours so a leather's natural tonal variation counts as one colour.
  const near = (a: number, b: number, d: number) =>
    Math.abs((a >> 10) - (b >> 10)) <= d &&
    Math.abs(((a >> 5) & 31) - ((b >> 5) & 31)) <= d &&
    Math.abs((a & 31) - (b & 31)) <= d;

  let bestKey = -1;
  let bestScore = 0;
  for (const key of buckets.keys()) {
    let score = 0;
    for (const [k2, b2] of buckets) if (near(key, k2, 2)) score += b2.n;
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  // Too little product in the photo to trust: keep the default.
  if (bestKey < 0 || bestScore < w * h * 0.02) return null;

  // Average the whole colour family (highlights and shade) for the final tone.
  let n = 0, rs = 0, gs = 0, bs = 0;
  for (const [k2, b2] of buckets) {
    if (!near(bestKey, k2, 5)) continue;
    n += b2.n; rs += b2.r; gs += b2.g; bs += b2.b;
  }
  const r = Math.round(rs / n);
  const g = Math.round(gs / n);
  const b = Math.round(bs / n);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return {
    background: `rgb(${r}, ${g}, ${b})`,
    text: luminance > 0.6 ? "#000" : "#fff",
  };
}
