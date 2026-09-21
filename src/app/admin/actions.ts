"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";

export type ProductFormState = { error: string | null };

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function saveProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = String(formData.get("id") || "").trim() || undefined;
  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRupees = Number(formData.get("price_pkr") || 0);
  const category_id = String(formData.get("category_id") || "").trim() || null;
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const width_cm = numOrNull(formData.get("width_cm"));
  const height_cm = numOrNull(formData.get("height_cm"));
  const depth_cm = numOrNull(formData.get("depth_cm"));
  const is_active = formData.get("is_active") === "on";

  if (!slug || !title || !priceRupees || priceRupees <= 0) {
    return { error: "Slug, title, and a price greater than 0 are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }

  let primary_image_path: string | undefined;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    // `file.name` is fully attacker-controlled (an admin's browser sends
    // whatever the <input> was given, and this is also reachable by a raw
    // multipart request from anyone with valid admin cookies). Deriving the
    // storage path directly from an unsanitized name/extension risks writing
    // to an unexpected path in the bucket (e.g. a name like
    // "x/../../evil" with no dot would flow straight into the path below).
    // Only allow a fixed set of known-safe image extensions, and cap size
    // server-side too — the `accept="image/*"` on the form is a UX hint,
    // not a security control.
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: "Image is too large — please use a file under 5MB." };
    }
    const allowedExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = allowedExt[file.type];
    if (!ext) {
      return { error: "Please upload a JPEG, PNG, or WebP image." };
    }
    const path = `products/${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
    primary_image_path = path;
  }

  const row: Record<string, unknown> = {
    slug,
    title,
    description,
    price_cents: Math.round(priceRupees * 100),
    category_id,
    tags,
    width_cm,
    height_cm,
    depth_cm,
    is_active,
  };
  if (primary_image_path) row.primary_image_path = primary_image_path;

  if (id) {
    const { error } = await admin.from("products").update(row).eq("id", id);
    if (error) return { error: error.message };
  } else {
    if (!primary_image_path) {
      return { error: "An image is required when creating a new product." };
    }
    const { error } = await admin.from("products").insert(row);
    if (error) return { error: error.message };
  }

  // The public catalog uses ISR (revalidate: 60), so without this an admin
  // change wouldn't show up on the live site for up to a minute — confusing
  // right after you've just "saved" something.
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  redirect("/admin");
}

export async function toggleActive(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const id = String(formData.get("id"));
  const currentlyActive = formData.get("is_active") === "true";

  const { error } = await admin
    .from("products")
    .update({ is_active: !currentlyActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/catalog");
  redirect("/admin");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const id = String(formData.get("id"));
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/catalog");
  redirect("/admin");
}
