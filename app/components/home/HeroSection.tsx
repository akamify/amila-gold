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
      const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
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

export default function HeroSection({ initialBanners = [], managed = false }: HeroSectionProps) {
  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    const cached = peekCached<unknown[]>("banners:public").data;
    if (Array.isArray(cached) && cached.length) {
      return processRows(cached);
    }
    return initialBanners.length ? initialBanners : [FALLBACK_HERO];
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (initialBanners.length > 0) {
      setBanners(initialBanners);
      setActiveIndex(0);
    } else if (managed) {
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
      })
      .catch(() => {
        if (initialBanners.length === 0) setBanners([FALLBACK_HERO]);
      });
  }, [initialBanners.length, managed]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current === banners.length - 1 ? 0 : current + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleSlide = (direction: "prev" | "next") => {
    if (!banners.length) return;
    setActiveIndex((current) => {
      if (direction === "prev") return current === 0 ? banners.length - 1 : current - 1;
      return current === banners.length - 1 ? 0 : current + 1;
    });
  };

  return (
    // Note the mt-16 md:mt-20 exactly offsets the Navbar height to prevent overlap!
    <section className="relative h-[30vh] sm:h-[70vh] md:h-[80vh] mt-16 md:mt-20 w-full overflow-hidden bg-stone-900">
      {banners.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {/* Background Image with Ken Burns Effect */}
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
              className={`object-cover transition-transform duration-[10000ms] ease-linear ${activeIndex === index ? "scale-110" : "scale-100"
                }`}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.38),transparent_32%),linear-gradient(135deg,#1c140b_0%,#4b2e11_48%,#111827_100%)]" />
          )}

          {/* Gradients: Left to right for text readability, and bottom-up for carousel dots */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Content Container */}
          <div className="absolute inset-0 flex items-center justify-start pb-10 md:pb-0">
            <div className="container mx-auto px-6 sm:px-8 md:px-12">
              <div className="max-w-2xl min-h-[140px] sm:min-h-[200px] md:min-h-[240px] flex flex-col gap-3 sm:gap-4 md:gap-6">

                {slide.subtitle ? (
                  <span className={`inline-block font-bold tracking-[0.25em] text-[10px] sm:text-xs md:text-sm text-amber-400 uppercase transform transition-all duration-700 delay-300 ${activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}>
                    {slide.subtitle}
                  </span>
                ) : null}

                {slide.title ? (
                  <h1 className={`text-2xl sm:text-6xl md:text-7xl lg:text-6xl font-black text-white leading-[1.05] sm:leading-[1.1] transition-all duration-1000 delay-500 drop-shadow-xl ${activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}>
                    {slide.title}
                  </h1>
                ) : null}

                <div className={`mt-auto pt-4 sm:pt-6 transition-all duration-700 delay-700 ${activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}>
                  <Link
                    href={slide.href}
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-amber-500 px-4 py-2 md:px-8 md:py-4 font-bold text-stone-900 shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-400 hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] active:scale-95"
                  >
                    <ShoppingBag size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
                    <span className="uppercase tracking-wide text-xs sm:text-sm">Shop Collection</span>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modern Navigation Controls (Dots & Arrows) */}
      {banners.length > 1 ? (
      <div className="absolute bottom-3 md:bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:gap-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0 sm:px-6 sm:py-3 shadow-2xl">
        <button
          onClick={() => handleSlide("prev")}
          className="text-white hover:text-amber-400 transition-colors p-1"
          aria-label="Previous banner slide"
          type="button"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="flex gap-2.5 sm:gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-1.5 transition-all duration-500 rounded-full ${activeIndex === index
                  ? "w-6 sm:w-8 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`Show banner slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>

        <button
          onClick={() => handleSlide("next")}
          className="text-white hover:text-amber-400 transition-colors p-1"
          aria-label="Next banner slide"
          type="button"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>
      ) : null}

      {/* Decorative side elements for Desktop (Hidden on Mobile) */}
      <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col gap-6 text-white/40 xl:flex z-20 items-center">
        <span className="h-24 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <p className="vertical-text text-[11px] tracking-[0.4em] uppercase rotate-180 font-semibold font-headline">Premium Agrarian</p>
        <span className="h-24 w-[1px] bg-gradient-to-b from-white/50 via-white/50 to-transparent" />
      </div>
    </section>
  );
}
