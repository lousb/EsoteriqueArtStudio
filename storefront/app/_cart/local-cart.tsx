"use client";

import dynamic from "next/dynamic";
import type { Product } from "../../shopify/types";

const Cart = dynamic(() => import("./cart").then((mod) => mod.Cart), {
  ssr: false,
  loading: () => <>Cart―</>,
});

export function LocalCart({ suggestions = [] }: { suggestions?: Product[] }) {
  return <Cart suggestions={suggestions} />;
}
