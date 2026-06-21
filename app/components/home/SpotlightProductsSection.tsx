"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { useCart } from "@/app/context/CartContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import {
  createProductHref,
  getProductImageSources,
  type Product,
} from "@/app/data/products";
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

/**
 * Mobile:
 * - 2 columns
 * - maximum 5 products
 * - odd last product spans full row but remains vertical
 *
 * Tablet:
 * - 3 columns
 *
 * Desktop:
 * - centered auto-fit grid
 * - existing image design unchanged
 */
const spotlightGridClass =
  "grid grid-cols-2 gap-3 md:grid-cols-3 lg:mx-auto lg:w-full lg:max-w-[1396px] lg:grid-cols-[repeat(auto-fit,minmax(230px,250px))] lg:justify-center lg:gap-6 xl:grid-cols-[repeat(auto-fit,minmax(240px,260px))]";

export default function SpotlightProductsSection({
  initialProducts = [],
  managed = false,
  loading: externalLoading,
}: {
  initialProducts?: Product[];
  managed?: boolean;
  loading?: boolean;
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
      return;
    }

    if (managed) {
      setProducts([]);
      setLoading(Boolean(externalLoading));
    }
  }, [initialProducts, managed, externalLoading]);

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
    <section className="bg-[#F9F9F7] pt-10 pb-6 lg:py-20">
      <div className="container mx-auto px-3 lg:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end lg:mb-10">
          <div className="space-y-1 lg:space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700/70 lg:text-sm">
              Curated Collection
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Today’s <span className="text-emerald-800">Spotlight</span>
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline md:flex"
          >
            View all products
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={spotlightGridClass}>
            {Array.from({ length: 5 }).map((_, index) => {
              const isOddLastMobileCard = index === 4;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-3 lg:rounded-[2rem] lg:p-4 ${
                    isOddLastMobileCard ? "col-span-2 md:col-span-1" : ""
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full animate-[spotlightShimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

                  <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 lg:rounded-[1.5rem]" />

                  <div className="flex flex-grow flex-col gap-2.5 px-2 pt-3 pb-1 lg:px-2.5 lg:pt-4">
                    <div className="h-3.5 w-4/5 rounded-lg bg-slate-100 lg:h-5" />
                    <div className="h-3 w-3/5 rounded-lg bg-slate-100 lg:h-4" />

                    <div className="mt-auto flex flex-col gap-2 lg:gap-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-16 rounded-lg bg-slate-100 lg:h-5 lg:w-20" />
                        <div className="h-3 w-10 rounded-lg bg-slate-100 lg:h-4" />
                      </div>

                      <div className="h-10 w-full rounded-xl bg-slate-100 lg:h-11 lg:rounded-2xl" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : spotlight.length === 0 ? (
          <div className="rounded-3xl bg-white py-10 text-center text-sm font-medium text-slate-500 lg:py-20 lg:text-base">
            Products are being refreshed. Please check again shortly.
          </div>
        ) : (
          <div className={spotlightGridClass}>
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
              const imageSources = getProductImageSources(product, weightLabel);

              const isOddLastMobileCard =
                spotlight.length % 2 === 1 && index === spotlight.length - 1;

              return (
                <div
                  key={product.id}
                  data-product-card
                  className={`group relative flex flex-col rounded-[1.5rem] border border-slate-100 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] lg:rounded-[2rem] lg:p-4 ${
                    isOddLastMobileCard ? "col-span-2 md:col-span-1 py-7 px-5" : ""
                  }`}
                >
                  {/* Image Container - original image behavior kept */}
                  <Link
                    href={createProductHref(product)}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-50 lg:rounded-[1.5rem]"
                  >
                    {imageSources.length > 0 && (
                      <ResilientProductImage
                        sources={imageSources}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    {pct > 0 && (
                      <div className="absolute top-2 left-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-white backdrop-blur-md lg:top-3 lg:left-3 lg:px-3 lg:py-1 lg:text-[10px]">
                        -{pct}%
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex flex-grow flex-col px-2 pt-3 pb-1 lg:px-2.5 lg:pt-4">
                    <h3 className="mb-2 line-clamp-2 break-words text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-emerald-800 lg:mb-3 lg:text-lg">
                      {product.name}
                    </h3>

                    <div className="mt-auto">
                      <div className="mb-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 lg:mb-5">
                        <span className="text-sm font-black text-slate-900 lg:text-lg">
                          {formatMoney(currencySymbol, displayPrice)}
                        </span>

                        {displayOriginal && displayOriginal > displayPrice && (
                          <span className="text-[10px] text-slate-400 line-through decoration-red-400/50 lg:text-xs">
                            {formatMoney(currencySymbol, displayOriginal)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();

                          if (inCart) {
                            router.push("/cart");
                            return;
                          }

                          if (!inStock) return;

                          let renderedImageUrl = product.image || "";

                          try {
                            const card = (
                              event.currentTarget as HTMLElement | null
                            )?.closest?.(
                              "[data-product-card]",
                            ) as HTMLElement | null;

                            const img = card?.querySelector?.(
                              "img",
                            ) as HTMLImageElement | null;

                            const fromRect =
                              img?.getBoundingClientRect?.() ??
                              (
                                event.currentTarget as HTMLElement
                              ).getBoundingClientRect();

                            const imageUrl = String(
                              img?.currentSrc ||
                                img?.src ||
                                product.image ||
                                "",
                            ).trim();

                            renderedImageUrl = imageUrl || renderedImageUrl;

                            if (imageUrl && fromRect) {
                              flyImageToCart({
                                imageUrl,
                                fromRect,
                                durationMs: 950,
                              });
                            }
                          } catch {
                            // Ignore animation failure.
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
                        }}
                        disabled={!inStock && !inCart}
                        className={`flex h-10 w-full transform-gpu items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ease-out active:scale-95 lg:h-11 lg:gap-2 lg:rounded-2xl lg:text-xs ${
                          inCart
                            ? "bg-slate-900 text-white shadow-lg hover:bg-black"
                            : "bg-emerald-800 text-white shadow-md shadow-emerald-900/10 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] transition-transform duration-500 lg:text-[18px] ${
                            inCart ? "rotate-[360deg]" : ""
                          }`}
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