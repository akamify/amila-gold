"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import {
  createProductHref,
  getProductImageSources,
  type Product,
} from "@/app/data/products";
import { fetchFeaturedProducts } from "@/app/lib/productsClient";
import { peekCached, putCached } from "@/app/lib/clientCache";

/** Skeleton card that mirrors real ProductCard layout */
function FeaturedCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full animate-[featuredShimmer_1.7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="aspect-[10/11] rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />

      <div className="flex flex-grow flex-col gap-3 px-3 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="h-6 w-1/2 rounded-lg bg-slate-100" />
          <div className="h-6 w-16 rounded-lg bg-slate-100" />
        </div>

        <div className="h-4 w-full rounded-lg bg-slate-100" />
        <div className="h-4 w-4/5 rounded-lg bg-slate-100" />
        <div className="mt-auto h-12 w-full rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

/** Full responsive skeleton for FeaturedProducts */
function FeaturedProductsSkeleton() {
  return (
    <>
      <div className="-mx-4 px-4 md:hidden">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="h-4 w-36 rounded-lg bg-slate-100" />
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-100" />
            <div className="h-11 w-11 rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="flex gap-4 overflow-hidden">
          {[0, 1].map((index) => (
            <div key={index} className="min-w-[85vw] shrink-0">
              <FeaturedCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mb-6 flex items-center justify-end gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-100" />
          <div className="h-12 w-12 rounded-full bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-10">
          {[0, 1, 2].map((index) => (
            <FeaturedCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </>
  );
}

function getTrackStep(track: HTMLDivElement, cardSelector: string, gap: number) {
  const firstCard = track.querySelector<HTMLElement>(cardSelector);
  return (firstCard?.offsetWidth || track.clientWidth) + gap;
}

function getMaxScrollLeft(track: HTMLDivElement) {
  return Math.max(0, track.scrollWidth - track.clientWidth);
}

function scrollTrackSafely({
  track,
  cardSelector,
  direction,
  gap,
  loop = true,
}: {
  track: HTMLDivElement | null;
  cardSelector: string;
  direction: "prev" | "next";
  gap: number;
  loop?: boolean;
}) {
  if (!track) return;

  const maxLeft = getMaxScrollLeft(track);

  if (maxLeft <= 2) {
    track.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }

  const currentLeft = track.scrollLeft;
  const step = getTrackStep(track, cardSelector, gap);
  const edgeBuffer = 12;

  let nextLeft =
    direction === "next" ? currentLeft + step : currentLeft - step;

  if (direction === "next" && nextLeft >= maxLeft - edgeBuffer) {
    nextLeft = loop ? 0 : maxLeft;
  }

  if (direction === "prev" && nextLeft <= edgeBuffer) {
    nextLeft = loop ? maxLeft : 0;
  }

  track.scrollTo({
    left: Math.max(0, Math.min(nextLeft, maxLeft)),
    behavior: "smooth",
  });
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
  const isGridMode = products.length <= 3;

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
    const mobileTrack = mobileTrackRef.current;
    const desktopTrack = desktopTrackRef.current;

    if (mobileTrack) mobileTrack.scrollLeft = 0;
    if (desktopTrack) desktopTrack.scrollLeft = 0;
  }, [products.length]);

  useEffect(() => {
    const track = mobileTrackRef.current;

    if (!track) return;

    const onResize = () => {
      track.scrollLeft = 0;
      setMobileReady(true);
    };

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const track = mobileTrackRef.current;

    if (!track || !mobileReady || mobileProducts.length < 2) return;

    const startInterval = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        if (performance.now() < pauseUntilRef.current) return;

        scrollTrackSafely({
          track,
          cardSelector: "[data-feature-card]",
          direction: "next",
          gap: 16,
          loop: true,
        });
      }, 3500);
    };

    const onUserInteraction = () => {
      pauseUntilRef.current = performance.now() + 3000;
    };

    track.addEventListener("touchstart", onUserInteraction, { passive: true });
    track.addEventListener("pointerdown", onUserInteraction, { passive: true });

    startInterval();

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      track.removeEventListener("touchstart", onUserInteraction);
      track.removeEventListener("pointerdown", onUserInteraction);
    };
  }, [mobileReady, mobileProducts.length]);

  const scrollMobileTrack = (direction: "prev" | "next") => {
    pauseUntilRef.current = performance.now() + 3000;

    scrollTrackSafely({
      track: mobileTrackRef.current,
      cardSelector: "[data-feature-card]",
      direction,
      gap: 16,
      loop: true,
    });
  };

  const scrollDesktopTrack = (direction: "prev" | "next") => {
    scrollTrackSafely({
      track: desktopTrackRef.current,
      cardSelector: "[data-feature-desktop-card]",
      direction,
      gap: 40,
      loop: true,
    });
  };

  return (
    <section className="overflow-hidden bg-[#fcfcfd] py-6 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Purest Offerings
            </h2>

            <p className="text-lg text-slate-500">
              Carefully curated essentials designed for your lifestyle.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden w-fit border-b-2 border-primary/20 pb-1 text-sm font-bold uppercase tracking-widest text-primary transition-all hover:border-primary md:block"
          >
            View All Collection
          </Link>
        </div>

        {loading ? (
          <FeaturedProductsSkeleton />
        ) : products.length === 0 ? (
          <div className="py-14 text-center font-medium text-slate-500">
            Products are being refreshed. Please check again shortly.
          </div>
        ) : (
          <>
            <div className="-mx-4 px-4 md:hidden">
              <div className="mb-6 flex items-center justify-between gap-3">
                <Link
                  href="/shop"
                  className="shrink-0 border-b-2 border-primary/20 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-all hover:border-primary"
                >
                  View All Collection
                </Link>

                {mobileProducts.length > 1 ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => scrollMobileTrack("prev")}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary"
                      aria-label="Scroll featured products left"
                    >
                      <span className="material-symbols-outlined">west</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollMobileTrack("next")}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary"
                      aria-label="Scroll featured products right"
                    >
                      <span className="material-symbols-outlined">east</span>
                    </button>
                  </div>
                ) : null}
              </div>

              <div
                ref={mobileTrackRef}
                className={`hide-scrollbar flex gap-4 scroll-smooth ${
                  mobileProducts.length === 1
                    ? "justify-center overflow-hidden"
                    : "overflow-x-auto snap-x snap-mandatory"
                }`}
              >
                {mobileProducts.map((product) => (
                  <div
                    key={product.id}
                    data-feature-card
                    className={`snap-center shrink-0 ${
                      mobileProducts.length === 1
                        ? "w-full max-w-[350px]"
                        : "w-[85vw]"
                    }`}
                  >
                    <ProductCard product={product} currency={currencySymbol} />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              {!isGridMode ? (
                <div className="mb-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => scrollDesktopTrack("prev")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary"
                    aria-label="Scroll featured products left"
                  >
                    <span className="material-symbols-outlined">west</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollDesktopTrack("next")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary"
                    aria-label="Scroll featured products right"
                  >
                    <span className="material-symbols-outlined">east</span>
                  </button>
                </div>
              ) : null}

              {isGridMode ? (
                <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-10">
                  {products.map((product) => (
                    <div key={product.id} className="w-full max-w-[400px]">
                      <ProductCard product={product} currency={currencySymbol} />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  ref={desktopTrackRef}
                  className="hide-scrollbar flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 lg:gap-10"
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      data-feature-desktop-card
                      className="min-w-[340px] shrink-0 snap-start md:min-w-[calc((100%_-_2rem)/2)] lg:min-w-[calc((100%_-_5rem)/3)]"
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

function ProductCard({
  product,
  currency,
}: {
  product: Product;
  currency: string;
}) {
  const primary = product.variants?.[0];
  const price = Number(product.price ?? primary?.price ?? 0);
  const oldPrice = product.originalPrice ?? primary?.originalPrice;
  const isSale = Boolean(oldPrice && oldPrice > price);
  const imageSources = getProductImageSources(product);

  return (
    <div className="group relative flex h-full w-full flex-col rounded-3xl border border-slate-100 bg-white p-3 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60">
      <Link
        href={createProductHref(product)}
        className="relative block aspect-[10/11] overflow-hidden rounded-2xl bg-slate-50"
      >
        {isSale ? (
          <div className="absolute top-4 left-4 z-10 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Sale
          </div>
        ) : null}

        {imageSources.length > 0 ? (
          <ResilientProductImage
            sources={imageSources}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : null}

        <div className="absolute inset-0 flex items-end bg-black/5 p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="w-full translate-y-4 rounded-xl bg-white/90 py-3 text-sm font-bold text-slate-900 shadow-xl backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0"
          >
            Quick View
          </button>
        </div>
      </Link>

      <div className="flex flex-grow flex-col px-3 pt-6 pb-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="line-clamp-1 text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="flex shrink-0 flex-col items-end">
            <span className="text-lg font-bold text-slate-900">
              {currency}
              {price}
            </span>

            {isSale ? (
              <span className="text-xs text-slate-400 line-through">
                {currency}
                {oldPrice}
              </span>
            ) : null}
          </div>
        </div>

        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {product.description}
        </p>

        <div className="mt-auto">
          <Link
            href={createProductHref(product)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-primary"
          >
            <span>Book Now</span>
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}