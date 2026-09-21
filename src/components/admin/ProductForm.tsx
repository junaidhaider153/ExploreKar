"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveProduct, type ProductFormState } from "@/app/admin/actions";

type Category = { id: string; name: string };

type InitialProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  category_id: string | null;
  tags: string[];
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  is_active: boolean;
  imageUrl: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-3 font-display text-sm text-flash hover:bg-moss disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

const inputClass =
  "mt-1 w-full border border-line bg-flash px-3 py-2 text-ink focus-visible:border-brass";

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: InitialProduct;
}) {
  const [state, formAction] = useFormState<ProductFormState, FormData>(saveProduct, {
    error: null,
  });

  return (
    <form action={formAction} encType="multipart/form-data" className="mt-8 space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label htmlFor="title" className="block text-sm text-ink/70">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm text-ink/70">
          Slug <span className="text-ink/40">(url-safe, e.g. walnut-coffee-table)</span>
        </label>
        <input
          id="slug"
          name="slug"
          required
          pattern="[a-z0-9-]+"
          defaultValue={initial?.slug}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm text-ink/70">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price_pkr" className="block text-sm text-ink/70">
            Price (Rs.)
          </label>
          <input
            id="price_pkr"
            name="price_pkr"
            type="number"
            min={1}
            step="0.01"
            required
            defaultValue={initial ? initial.price_cents / 100 : undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category_id" className="block text-sm text-ink/70">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={initial?.category_id ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm text-ink/70">
          Tags <span className="text-ink/40">(comma-separated, e.g. style:minimal, room:office)</span>
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={initial?.tags.join(", ")}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="width_cm" className="block text-sm text-ink/70">
            Width (cm)
          </label>
          <input
            id="width_cm"
            name="width_cm"
            type="number"
            step="0.1"
            defaultValue={initial?.width_cm ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="height_cm" className="block text-sm text-ink/70">
            Height (cm)
          </label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            step="0.1"
            defaultValue={initial?.height_cm ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="depth_cm" className="block text-sm text-ink/70">
            Depth (cm)
          </label>
          <input
            id="depth_cm"
            name="depth_cm"
            type="number"
            step="0.1"
            defaultValue={initial?.depth_cm ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm text-ink/70">
          {initial ? "Replace photo" : "Photo"}
        </label>
        {initial?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initial.imageUrl} alt="" className="mt-2 h-24 w-24 border border-line object-cover" />
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          required={!initial}
          className="mt-2 block text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" name="is_active" defaultChecked={initial?.is_active ?? true} />
        Visible in catalog
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton label={initial ? "Save changes" : "Create product"} />
    </form>
  );
}
