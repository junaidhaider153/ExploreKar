"use client";

import { useState, useEffect, useCallback } from "react";

const CART_KEY = "explorekar_cart";
// Fired on every write so other mounted instances of this hook (e.g. the
// Navbar's cart badge and the /cart page) stay in sync within the same tab —
// the native `storage` event only fires in *other* tabs, not the one that
// made the change.
const CART_EVENT = "explorekar-cart-updated";

export type CartItem = {
  productId: string;
  title: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
  quantity: number;
};

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

/**
 * The cart is deliberately kept client-side only (no `carts` DB table, no
 * server sync) rather than mirroring the DB-backed pattern used for
 * wishlists/room placements. Rationale: there's no live payment integration
 * yet, so a cart's entire lifecycle is "build it up, then submit it wholesale
 * at checkout" — there's no scenario yet where a cart needs to survive
 * across devices or be resumed server-side days later. If that changes
 * (e.g. "save my cart for later" becomes a real request), promote this to a
 * DB-backed table with the same guest+merge-on-login pattern as useWishlist.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setIsLoaded(true);

    const handleUpdate = () => setItems(readCart());
    window.addEventListener(CART_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(CART_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const current = readCart();
    const existing = current.find((i) => i.productId === item.productId);
    const next = existing
      ? current.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...current, { ...item, quantity }];
    writeCart(next);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    writeCart(readCart().filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      writeCart(readCart().filter((i) => i.productId !== productId));
      return;
    }
    writeCart(readCart().map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
  }, []);

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const currency = items[0]?.currency ?? "PKR";

  return {
    items,
    isLoaded,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    subtotalCents,
    itemCount,
    currency,
  };
}
