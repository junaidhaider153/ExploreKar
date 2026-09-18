"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles, Grid } from "lucide-react";
import { ProductCard, type ProductCardData } from "./ProductCard";
import {
  CURATED_CATEGORIES,
  CURATED_ROOM_TYPES,
  CURATED_STYLES,
} from "@/lib/catalog-data";

export function CatalogFilters({
  initialProducts,
}: {
  initialProducts: ProductCardData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active filters count
  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedRoom !== "all" ? 1 : 0) +
    (selectedStyle !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedRoom("all");
    setSelectedStyle("all");
    setSortBy("featured");
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Search filter
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchCategory = p.categoryName?.toLowerCase().includes(query);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(query));
          if (!matchTitle && !matchCategory && !matchTags) return false;
        }

        // Category filter
        if (selectedCategory !== "all") {
          const matchCategory =
            p.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
            p.tags?.some((t) => t.toLowerCase() === `category:${selectedCategory}`);
          if (!matchCategory) return false;
        }

        // Room filter
        if (selectedRoom !== "all") {
          const matchRoom = p.tags?.some(
            (t) =>
              t.toLowerCase() === `room:${selectedRoom}` ||
              t.toLowerCase().includes(selectedRoom),
          );
          if (!matchRoom) return false;
        }

        // Style filter
        if (selectedStyle !== "all") {
          const matchStyle = p.tags?.some(
            (t) =>
              t.toLowerCase() === `style:${selectedStyle}` ||
              t.toLowerCase().includes(selectedStyle),
          );
          if (!matchStyle) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price_cents - b.price_cents;
        if (sortBy === "price-desc") return b.price_cents - a.price_cents;
        if (sortBy === "name") return a.title.localeCompare(b.title);
        return 0; // featured default order
      });
  }, [initialProducts, searchQuery, selectedCategory, selectedRoom, selectedStyle, sortBy]);

  return (
    <div className="mt-8 space-y-8">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search walnut tables, bouclé chairs, lamps, rugs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-line bg-flash pl-10 pr-10 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brass focus:ring-1 focus:ring-brass transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-0.5"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Controls: Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 rounded-full border border-line bg-flash px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-brass" />
            <span className="text-xs text-ink-muted hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-xs font-medium text-ink focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 rounded-full border border-line bg-flash px-4 py-2 text-xs font-medium text-ink shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-brass" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-brass text-[10px] font-bold text-flash flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Bar (Always Visible on Desktop) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-ink text-flash shadow-sm"
              : "border border-line bg-flash text-ink-soft hover:border-ink/40"
          }`}
        >
          All Items ({initialProducts.length})
        </button>
        {CURATED_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
          return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(isSelected ? "all" : cat.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-ink text-flash shadow-sm"
                  : "border border-line bg-flash text-ink-soft hover:border-ink/40"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Bar: Room Compatibility & Style Badges */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-2xl border border-line/60 bg-paper-light p-4 ${
          showMobileFilters ? "block" : "hidden md:grid"
        }`}
      >
        {/* Room Compatibility */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Room Type
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedRoom("all")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                selectedRoom === "all"
                  ? "bg-brass text-flash font-medium"
                  : "bg-flash border border-line text-ink-soft hover:border-brass/40"
              }`}
            >
              Any Room
            </button>
            {CURATED_ROOM_TYPES.map((room) => {
              const isSelected = selectedRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(isSelected ? "all" : room.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    isSelected
                      ? "bg-brass text-flash font-medium"
                      : "bg-flash border border-line text-ink-soft hover:border-brass/40"
                  }`}
                >
                  {room.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Persona */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Design Aesthetic
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedStyle("all")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                selectedStyle === "all"
                  ? "bg-moss text-flash font-medium"
                  : "bg-flash border border-line text-ink-soft hover:border-moss/40"
              }`}
            >
              Any Style
            </button>
            {CURATED_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(isSelected ? "all" : style.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    isSelected
                      ? "bg-moss text-flash font-medium"
                      : "bg-flash border border-line text-ink-soft hover:border-moss/40"
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Actions */}
        <div className="flex flex-col justify-end items-start sm:items-end">
          {activeFiltersCount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-medium">
                {filteredProducts.length} results
              </span>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-full border border-terracotta/30 bg-terracotta-light px-3 py-1 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-flash transition-colors"
              >
                <X className="h-3 w-3" />
                Reset Filters
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">
              Showing all {filteredProducts.length} pieces
            </span>
          )}
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="my-16 rounded-2xl border border-dashed border-line bg-flash py-16 px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-dark text-ink-muted">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">
            No matching pieces found
          </h3>
          <p className="mt-1 text-xs text-ink-muted max-w-sm mx-auto">
            Try adjusting your search terms or clearing specific category and room filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-5 rounded-full bg-ink px-5 py-2 text-xs font-semibold text-flash hover:bg-moss transition-colors"
          >
            Show All Products
          </button>
        </div>
      )}
    </div>
  );
}
