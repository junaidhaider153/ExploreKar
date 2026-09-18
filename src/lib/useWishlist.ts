"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const GUEST_WISHLIST_KEY = "explorekar_guest_wishlist";

function readGuestWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable
  }
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Load wishlist on mount
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsAuthenticated(true);
        setUserId(user.id);
        // Fetch from Supabase
        const { data } = await supabase
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);
        if (data) {
          setWishlistIds(data.map((row: { product_id: string }) => row.product_id));
        }
      } else {
        // Guest: use localStorage
        setWishlistIds(readGuestWishlist());
      }
    }
    load();
  }, [supabase]);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const already = wishlistIds.includes(productId);
      const next = already
        ? wishlistIds.filter((id) => id !== productId)
        : [...wishlistIds, productId];

      setWishlistIds(next); // Optimistic update

      if (isAuthenticated && userId) {
        if (already) {
          await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);
        } else {
          await supabase
            .from("wishlists")
            .insert({ user_id: userId, product_id: productId });
        }
      } else {
        writeGuestWishlist(next);
      }
    },
    [wishlistIds, isAuthenticated, userId, supabase]
  );

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    isWishlisted,
    toggleWishlist,
  };
}
