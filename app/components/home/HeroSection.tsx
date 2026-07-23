"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Leaf,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { PublicBanner } from "@/app/lib/publicDataClient";
import { getWholesaleWhatsAppUrl } from "@/app/lib/whatsapp";

const FALLBACK_BANNERS = [
  "/banner.png",
  "/banner2.png",
  "/banner3.png",
];

const WHOLESALE_WHATSAPP_URL = getWholesaleWhatsAppUrl();
const AUTOPLAY_MS = 4500;

type HeroSectionProps = {
  initialBanners?: PublicBanner[];
  managed?: boolean;
};

const trustPoints = [
  {
    icon: Leaf,
    label: "100% Natural",
    description: "Naturally sourced",
  },
  {
    icon: ShieldCheck,
    label: "Quality Assured",
    description: "Carefully checked",
  },
  {
    icon: BadgeCheck,
    label: "Authentic",
    description: "Trusted quality",
  },
];

function getBannerSources(initialBanners?: PublicBanner[]) {
  const dynamicBanners = Array.isArray(initialBanners)
    ? initialBanners
        .map((item) => String(item?.img || "").trim())
        .filter(Boolean)
    : [];

  return Array.from(
    new Set([...dynamicBanners, ...FALLBACK_BANNERS]),
  ).slice(0, 3);
}

export default function HeroSection({
  initialBanners,
}: HeroSectionProps) {
  const bannerSources = useMemo(
    () => getBannerSources(initialBanners),
    [initialBanners],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [bannerSources.length]);

  useEffect(() => {
    if (bannerSources.length <= 1 || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex(
        (currentIndex) =>
          (currentIndex + 1) % bannerSources.length,
      );
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [bannerSources.length, isPaused]);

  const showPreviousBanner = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0
        ? bannerSources.length - 1
        : currentIndex - 1,
    );
  };

  const showNextBanner = () => {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex + 1) % bannerSources.length,
    );
  };

  if (!bannerSources.length) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f8f5ed_0%,#eee7d9_100%)] px-1 py-1 sm:px-1 sm:py-1 lg:px-2 lg:py-2">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-28 top-4 h-72 w-72 rounded-full bg-[#5d8b46]/10 blur-3xl" />

        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#c28b42]/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-48 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1536px]">
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Banner */}
          <div className="relative overflow-hidden rounded-[2px] border border-[#d8cebb] bg-[#eee6d8] shadow-[0_18px_50px_rgba(52,42,23,0.12)]">
            <div className="relative aspect-[2172/724] w-full overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={bannerSources[activeIndex]}
                  initial={{
                    opacity: 0,
                    scale: 1.025,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.99,
                  }}
                  transition={{
                    opacity: {
                      duration: 0.45,
                      ease: "easeOut",
                    },
                    scale: {
                      duration: 0.75,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={bannerSources[activeIndex]}
                    alt={`Amila Gold banner ${activeIndex + 1}`}
                    fill
                    priority={activeIndex === 0}
                    fetchPriority={
                      activeIndex === 0 ? "high" : "auto"
                    }
                    quality={100}
                    sizes="(max-width: 640px) 100vw, (max-width: 1536px) 100vw, 1536px"
                    className="object-cover object-center"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Desktop soft overlays */}
              <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_38%,rgba(20,39,17,0.14)_100%)] sm:block" />

              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[18%] bg-gradient-to-r from-black/10 to-transparent sm:block" />

              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[18%] bg-gradient-to-l from-black/10 to-transparent sm:block" />

              {/* Desktop arrows */}
              {bannerSources.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousBanner}
                    aria-label="Show previous banner"
                    className="absolute left-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#31572c] shadow-[0_10px_30px_rgba(25,38,20,0.18)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white sm:flex lg:left-6 lg:h-12 lg:w-12"
                  >
                    <ChevronLeft
                      className="h-5 w-5"
                      strokeWidth={2.7}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={showNextBanner}
                    aria-label="Show next banner"
                    className="absolute right-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#31572c] shadow-[0_10px_30px_rgba(25,38,20,0.18)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white sm:flex lg:right-6 lg:h-12 lg:w-12"
                  >
                    <ChevronRight
                      className="h-5 w-5"
                      strokeWidth={2.7}
                    />
                  </button>
                </>
              )}

              {/* Desktop banner content */}
              <div className="absolute inset-x-0 bottom-0 z-20 hidden items-end justify-between gap-5 p-5 sm:flex lg:p-7">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/55 bg-white/88 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#69451f] shadow-[0_12px_35px_rgba(43,34,18,0.18)] backdrop-blur-xl lg:px-5 lg:text-[11px]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7f0df] text-[#2f652a]">
                    <ShieldCheck
                      className="h-4 w-4"
                      strokeWidth={2.5}
                    />
                  </span>

                  Trusted household essentials
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/shop"
                    className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-[#4d813f] bg-[linear-gradient(135deg,#153f1a_0%,#276529_52%,#4b863d_100%)] px-6 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-[0_15px_36px_rgba(25,83,31,0.42)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_20px_42px_rgba(25,83,31,0.48)]"
                  >
                    <ShoppingBag
                      className="h-[17px] w-[17px]"
                      strokeWidth={2.6}
                    />

                    Shop Now

                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.6}
                    />
                  </Link>

                  <a
                    href={WHOLESALE_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border-2 border-[#356d31] bg-[#fffef9] px-6 text-[11px] font-black uppercase tracking-[0.12em] text-[#295d27] shadow-[0_14px_34px_rgba(38,74,31,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#edf6e8] hover:shadow-[0_18px_40px_rgba(38,74,31,0.3)]"
                  >
                    <MessageCircle
                      className="h-[17px] w-[17px]"
                      strokeWidth={2.6}
                    />

                    WhatsApp Wholesale

                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.5}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slider dots */}
          {bannerSources.length > 1 && (
            <div className="relative z-30 -mt-2.5 flex justify-center sm:absolute sm:inset-x-0 sm:bottom-4 sm:mt-0 lg:bottom-5">
              <div className="flex items-center gap-1 rounded-full border border-[#ddd2be] bg-[#fffdf8]/96 px-2.5 py-1.5 shadow-[0_8px_20px_rgba(51,39,20,0.15)] backdrop-blur-xl sm:border-white/50 sm:bg-white/80">
                {bannerSources.map((banner, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${banner}-${index}`}
                      type="button"
                      aria-label={`Show banner ${index + 1}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-6 bg-[#32652c]"
                          : "w-1.5 bg-[#c7b79d] hover:bg-[#987448]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile area */}
          <div className="mt-1.5 overflow-hidden rounded-[10px] border border-[#ddd2bf] bg-[linear-gradient(145deg,#fffefb_0%,#f7f0e4_100%)] shadow-[0_10px_26px_rgba(57,43,22,0.08)] sm:hidden">
            {/* Small heading */}
            <div className="flex items-center justify-between gap-3 border-b border-[#e7ddcc] px-3 py-2.5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-[0.15em] text-[#a2692a]">
                  <Sparkles
                    className="h-2.5 w-2.5"
                    strokeWidth={2.5}
                  />

                  Naturally better
                </div>

                <h2 className="mt-0.5 text-[14px] font-black leading-tight tracking-[-0.03em] text-[#22461f]">
                  Pure quality for every home
                </h2>

                <p className="mt-0.5 text-[8px] font-medium leading-3 text-[#806a52]">
                  Authentic products for better everyday living.
                </p>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#d9e3cf] bg-[#edf5e7] text-[#32642d]">
                <Leaf
                  className="h-4 w-4"
                  strokeWidth={2.4}
                />
              </span>
            </div>

            {/* Smaller mobile trust points */}
            <div className="grid grid-cols-3 gap-1.5 px-2 py-2">
              {trustPoints.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="relative flex min-w-0 items-center gap-1.5 overflow-hidden rounded-[9px] border border-[#e5dac8] bg-white px-1.5 py-2 shadow-[0_4px_12px_rgba(61,46,23,0.05)]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#edf4e7] text-[#30622b]">
                      <Icon
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-[6.5px] font-black uppercase leading-3 tracking-[0.04em] text-[#65472f]">
                        {item.label}
                      </p>

                      <p className="truncate text-[5.5px] font-medium leading-2.5 text-[#9a8064]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Highlighted CTA buttons */}
            <div className="grid grid-cols-2 gap-2 border-t border-[#e7ddcc] bg-[#fffdfa] p-2">
              <Link
                href="/shop"
                className="group relative inline-flex min-h-[46px] items-center justify-center gap-2 overflow-hidden rounded-[11px] border border-[#3d7737] bg-[linear-gradient(135deg,#153f1a_0%,#28662a_55%,#4c873e_100%)] px-2 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(30,91,35,0.38)] transition active:scale-[0.98]"
              >
                <span className="absolute inset-x-3 top-0 h-px bg-white/45" />

                <ShoppingBag
                  className="h-4 w-4 shrink-0"
                  strokeWidth={2.6}
                />

                <span>Shop Now</span>

                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.7}
                />
              </Link>

              <a
                href={WHOLESALE_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex min-h-[46px] items-center justify-center gap-1.5 overflow-hidden rounded-[11px] border-2 border-[#397535] bg-[linear-gradient(180deg,#ffffff_0%,#edf6e9_100%)] px-2 text-center text-[7.5px] font-black uppercase leading-[10px] tracking-[0.07em] text-[#285d27] shadow-[0_8px_20px_rgba(37,91,34,0.18)] transition active:scale-[0.98]"
              >
                <MessageCircle
                  className="h-4 w-4 shrink-0"
                  strokeWidth={2.6}
                />

                <span>
                  WhatsApp
                  <br />
                  Wholesale
                </span>

                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.7}
                />
              </a>
            </div>
          </div>

          {/* Tablet and desktop trust bar */}
          <div className="mt-3 hidden overflow-hidden rounded-[14px] border border-[#ded3c0] bg-[linear-gradient(90deg,#fffdfa_0%,#f5eddf_50%,#fffdfa_100%)] shadow-[0_12px_30px_rgba(55,42,22,0.07)] sm:flex">
            {trustPoints.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`group flex flex-1 items-center justify-center gap-3 px-4 py-3.5 transition duration-300 hover:bg-white/65 lg:px-7 ${
                    index !== trustPoints.length - 1
                      ? "border-r border-[#e2d7c5]"
                      : ""
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#dbe5d3] bg-[#edf4e8] text-[#32642d] transition duration-300 group-hover:scale-105">
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={2.4}
                    />
                  </span>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#6b4b30] lg:text-[10px]">
                      {item.label}
                    </p>

                    <p className="mt-0.5 hidden text-[10px] font-medium text-[#9a8168] lg:block">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}