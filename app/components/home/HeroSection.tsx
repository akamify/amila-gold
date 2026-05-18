"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { fetchPublicBanners } from "@/app/lib/apiClient";
import { peekCached } from "@/app/lib/clientCache";

type HeroBanner = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  img: string;
};

type HeroSectionProps = {
  initialBanners?: HeroBanner[];
};

const processRows = (rows: any[]): HeroBanner[] =>
  rows
    .filter((row) => row.imageUrl && row.targetUrl && row.title)
    .map((row) => ({
      id: String(row.id || row._id || row.imageUrl),
      title: row.title,
      subtitle: row.subtitle || "",
      href: row.targetUrl,
      img: row.imageUrl,
    }));

export default function HeroSection({ initialBanners = [] }: HeroSectionProps) {
  const [banners, setBanners] = useState<HeroBanner[]>(initialBanners);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const cached = peekCached<any[]>("banners:public").data;

    if (Array.isArray(cached) && cached.length) {
      setBanners(processRows(cached));
    }
    
    fetchPublicBanners()
      .then((rows) => setBanners(processRows(rows)))
      .catch(() => setBanners([]));
  }, []);

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

  if (banners.length === 0) return (
    <div className="relative h-[30vh] sm:h-[70vh] md:h-[80vh] mt-16 md:mt-20 w-full overflow-hidden bg-stone-200">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-[heroShimmer_1.8s_ease-in-out_infinite]" />

      {/* Left-side content skeleton */}
      <div className="absolute inset-0 flex items-center justify-start pb-10 md:pb-0">
        <div className="container mx-auto px-6 sm:px-8 md:px-12">
          <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6">
            {/* Subtitle bar */}
            {/* <div className="h-3 sm:h-4 w-28 sm:w-40 rounded-full bg-stone-300/80" /> */}
            {/* Title bars */}
            <div className="space-y-2 sm:space-y-3">
              <div className="h-4 sm:h-10 md:h-14 w-[85%] rounded-xl bg-stone-300/80" />
              <div className="h-6 sm:h-12 md:h-14 w-[60%] rounded-xl bg-stone-300/60" />
            </div>
            {/* CTA button placeholder */}
            <div className="pt-2 sm:pt-4">
              <div className="h-9 sm:h-12 md:h-14 w-36 sm:w-44 rounded-full bg-stone-300/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom dots navigation placeholder */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:gap-6 rounded-full bg-stone-300/50 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-3">
        <div className="w-4 h-4 rounded-full bg-stone-300/70" />
        <div className="flex gap-2 sm:gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full bg-stone-400/50 ${i === 0 ? "w-6 sm:w-8" : "w-1.5 sm:w-2"}`}
            />
          ))}
        </div>
        <div className="w-4 h-4 rounded-full bg-stone-300/70" />
      </div>
    </div>
  );

  return (
    // Note the mt-16 md:mt-20 exactly offsets the Navbar height to prevent overlap!
    <section className="relative h-[30vh] sm:h-[70vh] md:h-[80vh] mt-16 md:mt-20 w-full overflow-hidden bg-stone-900">
      {banners.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            activeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image with Ken Burns Effect */}
          <Image
            src={slide.img}
            alt={slide.title}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className={`object-cover transition-transform duration-[10000ms] ease-linear ${
              activeIndex === index ? "scale-110" : "scale-100"
            }`}
          />
          
          {/* Gradients: Left to right for text readability, and bottom-up for carousel dots */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Content Container */}
          <div className="absolute inset-0 flex items-center justify-start pb-10 md:pb-0">
            <div className="container mx-auto px-6 sm:px-8 md:px-12">
              <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6">
                
                <span className={`inline-block font-bold tracking-[0.25em] text-[10px] sm:text-xs md:text-sm text-amber-400 uppercase transform transition-all duration-700 delay-300 ${
                  activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}>
                  {slide.subtitle}
                </span>
                
                <h1 className={`text-2xl sm:text-6xl md:text-7xl lg:text-6xl font-black text-white leading-[1.05] sm:leading-[1.1] transition-all duration-1000 delay-500 drop-shadow-xl ${
                  activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}>
                  {slide.title}
                </h1>

                <div className={`pt-4 sm:pt-6 transition-all duration-700 delay-700 ${
                  activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
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
      <div className="absolute bottom-3 md:bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:gap-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0 sm:px-6 sm:py-3 shadow-2xl">
        <button
          onClick={() => handleSlide("prev")}
          className="text-white hover:text-amber-400 transition-colors p-1"
          aria-label="Previous"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="flex gap-2.5 sm:gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-1.5 transition-all duration-500 rounded-full ${
                activeIndex === index 
                  ? "w-6 sm:w-8 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
                  : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => handleSlide("next")}
          className="text-white hover:text-amber-400 transition-colors p-1"
          aria-label="Next"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Decorative side elements for Desktop (Hidden on Mobile) */}
      <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col gap-6 text-white/40 xl:flex z-20 items-center">
        <span className="h-24 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <p className="vertical-text text-[11px] tracking-[0.4em] uppercase rotate-180 font-semibold font-headline">Premium Agrarian</p>
        <span className="h-24 w-[1px] bg-gradient-to-b from-white/50 via-white/50 to-transparent" />
      </div>
    </section>
  );
}
