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

        // Merge a guest wishlist into the account on first load after
        // signing in. Previously the guest's localStorage wishlist was just
        // discarded here — the fetch below would overwrite it with whatever
        // (usually nothing) already existed in `wishlists` for this user.
        const guestIds = readGuestWishlist();
        if (guestIds.length > 0) {
          const { error: mergeError } = await supabase
            .from("wishlists")
            .upsert(
              guestIds.map((productId) => ({ user_id: user.id, product_id: productId })),
              { onConflict: "user_id,product_id", ignoreDuplicates: true },
            );
          if (mergeError) {
            console.error("Failed to merge guest wishlist into account:", mergeError.message);
          } else {
            writeGuestWishlist([]); // merged — clear so it doesn't re-merge (and re-add anything since removed) on every future login
          }
        }

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
        // Previously these errors weren't checked at all — a failed insert/
        // delete (RLS hiccup, network blip) left the UI showing the toggle
        // as successful while the database silently disagreed. Revert the
        // optimistic update and log it so it's at least diagnosable, same
        // pattern as the saveRoomLook fix in RoomPreviewCanvas.
        if (already) {
          const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);
          if (error) {
            console.error("Failed to remove from wishlist:", error.message);
            setWishlistIds(wishlistIds);
          }
        } else {
          const { error } = await supabase
            .from("wishlists")
            .insert({ user_id: userId, product_id: productId });
          if (error) {
            console.error("Failed to add to wishlist:", error.message);
            setWishlistIds(wishlistIds);
          }
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
