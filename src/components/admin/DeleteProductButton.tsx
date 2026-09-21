"use client";

import { deleteProduct } from "@/app/admin/actions";

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!confirm("Delete this product? This can't be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-red-700 underline underline-offset-4 hover:text-red-900">
        Delete
      </button>
    </form>
  );
}
