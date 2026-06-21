"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { peekCached, putCached } from "@/app/lib/clientCache";
import { fetchPublicBannersData } from "@/app/lib/publicDataClient";

type HeroBanner = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  img: string;
};

type HeroSectionProps = {
  initialBanners?: HeroBanner[];
  managed?: boolean;
};

const FALLBACK_HERO: HeroBanner = {
  id: "static-amila-hero",
  title: "Pure Desi Jaggery, Crafted for Modern Homes",
  subtitle: "Amila Gold",
  href: "/shop",
  img: "/fallback_banner.png",
};

const processRows = (rows: unknown[]): HeroBanner[] =>
  rows
    .map((value) => {
      const row =
        value && typeof value === "object"
          ? (value as Record<string, unknown>)
          : {};

      const image = String(row.imageUrl || row.img || "").trim();

      if (!image) return null;

      return {
        id: String(row.id || row._id || image),
        title: String(row.title || ""),
        subtitle: String(row.subtitle || ""),
        href: String(row.targetUrl || row.href || "/shop"),
        img: image,
      };
    })
    .filter((item): item is HeroBanner => item !== null);

export default function HeroSection({
  initialBanners = [],
  managed = false,
}: HeroSectionProps) {
  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    const cached = peekCached<unknown[]>("banners:public").data;

    if (Array.isArray(cached) && cached.length) {
      const processed = processRows(cached);
      return processed.length ? processed : [FALLBACK_HERO];
    }

    return initialBanners.length ? initialBanners : [FALLBACK_HERO];
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (initialBanners.length > 0) {
      setBanners(initialBanners);
      setActiveIndex(0);
      return;
    }

    if (managed) {
      setBanners([FALLBACK_HERO]);
      setActiveIndex(0);
    }
  }, [initialBanners, managed]);

  useEffect(() => {
    if (managed) return;

    fetchPublicBannersData()
      .then((rows) => {
        putCached("banners:public", 5 * 60 * 1000, rows);
        setBanners(rows.length ? rows : [FALLBACK_HERO]);
        setActiveIndex(0);
      })
      .catch(() => {
        if (initialBanners.length === 0) {
          setBanners([FALLBACK_HERO]);
          setActiveIndex(0);
        }
      });
  }, [initialBanners.length, managed]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) =>
        current === banners.length - 1 ? 0 : current + 1,
      );
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [banners.length]);

  const handleSlide = (direction: "prev" | "next") => {
    if (!banners.length) return;

    setActiveIndex((current) => {
      if (direction === "prev") {
        return current === 0 ? banners.length - 1 : current - 1;
      }

      return current === banners.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <section className="relative mt-16 h-[30vh] w-full overflow-hidden bg-stone-900 sm:h-[70vh] md:mt-20 md:h-[80vh]">
      {banners.map((slide, index) => {
        const isActive = activeIndex === index;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            {slide.img ? (
              <Image
                src={slide.img}
                alt={slide.title || slide.subtitle || "Banner"}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                quality={index === 0 ? 78 : 65}
                className={`object-cover transition-transform duration-[10000ms] ease-linear ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.38),transparent_32%),linear-gradient(135deg,#1c140b_0%,#4b2e11_48%,#111827_100%)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center justify-start pb-0">
              <div className="container mx-auto px-6 sm:px-8 md:px-12">
                <div className="flex min-h-[140px] max-w-2xl flex-col gap-3 sm:min-h-[200px] sm:gap-4 md:min-h-[240px] md:gap-6">
                  {slide.subtitle ? (
                    <span
                      className={`inline-block transform text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 transition-all delay-300 duration-700 sm:text-xs md:text-sm ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      {slide.subtitle}
                    </span>
                  ) : null}

                  {slide.title ? (
                    <h1
                      className={`text-2xl font-black leading-[1.05] text-white drop-shadow-xl transition-all delay-500 duration-1000 sm:text-6xl sm:leading-[1.1] md:text-7xl lg:text-6xl ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-8 opacity-0"
                      }`}
                    >
                      {slide.title}
                    </h1>
                  ) : null}

                  <div
                    className={`mt-auto pt-4 transition-all delay-700 duration-700 sm:pt-6 ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    <Link
                      href={slide.href}
                      className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-amber-500 px-4 py-2 font-bold text-stone-900 shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-400 hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] active:scale-95 md:px-8 md:py-4"
                    >
                      <ShoppingBag
                        size={18}
                        className="md:h-5 md:w-5"
                        strokeWidth={2.5}
                      />
                      <span className="text-xs uppercase tracking-wide sm:text-sm">
                        Shop Collection
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation capsule hidden completely on mobile */}
      {banners.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-6 rounded-full border border-white/20 bg-white/10 px-6 py-3 shadow-2xl backdrop-blur-md sm:flex md:bottom-5">
          <button
            onClick={() => handleSlide("prev")}
            className="rounded-full p-1 text-white transition-colors hover:text-amber-400"
            aria-label="Previous banner slide"
            type="button"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative h-1.5 rounded-full transition-all duration-500 ${
                  activeIndex === index
                    ? "w-8 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Show banner slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>

          <button
            onClick={() => handleSlide("next")}
            className="rounded-full p-1 text-white transition-colors hover:text-amber-400"
            aria-label="Next banner slide"
            type="button"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      ) : null}

      <div className="absolute right-10 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-6 text-white/40 xl:flex">
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <p className="vertical-text rotate-180 font-headline text-[11px] font-semibold uppercase tracking-[0.4em]">
          Premium Agrarian
        </p>
        <span className="h-24 w-px bg-gradient-to-b from-white/50 via-white/50 to-transparent" />
      </div>
    </section>
  );
}