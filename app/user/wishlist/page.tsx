"use client";
import React from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useRequireAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { createProductHref } from "@/app/data/products";
import { ProductGridSkeleton } from "@/app/components/Skeletons";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { flyImageToCart } from "@/app/lib/flyToCart";

export default function WishlistPage() {
  const { addItem, isVariantInCart } = useCart();
  const { items, removeItem } = useWishlist();
  const { isLoading, isAuthenticated } = useRequireAuth('/user/auth');

  if (isLoading) {
    return (
      <div className="space-y-12">
        <header className="animate-pulse">
          <div className="h-12 w-64 bg-surface-container-high rounded-lg mb-4" />
          <div className="h-4 w-full bg-surface-container-high rounded mb-2" />
          <div className="h-4 w-2/3 bg-surface-container-high rounded" />
        </header>
        <ProductGridSkeleton count={6} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleAddToCart = (item: { id: number; name: string; price: number; image: string; collection: string }, event?: React.MouseEvent) => {
    try {
      const card = (event?.currentTarget as HTMLElement | null)?.closest?.("[data-product-card]") as HTMLElement | null;
      const img = card?.querySelector?.("img") as HTMLImageElement | null;
      const fromRect = img?.getBoundingClientRect?.() ?? (event?.currentTarget as HTMLElement | undefined)?.getBoundingClientRect?.();
      const imageUrl = String(img?.currentSrc || img?.src || item.image || "").trim();
      if (fromRect && imageUrl) {
        flyImageToCart({ imageUrl, fromRect, durationMs: 950 });
      }
    } catch {
      // ignore
    }

    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price || 0),
      color: "",
      size: "Default",
      image: item.image,
      collection: item.collection || "WISHLIST",
    });
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-headline tracking-tighter text-primary mb-4 italic">The Curated Harvest</h1>
        <p className="text-on-surface-variant max-w-xl font-body leading-relaxed text-sm lg:text-base">
          A personal selection of our finest agrarian treasures. These favorites represent the pinnacle of artisanal purity and golden heritage.
        </p>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
        {items.map((item) => (
          <div key={item.id} data-product-card className="group">
            <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-surface-container-high mb-4">
              <ResilientProductImage
                sources={[item.image]}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={item.name}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md p-2 rounded-full text-secondary transition-all hover:bg-surface hover:text-primary active:scale-90 shadow-sm z-10"
              >
                <span className="material-symbols-outlined text-[20px] icon-filled">favorite</span>
              </button>

              {item.collection ? (
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="bg-primary text-on-primary px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
                    {item.collection}
                  </span>
                </div>
              ) : (
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-headline text-[9px] text-center p-1 leading-tight shadow-md">
                    Heritage Badge
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <Link href={createProductHref(item)} className="font-headline text-2xl font-bold text-primary mb-1 block hover:underline">
                  {item.name}
                </Link>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">{item.collection || "Wishlist"}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="font-headline text-xl font-bold text-secondary">₹{Number(item.price || 0)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => handleAddToCart(item, e)}
              disabled={isVariantInCart(item.id, "Default", "")}
              className={`w-full py-3.5 rounded-full font-label text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isVariantInCart(item.id, "Default", "") ? "bg-secondary text-white shadow-secondary/20 disabled:opacity-75" : "bg-primary text-on-primary hover:bg-primary-container shadow-primary/20"
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isVariantInCart(item.id, "Default", "") ? "done" : "shopping_cart"}
              </span>
              {isVariantInCart(item.id, "Default", "") ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="rounded-2xl border border-outline-variant/30 p-10 text-center text-on-surface-variant">
          Your wishlist is empty.
        </div>
      )}

      {/* Empty State / Suggestions */}
      <div className="mt-20 p-8 lg:p-12 rounded-3xl bg-primary-container text-on-primary relative overflow-hidden">
        {/* Pattern Background Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-headline italic mb-4 font-bold">The Artisan's Selection</h2>
            <p className="text-primary-fixed-dim/90 max-w-md mb-8 leading-relaxed font-body text-sm">
              Discover products that pair perfectly with your favorites. Curated monthly by our head agronomist.
            </p>
            <Link href="/shop" className="inline-block px-8 py-3.5 border border-secondary rounded-full text-secondary font-label text-xs font-bold tracking-widest uppercase hover:bg-secondary hover:text-white transition-all shadow-sm bg-surface/5 backdrop-blur-sm">
              Explore Collections
            </Link>
          </div>
          <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-secondary/30 shrink-0 shadow-2xl">
            <img
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuChldJanv9HUYcc86nCudTMxqBrQhJ6PxLFngBXQkpX5CQlN0WVPvbzlPtGsDahtWYLuHf1vT2c-cg-ILTeN_-UQ9Ah99_Ks3SpediiIK5JGW3VMunWU5eTUXGEaB1olH7s8u0T-2jU6p-QS4fI7qlveCji_kpzNswayAF-O4FH8a_FB__UVTeP6SZ7swIKY6gsFpUHuKaqzLhymmQ14t2Qu2IUVKbnJ-lFDhrmaxIGOZKN60L8NHHa1fHsPMbVSPRNQszo-rV5R7o"
              alt="Organic soil and gold dust"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
