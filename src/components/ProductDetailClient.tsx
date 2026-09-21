"use client";

import { Heart, Camera, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/lib/useWishlist";
import { useCart } from "@/lib/useCart";
import { useToast } from "@/components/Toast";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Props {
  productSlug: string;
  productTitle: string;
  productPriceCents: number;
  productCurrency: string;
  productImageUrl: string;
}

export function ProductDetailClient({
  productSlug,
  productTitle,
  productPriceCents,
  productCurrency,
  productImageUrl,
}: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const wishlisted = isWishlisted(productSlug);

  const whatsappUrl = buildWhatsAppUrl({
    title: productTitle,
    price_cents: productPriceCents,
    currency: productCurrency,
    slug: productSlug,
  });

  const handleAddToCart = () => {
    addToCart({
      productId: productSlug,
      title: productTitle,
      priceCents: productPriceCents,
      currency: productCurrency,
      imageUrl: productImageUrl,
    });
    showToast(`Added "${productTitle}" to cart`, "success");
  };

  return (
    <div className="space-y-3">
      {/* Add to Cart — the primary path into checkout */}
      <button
        id={`add-to-cart-${productSlug}`}
        onClick={handleAddToCart}
        className="flex items-center justify-center gap-2.5 w-full rounded-full bg-ink px-6 py-3.5 font-display text-sm font-bold text-flash shadow-sm hover:bg-moss active:scale-[0.98] transition-all duration-200"
      >
        <ShoppingBag className="h-4 w-4 text-brass" />
        <span>Add to Cart</span>
      </button>

      {/* WhatsApp Inquiry CTA */}
      <a
        id={`whatsapp-inquiry-${productSlug}`}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full rounded-full bg-[#25D366] px-6 py-3.5 font-display text-sm font-bold text-white shadow-sm hover:bg-[#1ebe5c] active:scale-[0.98] transition-all duration-200"
      >
        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-current shrink-0"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M11.973 0C5.362 0 0 5.362 0 11.973c0 2.092.542 4.06 1.49 5.773L.054 23.267a.5.5 0 0 0 .617.617l5.568-1.422A11.928 11.928 0 0 0 11.973 24C18.584 24 24 18.638 24 12.027 24 5.362 18.584 0 11.973 0zm0 21.818a9.762 9.762 0 0 1-5.014-1.38l-.36-.213-3.724.952.974-3.664-.234-.375a9.74 9.74 0 0 1-1.459-5.165c0-5.393 4.39-9.783 9.817-9.783 5.393 0 9.817 4.39 9.817 9.783 0 5.394-4.424 9.845-9.817 9.845z" />
        </svg>
        <span>Inquire via WhatsApp</span>
      </a>

      {/* Preview in Room CTA */}
      <Link
        href={`/room?product=${encodeURIComponent(productSlug)}`}
        className="flex items-center justify-center gap-2 w-full rounded-full bg-ink px-6 py-3 font-display text-xs font-bold text-flash hover:bg-moss transition-colors shadow-sm"
      >
        <Camera className="h-4 w-4 text-brass" />
        <span>Preview in Your Room</span>
      </Link>

      {/* Wishlist Toggle */}
      <button
        id={`wishlist-detail-${productSlug}`}
        onClick={() => toggleWishlist(productSlug)}
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        className={`flex items-center justify-center gap-2 w-full rounded-full border px-6 py-3 font-display text-xs font-semibold transition-all duration-300
          ${wishlisted
            ? "border-terracotta bg-terracotta-light text-terracotta"
            : "border-line bg-flash text-ink hover:border-terracotta/60 hover:text-terracotta"
          }`}
      >
        <Heart
          className={`h-4 w-4 transition-transform duration-200 ${wishlisted ? "fill-current scale-110" : ""}`}
        />
        <span>{wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}</span>
      </button>
    </div>
  );
}
