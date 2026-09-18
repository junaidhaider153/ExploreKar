const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Public URL for a file in the public "product-images" bucket. */
export function productImageUrl(path: string) {
  if (!SUPABASE_URL) return "/placeholder-product.svg";
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}
