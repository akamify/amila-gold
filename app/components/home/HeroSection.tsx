"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
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
    label: "Authentic Products",
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

  if (!bannerSources.length) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f8f5ed_0%,#eee7d9_100%)] px-1 py-1 sm:px-1 sm:py-1 lg:px-2 lg:py-2">
      {/* Background decoration */}
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
          {/* Main banner */}
          <div className="relative overflow-hidden rounded-[2px] border border-[#d8cebb] bg-[#eee6d8] shadow-[0_18px_50px_rgba(52,42,23,0.12)] ">
            {/*
              Original banner dimensions: 2172 × 724
              Exact ratio is approximately 3:1
            */}
            <div className="relative aspect-[2172/724] w-full overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={bannerSources[activeIndex]}
                  initial={{
                    opacity: 0,
                    scale: 1.035,
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
                      duration: 0.5,
                      ease: "easeOut",
                    },
                    scale: {
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={bannerSources[activeIndex]}
                    alt={`Premium product banner ${activeIndex + 1}`}
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

              {/* Soft desktop overlays */}
              <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_35%,rgba(20,39,17,0.12)_100%)] sm:block" />

              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[20%] bg-gradient-to-r from-black/10 to-transparent sm:block" />

              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[20%] bg-gradient-to-l from-black/10 to-transparent sm:block" />

              {/* Desktop previous button */}
              {bannerSources.length > 1 && (
                <button
                  type="button"
                  onClick={showPreviousBanner}
                  aria-label="Show previous banner"
                  className="absolute left-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/75 text-[#31572c] shadow-[0_10px_30px_rgba(25,38,20,0.18)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white sm:flex lg:left-6 lg:h-12 lg:w-12"
                >
                  <ArrowRight
                    className="h-5 w-5 rotate-180"
                    strokeWidth={2.5}
                  />
                </button>
              )}

              {/* Desktop next button */}
              {bannerSources.length > 1 && (
                <button
                  type="button"
                  onClick={showNextBanner}
                  aria-label="Show next banner"
                  className="absolute right-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/75 text-[#31572c] shadow-[0_10px_30px_rgba(25,38,20,0.18)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white sm:flex lg:right-6 lg:h-12 lg:w-12"
                >
                  <ArrowRight
                    className="h-5 w-5"
                    strokeWidth={2.5}
                  />
                </button>
              )}

              {/* Desktop bottom content */}
              <div className="absolute inset-x-0 bottom-0 z-20 hidden items-end justify-between gap-5 p-5 sm:flex lg:p-7">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/45 bg-white/80 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#69451f] shadow-[0_12px_35px_rgba(43,34,18,0.15)] backdrop-blur-xl lg:px-5 lg:text-[11px]">
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
                    className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#214d20_0%,#477a36_100%)] px-5 text-[10px] font-black uppercase tracking-[0.13em] text-white shadow-[0_14px_34px_rgba(36,82,31,0.3)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(36,82,31,0.4)] lg:min-h-12 lg:px-6 lg:text-[11px]"
                  >
                    <ShoppingBag
                      className="h-4 w-4"
                      strokeWidth={2.5}
                    />

                    Shop Now

                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.5}
                    />
                  </Link>

                  <a
                    href={WHOLESALE_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/85 px-5 text-[10px] font-black uppercase tracking-[0.12em] text-[#64401d] shadow-[0_12px_30px_rgba(45,34,18,0.13)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#2e612a] lg:min-h-12 lg:px-6 lg:text-[11px]"
                  >
                    <MessageCircle
                      className="h-4 w-4"
                      strokeWidth={2.5}
                    />

                    Wholesale
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slider dots - outside banner on mobile */}
          {bannerSources.length > 1 && (
            <div className="relative z-30 -mt-3 flex justify-center sm:absolute sm:inset-x-0 sm:bottom-4 sm:mt-0 lg:bottom-5">
              <div className="flex items-center gap-1.5 rounded-full border border-[#ded4c1] bg-[#fffdf8]/95 px-3 py-2 shadow-[0_10px_25px_rgba(51,39,20,0.14)] backdrop-blur-xl sm:border-white/50 sm:bg-white/75">
                {bannerSources.map((banner, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${banner}-${index}`}
                      type="button"
                      aria-label={`Show banner ${index + 1}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-7 bg-[#32652c]"
                          : "w-2 bg-[#c9bba4] hover:bg-[#9c794e]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile content below banner */}
          <div className="mt-3 overflow-hidden rounded-[20px] border border-[#ddd2bf] bg-[linear-gradient(145deg,#fffefb_0%,#f7f0e4_100%)] shadow-[0_14px_35px_rgba(57,43,22,0.08)] sm:hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[#e7ddcc] px-4 py-4">
              <div className="min-w-0">
                <div className="mb-1.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#a2692a]">
                  <Sparkles
                    className="h-3.5 w-3.5"
                    strokeWidth={2.4}
                  />

                  Naturally better
                </div>

                <h1 className="text-[17px] font-black leading-tight tracking-[-0.035em] text-[#22461f]">
                  Pure quality for every home
                </h1>

                <p className="mt-1 text-[10px] font-medium leading-4 text-[#77634e]">
                  Authentic products made for better everyday living.
                </p>
              </div>

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[#d9e3cf] bg-[linear-gradient(145deg,#edf5e7,#dfead6)] text-[#32642d] shadow-sm">
                <Leaf
                  className="h-5 w-5"
                  strokeWidth={2.3}
                />
              </span>
            </div>

            {/* Mobile bullet points below banner */}
            <div className="grid grid-cols-3 gap-2 px-3 py-3">
              {trustPoints.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-[16px] border border-[#e3d8c5] bg-white px-2 py-3 text-center shadow-[0_7px_18px_rgba(61,46,23,0.06)]"
                  >
                    <div className="pointer-events-none absolute -right-3 -top-4 h-10 w-10 rounded-full bg-[#dfead6]/60 blur-lg" />

                    <span className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#edf4e7] text-[#30622b]">
                      <Icon
                        className="h-[17px] w-[17px]"
                        strokeWidth={2.4}
                      />
                    </span>

                    <p className="relative mt-2 text-[8px] font-black uppercase leading-3 tracking-[0.08em] text-[#65472f]">
                      {item.label}
                    </p>

                    <p className="relative mt-0.5 text-[7px] font-medium text-[#9a8064]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[1.05fr_0.95fr] gap-2 border-t border-[#e7ddcc] bg-white/50 p-3">
              <Link
                href="/shop"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-[linear-gradient(135deg,#214e20_0%,#477b36_100%)] px-3 text-[10px] font-black uppercase tracking-[0.11em] text-white shadow-[0_12px_26px_rgba(35,82,31,0.26)] transition active:scale-[0.98]"
              >
                <ShoppingBag
                  className="h-4 w-4"
                  strokeWidth={2.4}
                />

                Shop Now

                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={2.5}
                />
              </Link>

              <a
                href={WHOLESALE_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-[15px] border border-[#d7c9b1] bg-white px-2 text-center text-[8px] font-black uppercase leading-3 tracking-[0.09em] text-[#704820] shadow-sm transition active:scale-[0.98]"
              >
                <MessageCircle
                  className="h-4 w-4 shrink-0 text-[#34712e]"
                  strokeWidth={2.4}
                />

                WhatsApp
                <br />
                Wholesale
              </a>
            </div>
          </div>

          {/* Tablet and desktop trust bar */}
          <div className="mt-3 hidden overflow-hidden rounded-[18px] border border-[#ded3c0] bg-[linear-gradient(90deg,#fffdfa_0%,#f5eddf_50%,#fffdfa_100%)] shadow-[0_12px_30px_rgba(55,42,22,0.07)] sm:flex">
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border border-[#dbe5d3] bg-[#edf4e8] text-[#32642d] transition duration-300 group-hover:scale-105">
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