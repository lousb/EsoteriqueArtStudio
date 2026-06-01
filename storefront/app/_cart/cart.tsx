"use client";

import Image from "next/image";
import { Link } from 'next-view-transitions'
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Price from "../../components/price";
import { DEFAULT_OPTION } from "../../shopify/constants";
import { CartItem } from "../../shopify/types";
import { createUrl } from "../../shopify/utils";
import { redirectToCheckout, saveCart } from "./cart-actions";
import { useCart } from "./cart-context";
import s from "./cart.module.css";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export function Cart() {
  const { cart, updateCartItem } = useCart();
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (cart) saveCart(cart);
  }, [cart]);

  return (
    <>
      <button
        aria-label={isOpen ? "Close cart" : "Open cart"}
        onClick={isOpen ? closeCart : openCart}
        className={s.cartButton}
      >
        <span className={s.cartLabel}>
          {isOpen ? "Close" : <>Cart{cart?.totalQuantity ? <span className={s.cartCount}>{cart.totalQuantity}</span> : null}</>}
        </span>
      </button>

      {isOpen && (
        <>
          <div className={s.overlay} onClick={closeCart} aria-hidden="true" />

          <aside className={s.cart} role="dialog" aria-label="Shopping cart" aria-modal="true">
            <div className={s.cartHeader}>
              <span className={s.cartTitle}>
                {cart?.totalQuantity ? `(${cart.totalQuantity})` : "Cart"}
              </span>
              <button className={s.closeButton} onClick={closeCart} aria-label="Close cart">×</button>
            </div>

            {!cart || cart.lines.length === 0 ? (
              <div className={s.emptyState}><p>Your cart is empty.</p></div>
            ) : (
              <div className={s.cartBody}>
                <ul className={s.itemList}>
                  {cart.lines
                    .sort((a, b) => a.merchandise.product.title.localeCompare(b.merchandise.product.title))
                    .map((item, i) => {
                      const merchandiseSearchParams = {} as MerchandiseSearchParams;
                      item.merchandise.selectedOptions.forEach(({ name, value }) => {
                        if (value !== DEFAULT_OPTION) merchandiseSearchParams[name.toLowerCase()] = value;
                      });
                      const merchandiseUrl = createUrl(
                        `/product/${item.merchandise.product.handle}`,
                        new URLSearchParams(merchandiseSearchParams),
                      );
                      const cartImage = item.merchandise.variantImage ?? item.merchandise.product.featuredImage;

                      return (
                        <li key={i} className={s.cartItem}>
                          <Link href={merchandiseUrl} onClick={closeCart} className={s.itemImageLink}>
                            <Image
                              width={80} height={80}
                              alt={cartImage.altText || item.merchandise.product.title}
                              src={cartImage.url}
                              className={s.itemImage}
                            />
                          </Link>
                          <div className={s.itemInfo}>
                            <Link href={merchandiseUrl} onClick={closeCart} className={s.itemTitle}>
                              {item.merchandise.product.title}
                            </Link>
                            {item.merchandise.title !== DEFAULT_OPTION && (
                              <p className={s.itemVariant}>{item.merchandise.title}</p>
                            )}
                            <Price amount={item.cost.totalAmount.amount} currencyCode={item.cost.totalAmount.currencyCode} />
                          </div>
                          <div className={s.itemControls}>
                            <div className={s.quantityRow}>
                              <EditItemQuantityButton item={item} type="minus" optimisticUpdate={updateCartItem} />
                              <span className={s.quantity}>{item.quantity}</span>
                              <EditItemQuantityButton item={item} type="plus" optimisticUpdate={updateCartItem} />
                            </div>
                            <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
                          </div>
                        </li>
                      );
                    })}
                </ul>

                <div className={s.cartFooter}>
                  <div className={s.totalRow}>
                    <span>Total</span>
                    <Price amount={cart.cost.totalAmount.amount} currencyCode={cart.cost.totalAmount.currencyCode} />
                  </div>
                  <p className={s.shippingNote}>Shipping calculated at checkout</p>
                  <form action={() => { redirectToCheckout(cart); }}>
                    <CheckoutButton />
                  </form>
                </div>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={s.checkoutButton} data-pending={pending}>
      {pending ? "Redirecting…" : "Proceed to Checkout"}
    </button>
  );
}

function DeleteItemButton({ item, optimisticUpdate }: { item: CartItem; optimisticUpdate: any }) {
  return (
    <form action={() => { optimisticUpdate(item.merchandise.id, "delete"); }}>
      <button type="submit" aria-label="Remove cart item" className={s.removeButton}>Remove</button>
    </form>
  );
}

function EditItemQuantityButton({ item, type, optimisticUpdate }: { item: CartItem; type: "plus" | "minus"; optimisticUpdate: any }) {
  const merchandiseId = item.merchandise.id;
  const quantity = type === "plus" ? item.quantity + 1 : item.quantity - 1;
  const label = type === "plus" ? "Increase item quantity" : "Reduce item quantity";
  return (
    <form action={() => { optimisticUpdate(merchandiseId, type); }}>
      <button type="submit" aria-label={label} className={s.qtyButton}>
        {type === "plus" ? "+" : "−"}
      </button>
    </form>
  );
}