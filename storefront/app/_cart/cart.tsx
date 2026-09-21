"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import Price from "../../components/price";
import { useCurrency } from "../../components/currency-provider";
import { FREE_EXPRESS_ITEMS } from "../../data/cart/config";
import { DEFAULT_OPTION } from "../../shopify/constants";
import { CartItem, Product } from "../../shopify/types";
import { redirectToCheckout, saveCart } from "./cart-actions";
import { OPEN_CART_EVENT } from "./cart-events";
import { useCart } from "./cart-context";
import s from "./cart.module.css";

export function Cart({ suggestions = [] }: { suggestions?: Product[] }) {
  const { cart, updateCartItem, addCartItem } = useCart();
  const { isConverted, currency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Lets other parts of the site (the mobile menu) open the cart.
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_CART_EVENT, open);
    return () => window.removeEventListener(OPEN_CART_EVENT, open);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (cart) saveCart(cart);
  }, [cart]);

  const isEmpty = !cart || cart.lines.length === 0;
  const count = cart?.totalQuantity ?? 0;

  return (
    <>
      <button
        aria-label={isOpen ? "Close cart" : "Open cart"}
        onClick={isOpen ? closeCart : openCart}
        className={s.cartButton}
      >
        <span className={s.cartLabel}>
          {isOpen ? (
            "Close"
          ) : (
            <>
              Cart
              {count ? <span className={s.cartCount}>{count}</span> : null}
            </>
          )}
        </span>
      </button>

      {isOpen && createPortal(
        <>
          <div className={s.overlay} onClick={closeCart} aria-hidden="true" />

          <aside
            className={s.cart}
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {isEmpty ? (
              <>
                <button
                  className={s.closeIcon}
                  onClick={closeCart}
                  aria-label="Close cart"
                >
                  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </button>
                <div className={s.emptyState}>
                  <p className={s.emptyBox}>Your cart is empty</p>
                  <button className={s.textButton} onClick={closeCart}>
                    Continue shopping
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={s.cartHeader}>
                  <span>[{count}] {count === 1 ? "Item" : "Items"}</span>
                  <button className={s.headerClose} onClick={closeCart}>
                    Close
                  </button>
                </div>

                <div className={s.cartBody}>
                  <ShippingProgress count={count} />

                  <ul className={s.itemList}>
                    {cart.lines.map((item) => (
                      <CartLine
                        key={item.merchandise.id}
                        item={item}
                        onNavigate={closeCart}
                        update={updateCartItem}
                      />
                    ))}
                  </ul>

                  <Suggestions
                    products={suggestions}
                    inCart={cart.lines.map((l) => l.merchandise.product.id)}
                    onAdd={addCartItem}
                    onNavigate={closeCart}
                  />
                </div>

                <div className={s.cartFooter}>
                  <p className={s.subtotal}>
                    Subtotal:{" "}
                    <Price
                      amount={cart.cost.subtotalAmount.amount}
                      currencyCode={cart.cost.subtotalAmount.currencyCode}
                      showCode
                    />
                  </p>
                  <form action={() => { redirectToCheckout(cart); }}>
                    <CheckoutButton />
                  </form>
                  <p className={s.note}>
                    Shipping and discount codes are applied at checkout
                  </p>
                  {isConverted && (
                    <p className={s.note}>
                      Prices shown in {currency} are approximate. Checkout is charged in AUD.
                    </p>
                  )}
                </div>
              </>
            )}
          </aside>
        </>,
        // Rendered on the body, outside the header's stacking context, so it
        // always sits above everything else (including the pinned mobile button).
        document.body,
      )}
    </>
  );
}

/** Numbered steps up to the free express goal, ending in a tick. */
function ShippingProgress({ count }: { count: number }) {
  const goal = FREE_EXPRESS_ITEMS;
  const remaining = Math.max(goal - count, 0);
  const steps = Array.from({ length: goal }, (_, i) => i); // 0 .. goal-1

  const message =
    remaining === 0
      ? "Free express shipping unlocked"
      : `Add ${remaining} more ${remaining === 1 ? "piece" : "pieces"} for free express shipping`;

  return (
    <div className={s.progress}>
      <p className={s.progressText}>{message}</p>
      <div className={s.track} role="img" aria-label={message}>
        {steps.map((i) => (
          <span key={i} className={s.trackStep}>
            {i > 0 && (
              <span className={`${s.line} ${count >= i ? s.lineOn : ""}`} />
            )}
            <span className={`${s.node} ${count >= i ? s.nodeOn : ""}`}>{i}</span>
          </span>
        ))}
        <span className={s.trackStep}>
          <span className={`${s.line} ${count >= goal ? s.lineOn : ""}`} />
          <span className={`${s.node} ${count >= goal ? s.nodeOn : ""}`}>
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M2 6.5l2.6 2.6L10 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          </span>
        </span>
      </div>
    </div>
  );
}

function CartLine({
  item,
  onNavigate,
  update,
}: {
  item: CartItem;
  onNavigate: () => void;
  update: (id: string, type: "plus" | "minus" | "delete") => void;
}) {
  const { product } = item.merchandise;
  const image = item.merchandise.variantImage ?? product.featuredImage;
  const url = `/products/${product.handle}`;
  const options = item.merchandise.selectedOptions.filter(
    (o) => o.value !== DEFAULT_OPTION,
  );

  return (
    <li className={s.line2}>
      <Link href={url} onClick={onNavigate} className={s.thumb}>
        <Image
          width={image.width || 400}
          height={image.height || 500}
          alt={image.altText || product.title}
          src={image.url}
          className={s.thumbImage}
        />
      </Link>
      <div className={s.lineInfo}>
        <div className={s.lineTop}>
          <Link href={url} onClick={onNavigate} className={s.lineTitle}>
            {product.title}
          </Link>
          <span className={s.linePrice}>
            <Price
              amount={item.cost.totalAmount.amount}
              currencyCode={item.cost.totalAmount.currencyCode}
              showCode
            />
          </span>
        </div>
        {options.map((o) => (
          <p key={o.name} className={s.meta}>
            {o.name}: {o.value}
          </p>
        ))}
        <div className={`${s.meta} ${s.qty}`}>
          <span>Qty: {item.quantity}</span>
          <form action={() => update(item.merchandise.id, "minus")}>
            <button className={s.qtyButton} aria-label="Reduce quantity">−</button>
          </form>
          <form action={() => update(item.merchandise.id, "plus")}>
            <button className={s.qtyButton} aria-label="Increase quantity">+</button>
          </form>
        </div>
        <form
          className={s.removeForm}
          action={() => update(item.merchandise.id, "delete")}
        >
          <button className={s.remove} aria-label={`Remove ${product.title}`}>
            Remove
          </button>
        </form>
      </div>
    </li>
  );
}

/** Up to three products that are not in the cart, one shown at a time. */
function Suggestions({
  products,
  inCart,
  onAdd,
  onNavigate,
}: {
  products: Product[];
  inCart: string[];
  onAdd: (variant: Product["variants"][number], product: Product) => void;
  onNavigate: () => void;
}) {
  const [index, setIndex] = useState(0);
  const options = useMemo(
    () => products.filter((p) => !inCart.includes(p.id)).slice(0, 3),
    [products, inCart],
  );

  if (options.length === 0) return null;
  const current = options[index % options.length];
  const single = current.variants.length === 1 ? current.variants[0] : null;
  const image = current.featuredImage;
  const url = `/products/${current.handle}`;
  const step = (d: number) =>
    setIndex((i) => (i + d + options.length) % options.length);

  return (
    <div className={s.suggestion} aria-label="Add another piece">
      <Link href={url} onClick={onNavigate} className={s.thumb}>
        <Image
          width={image.width || 400}
          height={image.height || 500}
          alt={image.altText || current.title}
          src={image.url}
          className={s.thumbImage}
        />
      </Link>
      <div className={s.lineInfo}>
        <div className={s.lineTop}>
          <Link href={url} onClick={onNavigate} className={s.lineTitle}>
            {current.title}
          </Link>
          {options.length > 1 && (
            <span className={s.arrows}>
              <button onClick={() => step(-1)} aria-label="Previous piece">‹</button>
              <button onClick={() => step(1)} aria-label="Next piece">›</button>
            </span>
          )}
        </div>
        <p className={s.suggestionPrice}>
          <Price
            amount={current.priceRange.minVariantPrice.amount}
            currencyCode={current.priceRange.minVariantPrice.currencyCode}
            showCode
          />
        </p>
        {single ? (
          <form action={() => onAdd(single, current)}>
            <button className={s.addButton}>Add to cart</button>
          </form>
        ) : (
          <Link href={url} onClick={onNavigate} className={s.addButton}>
            Choose options
          </Link>
        )}
      </div>
    </div>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={s.checkoutButton}>
      {pending ? "Redirecting…" : "Checkout"}
    </button>
  );
}
