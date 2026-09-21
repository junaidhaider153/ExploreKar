"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Sparkles, Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useWishlist } from "@/lib/useWishlist";
import { useCart } from "@/lib/useCart";
import { useToast } from "@/components/Toast";

export type ProductCardData = {
  slug: string;
  title: string;
  price_cents: number;
  currency: string;
  imageUrl: string;
  categoryName?: string;
  width_cm?: number | null;
  height_cm?: number | null;
  depth_cm?: number | null;
  matchReasons?: string[];
  tags?: string[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || "/placeholder-product.svg");
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Use slug as product id for guest wishlist compatibility
  const productKey = product.slug;
  const wishlisted = isWishlisted(productKey);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: productKey,
      title: product.title,
      priceCents: product.price_cents,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
    showToast(`Added "${product.title}" to cart`, "success");
  };

  const dimensionSummary = product.width_cm && product.height_cm
    ? `${product.width_cm} × ${product.height_cm} cm`
    : null;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-line/80 bg-flash p-3.5 transition-all duration-300 hover:border-brass/40 hover:shadow-elevation">
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-paper-light border border-line/40">
        {/* Viewfinder corner accents on hover */}
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-brass" />
          <span className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-brass" />
          <span className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-brass" />
          <span className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-brass" />
        </div>

        {/* Top-Left Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          {product.categoryName && (
            <span className="rounded-full glass-hud px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              {product.categoryName}
            </span>
          )}
          {dimensionSummary && (
            <span className="rounded-full bg-flash/90 backdrop-blur-sm border border-line px-2 py-0.5 text-[10px] font-mono text-ink-muted">
              {dimensionSummary}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button — Top Right */}
        <button
          id={`wishlist-${product.slug}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(productKey);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm
            ${wishlisted
              ? "bg-terracotta text-flash scale-110"
              : "bg-flash/80 text-ink-muted hover:bg-terracotta hover:text-flash hover:scale-110"
            }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${wishlisted ? "fill-current" : ""}`}
          />
        </button>

        {/* Quick Add to Cart — below the wishlist heart, same corner */}
        <button
          id={`cart-add-${product.slug}`}
          onClick={handleAddToCart}
          aria-label={`Add ${product.title} to cart`}
          className="absolute right-2.5 top-[3.25rem] z-20 flex h-8 w-8 items-center justify-center rounded-full bg-flash/80 text-ink-muted backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-ink hover:text-flash hover:scale-110"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>

        {/* Product Image */}
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImgSrc("/placeholder-product.svg")}
        />

        {/* Quick "Preview in Room" Hover Overlay Action */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Link
            href={`/room?product=${encodeURIComponent(product.slug)}`}
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-ink/90 backdrop-blur-md py-2.5 text-xs font-display font-semibold text-flash shadow-glass hover:bg-moss transition-colors"
          >
            <Camera className="h-3.5 w-3.5 text-brass" />
            <span>Preview in Your Room</span>
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/catalog/${product.slug}`} className="focus:outline-none">
            <h3 className="font-display text-sm font-semibold text-ink group-hover:text-brass transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="mt-1 font-display text-sm font-bold text-ink">
            {formatPrice(product.price_cents, product.currency)}
          </p>
        </div>

        {/* Match Reasons Pill */}
        {product.matchReasons && product.matchReasons.length > 0 && (
          <div className="mt-2 flex items-center gap-1 rounded-lg bg-moss-light/80 px-2 py-1 text-[11px] font-medium text-moss">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span className="truncate">
              Matches: {product.matchReasons.map((r) => r.split(":")[1]).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
