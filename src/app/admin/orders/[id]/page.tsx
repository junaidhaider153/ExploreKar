import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "../actions";

const STATUSES = ["pending", "contacted", "confirmed", "fulfilled", "cancelled"] as const;

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!order) notFound();

  const { data: items } = await admin
    .from("order_items")
    .select("title, price_cents, currency, quantity, image_url, product_id")
    .eq("order_id", order.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/admin/orders"
        className="text-sm font-medium text-ink-soft hover:text-ink underline underline-offset-4"
      >
        ← All Orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-ink-muted">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <form action={updateOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-full border border-line bg-flash px-4 py-2 text-sm font-medium text-ink capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-flash hover:bg-moss transition-colors"
          >
            Update
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper-light p-5">
          <h2 className="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
            Customer
          </h2>
          <p className="mt-2 text-sm text-ink">{order.guest_name}</p>
          <p className="text-sm text-ink-muted">{order.guest_email}</p>
          <p className="text-sm text-ink-muted">{order.guest_phone}</p>
          {order.user_id && (
            <p className="mt-2 text-xs text-moss">Signed in at checkout</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-paper-light p-5">
          <h2 className="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
            Delivery
          </h2>
          <p className="mt-2 text-sm text-ink whitespace-pre-line">{order.shipping_address}</p>
          {order.notes && (
            <p className="mt-2 text-sm text-ink-muted italic">&ldquo;{order.notes}&rdquo;</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-flash p-5">
        <h2 className="font-display text-xs font-bold uppercase tracking-wide text-ink-muted">
          Items
        </h2>
        <div className="mt-4 space-y-3">
          {items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url || "/placeholder-product.svg"}
                alt=""
                className="h-12 w-12 rounded-lg border border-line object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-ink">{item.title}</p>
                <p className="text-xs text-ink-muted">
                  Qty {item.quantity} · product_id: {item.product_id}
                </p>
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
      </div>
    </div>
  );
}
