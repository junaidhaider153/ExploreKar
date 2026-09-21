import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    admin.from("products").select("*").eq("id", params.id).single(),
    admin.from("categories").select("id, name").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Edit product</h1>
      <ProductForm
        categories={categories ?? []}
        initial={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          description: product.description,
          price_cents: product.price_cents,
          category_id: product.category_id,
          tags: product.tags ?? [],
          width_cm: product.width_cm,
          height_cm: product.height_cm,
          depth_cm: product.depth_cm,
          is_active: product.is_active,
          imageUrl: productImageUrl(product.primary_image_path),
        }}
      />
    </div>
  );
}
