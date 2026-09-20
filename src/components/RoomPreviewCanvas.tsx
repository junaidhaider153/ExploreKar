"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Maximize2,
  RotateCw,
  Trash2,
  Copy,
  FlipHorizontal,
  ArrowUp,
  ArrowDown,
  Download,
  Plus,
  Bookmark,
  Check,
  Sparkles,
  Sliders,
  Layers,
  ChevronDown,
  Eye,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./Toast";
import { formatPrice } from "@/lib/format";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";

export type PlacedItem = {
  instanceId: string;
  productId: string;
  title: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  scale: number;
  rotationDeg: number;
  isFlipped: boolean;
  shadowIntensity: number; // 0..1
  zIndex: number;
};

/** Shape shared by both CURATED_PRODUCTS entries and DB product rows, as passed into the "add more pieces" tray. */
export type CuratedLikeProduct = {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string;
  primary_image_path?: string;
  price_cents?: number;
  currency?: string;
};

export function RoomPreviewCanvas({
  roomId,
  roomPhotoUrl,
  productId,
  productImageUrl,
  productTitle,
  initialPlacement,
  initialPriceCents = 0,
  initialCurrency = "PKR",
  initialItems,
  availableProducts = CURATED_PRODUCTS,
}: {
  roomId: string;
  roomPhotoUrl: string;
  productId?: string;
  productImageUrl?: string;
  productTitle?: string;
  initialPlacement?: { x: number; y: number; scale: number; rotationDeg: number };
  /** Real price for the single-item fallback path below — previously hardcoded to 4500000 (Rs. 45,000) regardless of the actual product. */
  initialPriceCents?: number;
  initialCurrency?: string;
  /** Pre-hydrated multi-item state, e.g. restoring every saved placement for a room rather than just one. Takes priority over the single-item props above. */
  initialItems?: PlacedItem[];
  availableProducts?: CuratedLikeProduct[];
}) {
  const { showToast } = useToast();
  const supabase = createClient();

  // Initialize items array: prefer a fully pre-hydrated set (e.g. restoring
  // every placement saved for this room), falling back to a single item
  // built from the individual product props (e.g. a fresh "preview this in
  // your room" deep link with nothing saved yet).
  const [items, setItems] = useState<PlacedItem[]>(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    if (productId && productImageUrl && productTitle) {
      return [
        {
          instanceId: `item-${Date.now()}-1`,
          productId,
          title: productTitle,
          imageUrl: productImageUrl,
          priceCents: initialPriceCents,
          currency: initialCurrency,
          x: initialPlacement?.x ?? 0.5,
          y: initialPlacement?.y ?? 0.6,
          scale: initialPlacement?.scale ?? 1,
          rotationDeg: initialPlacement?.rotationDeg ?? 0,
          isFlipped: false,
          shadowIntensity: 0.4,
          zIndex: 10,
        },
      ];
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(items[0]?.instanceId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showCatalogTray, setShowCatalogTray] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    instanceId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const activeItem = items.find((item) => item.instanceId === activeId);

  // Drag interaction handler
  const onPointerDown = useCallback(
    (e: React.PointerEvent, item: PlacedItem) => {
      e.stopPropagation();
      setActiveId(item.instanceId);
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragState.current = {
        instanceId: item.instanceId,
        startX: e.clientX,
        startY: e.clientY,
        origX: item.x,
        origY: item.y,
      };
    },
    []
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragState.current.startX) / bounds.width;
    const dy = (e.clientY - dragState.current.startY) / bounds.height;

    setItems((prev) =>
      prev.map((item) => {
        if (item.instanceId === dragState.current?.instanceId) {
          return {
            ...item,
            x: Math.min(0.95, Math.max(0.05, dragState.current.origX + dx)),
            y: Math.min(0.95, Math.max(0.05, dragState.current.origY + dy)),
          };
        }
        return item;
      })
    );
  }, []);

  const onPointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  // Update properties of active item
  const updateActiveItem = (updater: Partial<PlacedItem>) => {
    if (!activeId) return;
    setItems((prev) =>
      prev.map((item) => (item.instanceId === activeId ? { ...item, ...updater } : item))
    );
  };

  // Add a new piece from the tray
  const addPieceToRoom = (product: CuratedLikeProduct) => {
    const newItem: PlacedItem = {
      instanceId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id || product.slug,
      title: product.title,
      imageUrl: product.imageUrl || product.primary_image_path || "/placeholder-product.svg",
      priceCents: product.price_cents || 0,
      currency: product.currency || "PKR",
      x: 0.45 + (items.length % 3) * 0.05,
      y: 0.55 + (items.length % 3) * 0.05,
      scale: 0.9,
      rotationDeg: 0,
      isFlipped: false,
      shadowIntensity: 0.4,
      zIndex: items.length + 10,
    };
    setItems((prev) => [...prev, newItem]);
    setActiveId(newItem.instanceId);
    showToast(`Added ${product.title} to your room`, "success");
  };

  // Layer ordering actions
  const bringForward = () => {
    if (!activeId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.instanceId === activeId ? { ...item, zIndex: item.zIndex + 1 } : item
      )
    );
  };

  const sendBackward = () => {
    if (!activeId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.instanceId === activeId ? { ...item, zIndex: Math.max(1, item.zIndex - 1) } : item
      )
    );
  };

  const duplicateActive = () => {
    if (!activeItem) return;
    const duplicated: PlacedItem = {
      ...activeItem,
      instanceId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: Math.min(0.9, activeItem.x + 0.05),
      y: Math.min(0.9, activeItem.y + 0.05),
      zIndex: items.length + 11,
    };
    setItems((prev) => [...prev, duplicated]);
    setActiveId(duplicated.instanceId);
    showToast(`Duplicated ${activeItem.title}`, "info");
  };

  const deleteActive = () => {
    if (!activeId) return;
    setItems((prev) => prev.filter((item) => item.instanceId !== activeId));
    setActiveId(null);
    showToast("Piece removed from room", "info");
  };

  // Save room look (Supabase or LocalStorage)
  const saveRoomLook = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && roomId !== "guest-session") {
        // Save all placements to Supabase. Previously this looped without
        // checking each upsert's error, so a failure (e.g. an RLS or network
        // issue) was silently swallowed and reported as success regardless.
        // room_placements.product_id is TEXT with no FK (see
        // supabase/room-placements-product-id-migration.sql), so curated/
        // demo items can be saved too — this used to fail every time for
        // those specifically, for exactly that reason.
        const results = await Promise.all(
          items.map((item) =>
            supabase.from("room_placements").upsert(
              {
                room_id: roomId,
                product_id: item.productId,
                x: item.x,
                y: item.y,
                scale: item.scale,
                rotation_deg: item.rotationDeg,
              },
              { onConflict: "room_id,product_id" },
            ),
          ),
        );

        const failures = results.filter((r) => r.error);
        if (failures.length > 0) {
          console.error(
            "Failed to save some room placements:",
            failures.map((f) => f.error?.message),
          );
        }

        // Always also keep a local copy so a save is never lost outright —
        // useful if a later Supabase write partially fails or the user goes
        // offline mid-save.
        if (typeof window !== "undefined") {
          localStorage.setItem("explorekar_saved_look", JSON.stringify(items));
        }

        if (failures.length === 0) {
          showToast("Room layout saved to your account!", "success");
        } else if (failures.length < items.length) {
          showToast(`Saved ${items.length - failures.length} of ${items.length} pieces — one or two didn't sync.`, "info");
        } else {
          showToast("Could not save to your account — kept a local copy instead.", "error");
        }
      } else {
        // Save guest look in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("explorekar_saved_look", JSON.stringify(items));
        }
        showToast("Room design saved to this browser — sign in to keep it permanently.", "success");
      }
    } catch (err) {
      console.error("Failed to save room placements:", err);
      showToast("Could not save placement. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Composite snapshot image export onto HTML5 canvas
  const downloadSnapshot = async () => {
    setIsExporting(true);
    showToast("Generating high-resolution room snapshot…", "info");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Load background room image
      const bgImg = new window.Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = roomPhotoUrl;

      await new Promise((res, rej) => {
        bgImg.onload = res;
        bgImg.onerror = rej;
      });

      canvas.width = bgImg.width || 1920;
      canvas.height = bgImg.height || 1440;

      // Draw background room
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Sort items by zIndex before drawing
      const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

      for (const item of sortedItems) {
        const prodImg = new window.Image();
        prodImg.crossOrigin = "anonymous";
        prodImg.src = item.imageUrl;

        await new Promise((res) => {
          prodImg.onload = res;
          prodImg.onerror = res; // Skip on error rather than crashing whole snapshot
        });

        const targetX = item.x * canvas.width;
        const targetY = item.y * canvas.height;
        const baseWidth = canvas.width * 0.35 * item.scale;
        const baseHeight = (prodImg.height / prodImg.width) * baseWidth || baseWidth;

        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate((item.rotationDeg * Math.PI) / 180);
        if (item.isFlipped) ctx.scale(-1, 1);

        // Draw dynamic contact shadow
        if (item.shadowIntensity > 0) {
          ctx.shadowColor = "rgba(17, 22, 20, 0.45)";
          ctx.shadowBlur = 24 * item.shadowIntensity;
          ctx.shadowOffsetY = 14 * item.shadowIntensity;
        }

        ctx.drawImage(prodImg, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
        ctx.restore();
      }

      // Trigger download
      const link = document.createElement("a");
      link.download = `ExploreKar-Room-Design-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showToast("Room snapshot exported successfully!", "success");
    } catch (err) {
      console.error("Export snapshot error:", err);
      showToast("Snapshot export failed. Try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Studio Main Canvas */}
      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => setActiveId(null)}
        className="viewfinder-frame relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-3xl border border-line bg-ink/5 shadow-elevation"
      >
        {/* Background Room Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={roomPhotoUrl}
          alt="Your room space"
          className="pointer-events-none h-full w-full object-cover"
        />

        {/* Placed Furniture Items */}
        {items.map((item) => {
          const isSelected = item.instanceId === activeId;
          return (
            <div
              key={item.instanceId}
              onPointerDown={(e) => onPointerDown(e, item)}
              className={`absolute w-1/3 min-w-[100px] max-w-[55%] cursor-grab touch-none p-0 transition-shadow active:cursor-grabbing ${
                isSelected ? "z-30" : ""
              }`}
              style={{
                left: `${item.x * 100}%`,
                top: `${item.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotationDeg}deg) scale(${
                  item.scale
                }) ${item.isFlipped ? "scaleX(-1)" : ""}`,
                zIndex: item.zIndex,
              }}
            >
              {/* Bounding Box Brackets when Selected */}
              {isSelected && (
                <div className="pointer-events-none absolute -inset-2 border border-brass/80 rounded-xl">
                  <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-brass" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-brass" />
                  <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-brass" />
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-brass" />
                </div>
              )}

              {/* Placed Piece Image with Contact Shadow */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                draggable={false}
                className="w-full object-contain pointer-events-none"
                style={{
                  filter:
                    item.shadowIntensity > 0
                      ? `drop-shadow(0px ${10 * item.shadowIntensity}px ${
                          14 * item.shadowIntensity
                        }px rgba(17, 22, 20, 0.45))`
                      : "none",
                }}
              />
            </div>
          );
        })}

        {/* Studio Canvas Quick Stats Watermark */}
        <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 rounded-full glass-hud px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-brass" />
          <span>{items.length} {items.length === 1 ? "Piece" : "Pieces"} in Studio</span>
        </div>
      </div>

      {/* Selected Item Floating HUD Controls */}
      {activeItem ? (
        <div className="rounded-2xl border border-line bg-flash p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brass">
                Selected Active Piece
              </span>
              <h4 className="font-display text-base font-bold text-ink">{activeItem.title}</h4>
            </div>

            {/* Quick Transforms Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => updateActiveItem({ isFlipped: !activeItem.isFlipped })}
                className="flex items-center gap-1 rounded-lg border border-line bg-paper-light px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-paper-dark transition-colors"
                title="Mirror Flip"
              >
                <FlipHorizontal className="h-3.5 w-3.5 text-brass" />
                <span>Flip</span>
              </button>

              <button
                onClick={bringForward}
                className="flex items-center gap-1 rounded-lg border border-line bg-paper-light px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-paper-dark transition-colors"
                title="Bring Forward"
              >
                <ArrowUp className="h-3.5 w-3.5 text-moss" />
                <span>Forward</span>
              </button>

              <button
                onClick={sendBackward}
                className="flex items-center gap-1 rounded-lg border border-line bg-paper-light px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-paper-dark transition-colors"
                title="Send Backward"
              >
                <ArrowDown className="h-3.5 w-3.5 text-ink-muted" />
                <span>Backward</span>
              </button>

              <button
                onClick={duplicateActive}
                className="flex items-center gap-1 rounded-lg border border-line bg-paper-light px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-paper-dark transition-colors"
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5 text-ink-muted" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={deleteActive}
                className="flex items-center gap-1 rounded-lg border border-terracotta/30 bg-terracotta-light px-2.5 py-1.5 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-flash transition-colors"
                title="Remove Piece"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Precision Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
            {/* Scale Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-ink-soft mb-1.5">
                <span>Scale Size</span>
                <span className="font-mono text-brass">{Math.round(activeItem.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={2.2}
                step={0.05}
                value={activeItem.scale}
                onChange={(e) => updateActiveItem({ scale: Number(e.target.value) })}
                className="w-full accent-brass cursor-pointer"
              />
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-ink-soft mb-1.5">
                <span>Rotation Angle</span>
                <span className="font-mono text-brass">{activeItem.rotationDeg}°</span>
              </div>
              <input
                type="range"
                min={-90}
                max={90}
                step={1}
                value={activeItem.rotationDeg}
                onChange={(e) => updateActiveItem({ rotationDeg: Number(e.target.value) })}
                className="w-full accent-brass cursor-pointer"
              />
            </div>

            {/* Floor Contact Shadow */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-ink-soft mb-1.5">
                <span>Floor Shadow</span>
                <span className="font-mono text-moss">{Math.round(activeItem.shadowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={activeItem.shadowIntensity}
                onChange={(e) => updateActiveItem({ shadowIntensity: Number(e.target.value) })}
                className="w-full accent-moss cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-paper-light p-4 text-center">
          <p className="text-xs text-ink-muted">
            Tap any piece on the canvas to activate its scale, rotation, layer order, and shadow adjustments.
          </p>
        </div>
      )}

      {/* Global Studio Action Bar: Save Look & Export Snapshot */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setShowCatalogTray(!showCatalogTray)}
          className="flex items-center gap-2 rounded-full border border-line bg-flash px-4 py-2.5 text-xs font-semibold text-ink hover:bg-paper-dark transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 text-brass" />
          <span>{showCatalogTray ? "Hide Furniture Tray" : "Add More Pieces"}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-ink-muted transition-transform ${
              showCatalogTray ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadSnapshot}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-full border border-line bg-flash px-5 py-2.5 font-display text-xs font-bold text-ink hover:bg-paper-dark transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-brass" />
            <span>Export Snapshot</span>
          </button>

          <button
            onClick={saveRoomLook}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-display text-xs font-bold text-flash hover:bg-moss transition-colors shadow-sm disabled:opacity-50"
          >
            <Bookmark className="h-4 w-4 text-brass" />
            <span>{isSaving ? "Saving Look…" : "Save Room Look"}</span>
          </button>
        </div>
      </div>

      {/* Quick-Add Matching Furniture Tray */}
      {showCatalogTray && (
        <div className="rounded-3xl border border-line bg-paper-light p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brass-light text-brass flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-ink">
                Add Complementary Furniture to Your Room
              </h3>
            </div>
            <span className="text-xs text-ink-muted">Click any piece to add</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {availableProducts.slice(0, 6).map((prod) => (
              <div
                key={prod.id || prod.slug}
                onClick={() => addPieceToRoom(prod)}
                className="group relative cursor-pointer rounded-2xl border border-line bg-flash p-2.5 text-center transition-all duration-300 hover:border-brass/60 hover:shadow-elevation"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-paper-light">
                  <Image
                    src={prod.imageUrl || "/placeholder-product.svg"}
                    alt={prod.title}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="h-7 w-7 rounded-full bg-brass text-ink font-bold flex items-center justify-center shadow-md">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                <h5 className="mt-2 text-xs font-semibold text-ink truncate group-hover:text-brass transition-colors">
                  {prod.title}
                </h5>
                <p className="text-[11px] font-bold text-ink-muted">
                  {formatPrice(prod.price_cents ?? 0, prod.currency || "PKR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
