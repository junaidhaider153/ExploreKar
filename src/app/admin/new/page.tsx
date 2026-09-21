import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: categories } = await admin.from("categories").select("id, name").order("name");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">New product</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
