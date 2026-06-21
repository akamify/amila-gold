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
      {/* Mobile */}
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

      {/* Desktop */}
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

function getCards(track: HTMLDivElement, selector: string) {
  return Array.from(track.querySelectorAll<HTMLElement>(selector));
}

function getMaxScrollLeft(track: HTMLDivElement) {
  return Math.max(0, track.scrollWidth - track.clientWidth);
}

function getSafeIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(index, total - 1));
}

function getNextCarouselIndex({
  currentIndex,
  direction,
  total,
}: {
  currentIndex: number;
  direction: "prev" | "next";
  total: number;
}) {
  if (total <= 1) return 0;

  if (direction === "next") {
    return currentIndex >= total - 1 ? 0 : currentIndex + 1;
  }

  return currentIndex <= 0 ? total - 1 : currentIndex - 1;
}

function getClosestCardIndex(track: HTMLDivElement, selector: string) {
  const cards = getCards(track, selector);

  if (cards.length === 0) return 0;

  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - track.scrollLeft);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return getSafeIndex(closestIndex, cards.length);
}

function scrollTrackToCardIndex({
  track,
  selector,
  index,
}: {
  track: HTMLDivElement | null;
  selector: string;
  index: number;
}) {
  if (!track) return;

  const cards = getCards(track, selector);

  if (cards.length === 0) return;

  const safeIndex = getSafeIndex(index, cards.length);
  const targetCard = cards[safeIndex];
  const maxLeft = getMaxScrollLeft(track);

  track.scrollTo({
    left: Math.min(targetCard.offsetLeft, maxLeft),
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
  const [mobileReady, setMobileReady] = useState(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);

  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";

  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const pauseUntilRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const mobileProducts = useMemo(() => products.slice(0, 4), [products]);

  // 1-3 products: clean grid. 4+ products: slider rail.
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

    const cacheTimer = window.setTimeout(() => {
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

    return () => {
      window.clearTimeout(cacheTimer);
    };
  }, [initialProducts.length, managed]);

  useEffect(() => {
    setMobileActiveIndex(0);
    setDesktopActiveIndex(0);

    const mobileTrack = mobileTrackRef.current;
    const desktopTrack = desktopTrackRef.current;

    if (mobileTrack) {
      mobileTrack.scrollTo({ left: 0, behavior: "auto" });
    }

    if (desktopTrack) {
      desktopTrack.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [products.length]);

  useEffect(() => {
    const track = mobileTrackRef.current;

    if (!track) return;

    const handleResize = () => {
      track.scrollTo({ left: 0, behavior: "auto" });
      setMobileActiveIndex(0);
      setMobileReady(true);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const track = mobileTrackRef.current;

    if (!track) return;

    let frameId = 0;

    const handleScroll = () => {
      if (frameId) window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const nextIndex = getClosestCardIndex(track, "[data-feature-card]");
        setMobileActiveIndex(nextIndex);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [mobileProducts.length]);

  useEffect(() => {
    const track = desktopTrackRef.current;

    if (!track || isGridMode) return;

    let frameId = 0;

    const handleScroll = () => {
      if (frameId) window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const nextIndex = getClosestCardIndex(
          track,
          "[data-feature-desktop-card]",
        );
        setDesktopActiveIndex(nextIndex);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [products.length, isGridMode]);

  useEffect(() => {
    const track = mobileTrackRef.current;

    if (!track || !mobileReady || mobileProducts.length < 2) return;

    const pauseAutoScroll = () => {
      pauseUntilRef.current = performance.now() + 3000;
    };

    const startInterval = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        if (performance.now() < pauseUntilRef.current) return;

        setMobileActiveIndex((currentIndex) => {
          const nextIndex = getNextCarouselIndex({
            currentIndex,
            direction: "next",
            total: mobileProducts.length,
          });

          scrollTrackToCardIndex({
            track,
            selector: "[data-feature-card]",
            index: nextIndex,
          });

          return nextIndex;
        });
      }, 3500);
    };

    track.addEventListener("touchstart", pauseAutoScroll, { passive: true });
    track.addEventListener("pointerdown", pauseAutoScroll, { passive: true });

    startInterval();

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      track.removeEventListener("touchstart", pauseAutoScroll);
      track.removeEventListener("pointerdown", pauseAutoScroll);
    };
  }, [mobileReady, mobileProducts.length]);

  const scrollMobileTrack = (direction: "prev" | "next") => {
    pauseUntilRef.current = performance.now() + 3000;

    setMobileActiveIndex((currentIndex) => {
      const nextIndex = getNextCarouselIndex({
        currentIndex,
        direction,
        total: mobileProducts.length,
      });

      scrollTrackToCardIndex({
        track: mobileTrackRef.current,
        selector: "[data-feature-card]",
        index: nextIndex,
      });

      return nextIndex;
    });
  };

  const scrollDesktopTrack = (direction: "prev" | "next") => {
    setDesktopActiveIndex((currentIndex) => {
      const nextIndex = getNextCarouselIndex({
        currentIndex,
        direction,
        total: products.length,
      });

      scrollTrackToCardIndex({
        track: desktopTrackRef.current,
        selector: "[data-feature-desktop-card]",
        index: nextIndex,
      });

      return nextIndex;
    });
  };

  return (
    <section className="overflow-hidden bg-[#fcfcfd] py-6 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
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
            {/* Mobile Carousel */}
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
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary active:scale-95"
                      aria-label="Scroll featured products left"
                    >
                      <span className="material-symbols-outlined">west</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollMobileTrack("next")}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary active:scale-95"
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
                    className={`shrink-0 snap-center ${
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

            {/* Desktop/Tablet Layout */}
            <div className="hidden md:block">
              {!isGridMode ? (
                <div className="mb-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => scrollDesktopTrack("prev")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary active:scale-95"
                    aria-label="Scroll featured products left"
                  >
                    <span className="material-symbols-outlined">west</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollDesktopTrack("next")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-all hover:border-primary hover:text-primary active:scale-95"
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

/** Reusable Product Card Component */
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
  const productHref = createProductHref(product);

  return (
    <div className="group relative flex h-full w-full flex-col rounded-3xl border border-slate-100 bg-white p-3 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60">
      {/* Image Container */}
      <Link
        href={productHref}
        className="relative block aspect-[10/11] overflow-hidden rounded-2xl bg-slate-50"
        aria-label={`Open ${product.name}`}
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
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}

        {/* Quick View Overlay - span, not button, because parent is Link */}
        <div className="pointer-events-none absolute inset-0 flex items-end bg-black/5 p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="w-full translate-y-4 rounded-xl bg-white/90 py-3 text-center text-sm font-bold text-slate-900 shadow-xl backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0">
            Quick View
          </span>
        </div>
      </Link>

      {/* Content */}
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
            href={productHref}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-primary active:scale-[0.98]"
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