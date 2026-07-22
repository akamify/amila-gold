"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { peekCached, putCached } from "@/app/lib/clientCache";
import { fetchPublicBannersData } from "@/app/lib/publicDataClient";

type HeroBanner = {
  id: string;
  img: string;
};

type HeroSectionProps = {
  initialBanners?: HeroBanner[];
  managed?: boolean;
};

const FALLBACK_HERO: HeroBanner = {
  id: "static-amila-hero",
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
    <section className="relative mt-16 aspect-[1600/666] w-full overflow-hidden bg-stone-900 md:mt-20">
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
                alt="Homepage banner"
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                quality={index === 0 ? 78 : 65}
                className={`object-contain transition-transform duration-[10000ms] ease-linear ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.38),transparent_32%),linear-gradient(135deg,#1c140b_0%,#4b2e11_48%,#111827_100%)]" />
            )}
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
    </section>
  );
}
