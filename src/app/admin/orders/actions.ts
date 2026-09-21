"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "contacted", "confirmed", "fulfilled", "cancelled"] as const;

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
