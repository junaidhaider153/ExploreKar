"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/useCart";

export type PlaceOrderInput = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  shippingAddress: string;
  notes: string;
  items: CartItem[];
};

export type PlaceOrderResult = { orderId: string } | { error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const { guestName, guestEmail, guestPhone, shippingAddress, notes, items } = input;

  if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim() || !shippingAddress.trim()) {
    return { error: "Please fill in your name, email, phone, and delivery address." };
  }
  if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
    return { error: "That email address doesn't look right." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Your cart is empty." };
  }

  // Recompute the subtotal server-side from each item's price and quantity —
  // never trust a client-submitted total, since the client is exactly what
  // someone would tamper with to pay less than the real price.
  const currency = items[0]?.currency || "PKR";
  const subtotalCents = items.reduce((sum, item) => {
    const price = Number(item.priceCents);
    const qty = Number(item.quantity);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(qty) || qty <= 0) {
      return sum; // skip malformed entries rather than let them corrupt the total
    }
    return sum + price * qty;
  }, 0);

  if (subtotalCents <= 0) {
    return { error: "Your cart total looks invalid — please refresh and try again." };
  }

  // Attach the signed-in user's id if there is one (order history isn't
  // built yet, but there's no reason to throw this away — a future "my
  // orders" page can use it without a backfill).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guests have no session for RLS to scope to, and orders contain PII, so
  // this write goes through the service-role client — a trusted server
  // context — rather than a client-side insert under a public RLS policy.
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim(),
      shipping_address: shippingAddress.trim(),
      notes: notes.trim(),
      subtotal_cents: subtotalCents,
      currency,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Failed to create order:", orderError?.message);
    return { error: "Could not place your order — please try again." };
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      title: item.title,
      price_cents: item.priceCents,
      currency: item.currency,
      quantity: item.quantity,
      image_url: item.imageUrl,
    })),
  );

  if (itemsError) {
    // The order row exists but its items don't — surface this loudly rather
    // than leaving a silently incomplete order for the admin to puzzle over.
    console.error(`Order ${order.id} created but order_items failed:`, itemsError.message);
    return { error: "Your order was started but couldn't be completed — please try again." };
  }

  return { orderId: order.id };
}
