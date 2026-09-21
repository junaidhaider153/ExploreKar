import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { buildOrderWhatsAppUrl } from "@/lib/whatsapp";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const admin = createAdminClient();

  // Fetched by exact UUID only — see supabase/orders-migration.sql for why
  // this uses the service-role client instead of an RLS policy: the order
  // id itself (cryptographically random, never listed or searchable) is the
  // access control here, the same "ID as capability" pattern Stripe/Shopify
  // use for guest order confirmations.
  const { data: order } = await admin
    .from("orders")
    .select("id, guest_name, guest_email, guest_phone, shipping_address, notes, status, subtotal_cents, currency, created_at")
    .eq("id", params.orderId)
    .single();

  if (!order) notFound();

  const { data: itemRows } = await admin
    .from("order_items")
    .select("title, price_cents, currency, quantity, image_url")
    .eq("order_id", order.id);

  const items = itemRows ?? [];
  const shortId = order.id.slice(0, 8).toUpperCase();

  const whatsappUrl = buildOrderWhatsAppUrl({
    id: order.id,
    items: items.map((i) => ({
      title: i.title,
      price_cents: i.price_cents,
      currency: i.currency,
      quantity: i.quantity,
    })),
    subtotal_cents: order.subtotal_cents,
    currency: order.currency,
    guest_name: order.guest_name,
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-moss" />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
        Order Received
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Order <span className="font-mono font-semibold text-ink">#{shortId}</span> — we don&apos;t
        have live payments yet, so please send this order to us on WhatsApp to confirm payment and
        delivery.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 font-display text-sm font-bold text-white shadow-sm hover:bg-[#1ebe5c] transition-all"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M11.973 0C5.362 0 0 5.362 0 11.973c0 2.092.542 4.06 1.49 5.773L.054 23.267a.5.5 0 0 0 .617.617l5.568-1.422A11.928 11.928 0 0 0 11.973 24C18.584 24 24 18.638 24 12.027 24 5.362 18.584 0 11.973 0zm0 21.818a9.762 9.762 0 0 1-5.014-1.38l-.36-.213-3.724.952.974-3.664-.234-.375a9.74 9.74 0 0 1-1.459-5.165c0-5.393 4.39-9.783 9.817-9.783 5.393 0 9.817 4.39 9.817 9.783 0 5.394-4.424 9.845-9.817 9.845z" />
        </svg>
        Send Order via WhatsApp
      </a>

      <div className="mt-10 rounded-2xl border border-line bg-paper-light p-6 text-left">
        <h2 className="font-display text-sm font-bold text-ink">Order Summary</h2>
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url || "/placeholder-product.svg"}
                alt=""
                className="h-12 w-12 rounded-lg border border-line object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-ink">{item.title}</p>
                <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
              </div>
              <p className="font-medium text-ink">
                {formatPrice(item.price_cents * item.quantity, item.currency)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 font-display text-sm font-bold text-ink">
          <span>Total</span>
          <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
        </div>
        <div className="mt-4 border-t border-line pt-4 text-xs text-ink-muted space-y-1">
          <p>Deliver to: {order.shipping_address}</p>
          <p>Contact: {order.guest_phone} · {order.guest_email}</p>
        </div>
      </div>

      <Link
        href="/catalog"
        className="mt-8 inline-block text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        Continue shopping
      </Link>
    </div>
  );
}
