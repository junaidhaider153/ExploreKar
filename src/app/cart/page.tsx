"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, isLoaded, removeFromCart, setQuantity, subtotalCents, currency } = useCart();

  if (!isLoaded) {
    return <div className="mx-auto max-w-4xl px-6 py-16" />; // avoid a flash of "empty cart" before localStorage is read
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-ink/20" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Browse the collection and add pieces you like.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-sm font-bold text-flash hover:bg-moss transition-colors"
        >
          Shop the Collection
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Your Cart</h1>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl || "/placeholder-product.svg"}
              alt={item.title}
              className="h-20 w-20 rounded-xl border border-line object-cover"
            />

            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-semibold text-ink truncate">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {formatPrice(item.priceCents, item.currency)}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-line px-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-paper-dark hover:text-ink"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-medium text-ink">{item.quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-paper-dark hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="w-24 text-right font-display text-sm font-bold text-ink">
              {formatPrice(item.priceCents * item.quantity, item.currency)}
            </p>

            <button
              type="button"
              aria-label={`Remove ${item.title} from cart`}
              onClick={() => removeFromCart(item.productId)}
              className="text-ink-muted hover:text-terracotta transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex items-center gap-4 text-lg">
          <span className="text-ink-muted">Subtotal</span>
          <span className="font-display font-bold text-ink">
            {formatPrice(subtotalCents, currency)}
          </span>
        </div>
        <p className="text-xs text-ink-muted">
          Delivery and final payment details are confirmed via WhatsApp after checkout.
        </p>
        <Link
          href="/checkout"
          className="flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 font-display text-sm font-bold text-flash hover:bg-moss transition-colors shadow-elevation"
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4 text-brass" />
        </Link>
      </div>
    </div>
  );
}
