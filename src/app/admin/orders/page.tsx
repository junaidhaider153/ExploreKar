import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-brass-light text-brass",
  contacted: "bg-paper-dark text-ink",
  confirmed: "bg-moss-light text-moss",
  fulfilled: "bg-moss text-flash",
  cancelled: "bg-terracotta-light text-terracotta",
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from("orders")
    .select("id, guest_name, guest_email, status, subtotal_cents, currency, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Orders</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-ink-soft hover:text-ink underline underline-offset-4"
        >
          ← Back to Products
        </Link>
      </div>

      {error && (
        <p className="mt-8 rounded-xl border border-line bg-flash p-4 text-sm text-red-700">
          Couldn&apos;t load orders: {error.message}
        </p>
      )}

      {!error && orders?.length === 0 && (
        <p className="mt-8 text-sm text-ink-muted">No orders yet.</p>
      )}

      <div className="mt-8 divide-y divide-line border-y border-line">
        {orders?.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between gap-4 py-4 hover:bg-paper-light/60 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink-muted">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="font-display text-sm font-semibold text-ink truncate">
                {order.guest_name}
              </p>
              <p className="text-xs text-ink-muted truncate">{order.guest_email}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-paper-dark text-ink"}`}
              >
                {order.status}
              </span>
              <p className="w-24 text-right font-display text-sm font-bold text-ink">
                {formatPrice(order.subtotal_cents, order.currency)}
              </p>
              <p className="w-24 text-right text-xs text-ink-muted">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
