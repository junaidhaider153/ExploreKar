"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const { items, isLoaded, subtotalCents, currency, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill email for a signed-in user — checkout still works without an
  // account (guest checkout), this is just a convenience when we already
  // know it.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setGuestEmail(user.email);
    });
  }, [supabase]);

  useEffect(() => {
    if (isLoaded && items.length === 0) router.replace("/cart");
  }, [isLoaded, items.length, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      guestName,
      guestEmail,
      guestPhone,
      shippingAddress,
      notes,
      items,
    });

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push(`/order/${result.orderId}/confirmation`);
  }

  if (!isLoaded || items.length === 0) {
    return <div className="mx-auto max-w-4xl px-6 py-16" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to cart
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">Checkout</h1>
      <p className="mt-2 text-sm text-ink-muted">
        No account needed. Once you submit, we&apos;ll confirm payment and delivery with you over WhatsApp.
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="guestName"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-flash px-4 py-2.5 text-sm text-ink focus-visible:border-brass focus-visible:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="guestEmail" className="block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="guestEmail"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-flash px-4 py-2.5 text-sm text-ink focus-visible:border-brass focus-visible:outline-none"
              />
            </div>
            <div>
              <label htmlFor="guestPhone" className="block text-sm font-medium text-ink">
                Phone (WhatsApp)
              </label>
              <input
                id="guestPhone"
                type="tel"
                required
                placeholder="03XX XXXXXXX"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-flash px-4 py-2.5 text-sm text-ink focus-visible:border-brass focus-visible:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="shippingAddress" className="block text-sm font-medium text-ink">
              Delivery address
            </label>
            <textarea
              id="shippingAddress"
              required
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-flash px-4 py-2.5 text-sm text-ink focus-visible:border-brass focus-visible:outline-none"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink">
              Notes <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferred delivery time, gate code, etc."
              className="mt-1 w-full rounded-xl border border-line bg-flash px-4 py-2.5 text-sm text-ink focus-visible:border-brass focus-visible:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-display text-sm font-bold text-flash hover:bg-moss transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing order…
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-line bg-paper-light p-6">
          <h2 className="font-display text-sm font-bold text-ink">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl || "/placeholder-product.svg"}
                  alt=""
                  className="h-12 w-12 rounded-lg border border-line object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-ink">{item.title}</p>
                  <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
                </div>
                <p className="font-medium text-ink">
                  {formatPrice(item.priceCents * item.quantity, item.currency)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 font-display text-sm font-bold text-ink">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
