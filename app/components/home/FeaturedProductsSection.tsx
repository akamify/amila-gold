"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { createProductHref, getProductImageSources, type Product } from "@/app/data/products";
import { fetchFeaturedProducts } from "@/app/lib/productsClient";
import { peekCached, putCached } from "@/app/lib/clientCache";

/** Skeleton card that mirrors real ProductCard layout */
function FeaturedCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col h-full bg-white rounded-3xl p-3 border border-slate-100 overflow-hidden w-full ${className}`}>
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[featuredShimmer_1.7s_ease-in-out_infinite] pointer-events-none z-10" />
      {/* Image placeholder — matches aspect-[10/11] */}
      <div className="aspect-[10/11] rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />
      {/* Content */}
      <div className="px-3 pt-5 pb-4 flex flex-col flex-grow gap-3">
        <div className="flex justify-between items-start gap-4">
          <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
          <div className="h-6 w-16 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-lg" />
        <div className="h-4 w-4/5 bg-slate-100 rounded-lg" />
        <div className="mt-auto h-12 w-full bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

/** Full responsive skeleton for FeaturedProducts */
function FeaturedProductsSkeleton() {
  return (
    <>
      {/* Mobile: horizontal scroll strip */}
      <div className="md:hidden -mx-4 px-4">
        {/* Header row placeholder */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="h-4 w-36 bg-slate-100 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-100" />
            <div className="w-11 h-11 rounded-full bg-slate-100" />
          </div>
        </div>
        {/* Scrollable cards */}
        <div className="flex gap-4 overflow-hidden">
          {[0, 1].map((i) => (
            <div key={i} className="min-w-[85vw] shrink-0">
              <FeaturedCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 3-col grid */}
      <div className="hidden md:block">
        <div className="flex items-center justify-end gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-100" />
          <div className="w-12 h-12 rounded-full bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {[0, 1, 2].map((i) => (
            <FeaturedCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

export default function FeaturedProductsSection({
  initialProducts = [],
  managed = false,
  loading: externalLoading,
}: {
  initialProducts?: Product[];
  managed?: boolean;
  loading?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const pauseUntilRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const [mobileReady, setMobileReady] = useState(false);
  const mobileProducts = useMemo(() => products.slice(0, 4), [products]);

  // Check if we should render as a clean grid or slider rail
  const isGridMode = products.length <= 3;

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
    } else if (managed) {
      setProducts([]);
      setLoading(Boolean(externalLoading));
    }
  }, [initialProducts, managed, externalLoading]);

  useEffect(() => {
    if (managed) return;
    if (initialProducts.length > 0) return;
    window.setTimeout(() => {
      const cached = peekCached<Product[]>("products:all").data;
      if (Array.isArray(cached) && cached.length) {
        setProducts(cached);
        setLoading(false);
      }
    }, 0);

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

  useEffect(() => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const onResize = () => {
      el.scrollLeft = 0;
      setMobileReady(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = mobileTrackRef.current;
    if (!el || !mobileReady || mobileProducts.length < 2) return;

    const getStep = () => {
      const first = el.querySelector<HTMLElement>("[data-feature-card]");
      return (first?.offsetWidth ?? 0) + 16;
    };

    const startInterval = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (performance.now() < pauseUntilRef.current) return;
        el.scrollBy({ left: getStep(), behavior: "smooth" });
      }, 3500);
    };

    const onUserInteraction = () => {
      pauseUntilRef.current = performance.now() + 3000;
    };

    el.addEventListener("touchstart", onUserInteraction, { passive: true });
    startInterval();

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      el.removeEventListener("touchstart", onUserInteraction);
    };
  }, [mobileReady, mobileProducts.length]);

  const scrollMobileTrack = (direction: "prev" | "next") => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-feature-card]");
    const step = (first?.offsetWidth ?? 0) + 16;
    pauseUntilRef.current = performance.now() + 3000;
    el.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  const scrollDesktopTrack = (direction: "prev" | "next") => {
    const el = desktopTrackRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-feature-desktop-card]");
    const step = (first?.offsetWidth ?? 0) + 32;
    el.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-6 lg:py-24 bg-[#fcfcfd] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Purest Offerings
            </h2>
            <p className="text-slate-500 text-lg">
              Carefully curated essentials designed for your lifestyle.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1 w-fit md:block"
          >
            View All Collection
          </Link>
        </div>

        {loading ? (
          <FeaturedProductsSkeleton />
        ) : products.length === 0 ? (
          <div className="text-center py-14 text-slate-500 font-medium">
            Products are being refreshed. Please check again shortly.
          </div>
        ) : (
          <>
            {/* Mobile Carousel */}
            <div className="md:hidden -mx-4 px-4">
              <div className="flex items-center justify-between gap-3 mb-6">
                <Link
                  href="/shop"
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1 shrink-0"
                >
                  View All Collection
                </Link>

                {mobileProducts.length > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => scrollMobileTrack("prev")}
                      className="w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-900 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                      aria-label="Scroll featured products left"
                    >
                      <span className="material-symbols-outlined">west</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollMobileTrack("next")}
                      className="w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-900 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                      aria-label="Scroll featured products right"
                    >
                      <span className="material-symbols-outlined">east</span>
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={mobileTrackRef}
                className={`hide-scrollbar flex gap-4 ${
                  products.length === 1 ? "justify-center" : "overflow-x-auto snap-x snap-mandatory"
                }`}
              >
                {mobileProducts.map((product) => (
                  <div
                    key={product.id}
                    data-feature-card
                    className={`snap-center ${products.length === 1 ? "w-full max-w-[350px]" : "min-w-[85vw]"}`}
                  >
                    <ProductCard product={product} currency={currencySymbol} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop/Tablet Layout */}
            <div className="hidden md:block">
              {/* Hide navigation buttons if products are less than or equal to 3 */}
              {!isGridMode && (
                <div className="flex items-center justify-end gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => scrollDesktopTrack("prev")}
                    className="w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-900 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                    aria-label="Scroll featured products left"
                  >
                    <span className="material-symbols-outlined">west</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollDesktopTrack("next")}
                    className="w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-900 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                    aria-label="Scroll featured products right"
                  >
                    <span className="material-symbols-outlined">east</span>
                  </button>
                </div>
              )}

              {isGridMode ? (
                /* Pure Grid Layout for 1-3 products so they don't stretch */
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                  {products.map((product) => (
                    <div key={product.id} className="w-full max-w-[400px]">
                      <ProductCard product={product} currency={currencySymbol} />
                    </div>
                  ))}
                </div>
              ) : (
                /* Slider Rail for 4+ products */
                <div
                  ref={desktopTrackRef}
                  className="hide-scrollbar flex gap-8 lg:gap-10 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      data-feature-desktop-card
                      className="snap-start min-w-[340px] md:min-w-[calc(50%-16px)] lg:min-w-[calc(33.333%-27px)]"
                    >
                      <ProductCard product={product} currency={currencySymbol} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

/** Reusable Product Card Component */
function ProductCard({ product, currency }: { product: Product; currency: string }) {
  const primary = product.variants?.[0];
  const price = Number(product.price ?? primary?.price ?? 0);
  const oldPrice = product.originalPrice ?? primary?.originalPrice;
  const isSale = oldPrice && oldPrice > price;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-3xl p-3 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 w-full">
      {/* Image Container */}
      <Link href={createProductHref(product)} className="relative aspect-[10/11] overflow-hidden rounded-2xl bg-slate-50 block">
        {isSale && (
          <div className="absolute top-4 left-4 z-10 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Sale
          </div>
        )}

        {getProductImageSources(product).length > 0 && (
          <ResilientProductImage
            sources={getProductImageSources(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button className="w-full bg-white/90 backdrop-blur-md py-3 rounded-xl text-sm font-bold text-slate-900 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
            Quick View
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="px-3 pt-6 pb-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-slate-900">
              {currency}{price}
            </span>
            {isSale && (
              <span className="text-xs text-slate-400 line-through">
                {currency}{oldPrice}
              </span>
            )}
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">
          {product.description}
        </p>

        <div className="mt-auto">
          <Link
            href={createProductHref(product)}
            className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300"
          >
            <span>Book Now</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
