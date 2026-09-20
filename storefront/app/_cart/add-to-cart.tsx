"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product, ProductVariant } from "../../shopify/types";
import { useProduct } from "../products/[slug]/product-context";
import { useCart } from "./cart-context";
import { useCurrency } from "../../components/currency-provider";

gsap.registerPlugin(ScrollTrigger);

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale, priceRange } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [added, setAdded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // On mobile the button is fixed to the bottom of the screen. When the end of
  // the product page reaches the bottom of the screen, GSAP docks it: the
  // class swaps it from fixed to absolute at the exact scroll position where
  // both sit in the same spot. Nothing is animated per frame, so it always
  // moves with the native scroll (and Lenis) and can never lag or jiggle.
  useEffect(() => {
    const btn = buttonRef.current;
    const page = btn?.closest<HTMLElement>("[data-product-page]");
    if (!btn || !page) return;

    const mm = gsap.matchMedia();
    mm.add("(max-width: 768px)", () => {
      // The page sits inside the body's side margin, so its box is narrower
      // than the screen. Give the docked button the exact size and left edge
      // of the fixed one (10px in from each side of the screen).
      const sync = () => {
        const { left } = page.getBoundingClientRect();
        btn.style.setProperty("--dock-left", `${10 - left}px`);
        btn.style.setProperty(
          "--dock-width",
          `${document.documentElement.clientWidth - 20}px`,
        );
      };
      sync();

      const st = ScrollTrigger.create({
        trigger: page,
        start: "bottom bottom",
        // Far past the bottom of the page. "max" would count as leaving the
        // trigger once the page is scrolled all the way down, un-docking it.
        end: "+=1000000",
        invalidateOnRefresh: true,
        onRefresh: sync,
        toggleClass: { targets: btn, className: "is-docked" },
      });
      return () => {
        st.kill();
        btn.classList.remove("is-docked");
        btn.style.removeProperty("--dock-left");
        btn.style.removeProperty("--dock-width");
      };
    });

    return () => mm.revert();
  }, []);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find((v) => v.id === selectedVariantId)!;

  const { format } = useCurrency();
  const price = format(
    priceRange.minVariantPrice.amount,
    priceRange.minVariantPrice.currencyCode,
    { compact: true },
  ).text;

  const handleAdd = () => {
    if (!finalVariant || !availableForSale) return;
    addCartItem(finalVariant, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const disabled = !availableForSale || !selectedVariantId;
  const label = !availableForSale
    ? "Unavailable"
    : !selectedVariantId
    ? "Select an option"
    : added
    ? "Added"
    : "Add to Cart";

  // Desktop reads "Add to cart", the pinned mobile button "Add to Cart".
  const labelContent =
    label === "Add to Cart" ? (
      <>
        <span className="add-to-cart__label-desktop">Add to cart</span>
        <span className="add-to-cart__label-mobile">Add to Cart</span>
      </>
    ) : !availableForSale ? (
      "Sold Out"
    ) : !selectedVariantId ? (
      "Select option"
    ) : (
      "Add to Cart"
    );

  return (
    <form action={handleAdd}>
      <button
        ref={buttonRef}
        className="add-to-cart"
        type="submit"
        disabled={disabled}
        aria-label={label}
      >
        {/* Price left. Only shown on the pinned mobile button. */}
        <span
          className="add-to-cart__price"
          style={{
            opacity: added ? 0 : 1,
            transform: added ? "translateY(-100%)" : "translateY(0)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          {price}
        </span>
        <span
          style={{
            display: "block",
            position: "absolute",
            top: "100%",
            left: "0.85rem",
            transform: added ? "translateY(-175%)" : "translateY(0)",
            transition: "transform 0.25s ease",
          }}
        >
          Added
        </span>

        {/* Label, slides up on added */}
        <span
          style={{
            position: "relative",
            height: "1.2em",
            overflow: "hidden",
            display: "inline-block",
          }}
        >
          <span
            style={{
              display: "block",
              transform: added ? "translateY(-100%)" : "translateY(0)",
              transition: "transform 0.25s ease",
            }}
          >
            {labelContent}
          </span>
        </span>
      </button>
    </form>
  );
}
