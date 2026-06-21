"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { useCart } from "@/app/context/CartContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { createProductHref, getProductImageSources, type Product } from "@/app/data/products";
import { fetchFeaturedProducts } from "@/app/lib/productsClient";
import { peekCached, putCached } from "@/app/lib/clientCache";
import { flyImageToCart } from "@/app/lib/flyToCart";

// --- Helpers ---
function formatMoney(currencySymbol: string, value: number) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${currencySymbol}${amount.toLocaleString()}`;
}

function discountPct(original: number | undefined, selling: number) {
  if (!original || original <= selling) return 0;
  return Math.min(95, Math.round(((original - selling) / original) * 100));
}

export default function SpotlightProductsSection({
  initialProducts = [],
  managed = false,
}: {
  initialProducts?: Product[];
  managed?: boolean;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const { addItem, isVariantInCart } = useCart();
  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
    } else if (managed) {
      setProducts([]);
      setLoading(false);
    }
  }, [initialProducts, managed]);

  useEffect(() => {
    if (managed) return;
    if (initialProducts.length > 0) return;
    const cached = peekCached<Product[]>("products:all").data;
    if (Array.isArray(cached) && cached.length) {
      setProducts(cached);
      setLoading(false);
    }

    fetchFeaturedProducts()
      .then((data) => {
        putCached("products:all", 5 * 60 * 1000, data);
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [initialProducts.length, managed]);

  const spotlight = useMemo(() => products.slice(0, 5), [products]);

  return (
    <section className="pt-10 pb-6 lg:py-20 bg-[#F9F9F7]">
      <div className="container mx-auto px-3 lg:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 lg:mb-10 gap-3">
          <div className="space-y-1 lg:space-y-2">
            <span className="text-[10px] lg:text-sm font-bold uppercase tracking-[0.2em] text-emerald-700/70">
              Curated Collection
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Today’s <span className="text-emerald-800">Spotlight</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex text-sm font-semibold text-emerald-800 hover:underline items-center gap-1"
          >
            View all products
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`relative flex flex-col bg-white border border-slate-100 rounded-[1.5rem] lg:rounded-[2rem] p-2 lg:p-3 overflow-hidden ${i === 4 ? "hidden lg:flex" : ""}`}
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full animate-[spotlightShimmer_1.6s_ease-in-out_infinite] pointer-events-none z-10" />

                {/* Square image placeholder */}
                <div className="aspect-square rounded-xl lg:rounded-[1.5rem] bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />

                {/* Content area */}
                <div className="flex flex-col flex-grow pt-2 lg:pt-4 px-1 pb-1 gap-2">
                  <div className="h-3.5 lg:h-5 w-4/5 bg-slate-100 rounded-lg" />
                  <div className="h-3 lg:h-4 w-3/5 bg-slate-100 rounded-lg" />
                  <div className="mt-auto flex flex-col gap-1.5 lg:gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-4 lg:h-5 w-16 lg:w-20 bg-slate-100 rounded-lg" />
                      <div className="h-3 lg:h-4 w-10 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="h-9 lg:h-11 w-full bg-slate-100 rounded-xl lg:rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : spotlight.length === 0 ? (
          <div className="text-center py-10 lg:py-20 bg-white rounded-3xl text-slate-500 font-medium text-sm lg:text-base">
            Products are being refreshed. Please check again shortly.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
            {spotlight.map((product, index) => {
              const primary =
                Array.isArray(product.variants) && product.variants.length > 0
                  ? product.variants[0]
                  : undefined;
              const displayPrice = Number(product.price ?? primary?.price ?? 0);
              const displayOriginal =
                product.originalPrice ?? primary?.originalPrice;
              const weightLabel = primary?.label ?? product.sizes?.[0] ?? "";
              const inStock = (primary?.stock ?? product.quantity ?? 0) > 0;
              const inCart = isVariantInCart(product.id, weightLabel || "");
              const pct = discountPct(displayOriginal, displayPrice);

              return (
                <div
                  key={product.id}
                  data-product-card
                  className={`group relative flex flex-col bg-white border border-slate-100 rounded-[1.5rem] lg:rounded-[2rem] p-2 lg:p-3 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 ${
                    index === 4 ? "hidden lg:flex" : ""
                  }`}
                >
                  {/* Image Container - Kept Square for Compact Height */}
                  <Link
                    href={createProductHref(product)}
                    className="relative aspect-square rounded-xl lg:rounded-[1.5rem] overflow-hidden bg-slate-50"
                  >
                    {getProductImageSources(product, weightLabel).length > 0 && (
                      <ResilientProductImage
                        sources={getProductImageSources(product, weightLabel)}
                        alt={product.name}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    {/* Discount Badge */}
                    {pct > 0 && (
                      <div className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-emerald-600 backdrop-blur-md text-white px-2 py-0.5 lg:px-3 lg:py-1 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-tighter">
                        -{pct}%
                      </div>
                    )}
                  </Link>

                  {/* Content - Compact spacing */}
                  <div className="flex flex-col flex-grow pt-2 lg:pt-4 px-1 pb-1">
                    <h3 className="font-bold text-slate-800 text-sm lg:text-lg leading-tight line-clamp-2 mb-1.5 lg:mb-2 group-hover:text-emerald-800 transition-colors">
                      {product.name}
                    </h3>

                    <div className="mt-auto">
                      <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 mb-2 lg:mb-4">
                        <span className="text-sm lg:text-lg font-black text-slate-900">
                          {formatMoney(currencySymbol, displayPrice)}
                        </span>
                        {displayOriginal && displayOriginal > displayPrice && (
                          <span className="text-[10px] lg:text-xs text-slate-400 line-through decoration-red-400/50">
                            {formatMoney(currencySymbol, displayOriginal)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button - Slimmer on mobile (h-9) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (inCart) {
                            router.push("/cart");
                          } else if (inStock) {
                            let renderedImageUrl = product.image || "";
                            try {
                              const card = (e.currentTarget as HTMLElement | null)?.closest?.("[data-product-card]") as HTMLElement | null;
                              const img = card?.querySelector?.("img") as HTMLImageElement | null;
                              const fromRect = img?.getBoundingClientRect?.() ?? (e.currentTarget as HTMLElement).getBoundingClientRect();
                              const imageUrl = String(img?.currentSrc || img?.src || product.image || "").trim();
                              renderedImageUrl = imageUrl || renderedImageUrl;
                              if (imageUrl && fromRect) {
                                flyImageToCart({ imageUrl, fromRect, durationMs: 950 });
                              }
                            } catch {
                              // ignore
                            }
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: displayPrice,
                              color: "",
                              size: weightLabel || "",
                              image: renderedImageUrl,
                              collection: product.collection || "",
                            });
                          }
                        }}
                        disabled={!inStock && !inCart}
                        className={`
    w-full h-9 lg:h-11 rounded-xl lg:rounded-2xl 
    flex items-center justify-center gap-1.5 lg:gap-2 
    transition-all duration-500 ease-out font-bold 
    text-[10px] lg:text-xs uppercase tracking-wider 
    active:scale-95 transform-gpu
    ${
      inCart
        ? "bg-slate-900 text-white hover:bg-black shadow-lg"
        : "bg-emerald-800 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/10 disabled:bg-slate-200 disabled:text-slate-400"
    }
  `}
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] lg:text-[18px] transition-transform duration-500 ${inCart ? "rotate-[360deg]" : ""}`}
                        >
                          {inCart ? "arrow_forward" : "shopping_bag"}
                        </span>

                        <span>
                          {inCart
                            ? "Go To Cart"
                            : inStock
                              ? "Add To Cart"
                              : "Out of Stock"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
