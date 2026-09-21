import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";
import { toggleActive } from "./actions";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: products, error } = await admin
    .from("products")
    .select("id, slug, title, price_cents, primary_image_path, is_active")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Admin · Products</h1>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-ink-soft hover:text-ink underline underline-offset-4"
          >
            View Orders →
          </Link>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full bg-ink px-5 py-2 font-display text-sm text-flash hover:bg-moss"
        >
          + New product
        </Link>
      </div>

      {error && (
        <p className="mt-8 border border-line bg-flash p-4 text-sm text-red-700">
          Couldn&apos;t load products: {error.message}
        </p>
      )}

      {!error && products?.length === 0 && (
        <p className="mt-8 text-sm text-ink/60">No products yet — add your first one.</p>
      )}

      <div className="mt-10 divide-y divide-line border-t border-line">
        {(products ?? []).map((p) => (
          <div key={p.id} className="flex items-center gap-4 py-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden border border-line bg-flash">
              <Image
                src={productImageUrl(p.primary_image_path)}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm text-ink">{p.title}</p>
              <p className="text-xs text-ink/50">
                {p.slug} · Rs. {(p.price_cents / 100).toLocaleString()} ·{" "}
                {p.is_active ? "Active" : "Hidden"}
              </p>
            </div>
            <Link
              href={`/admin/${p.id}`}
              className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink"
            >
              Edit
            </Link>
            <form action={toggleActive}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="is_active" value={String(p.is_active)} />
              <button className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
                {p.is_active ? "Hide" : "Unhide"}
              </button>
            </form>
            <DeleteProductButton id={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
