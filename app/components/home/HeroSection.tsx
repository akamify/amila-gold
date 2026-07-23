"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MessageCircle,
  Pause,
  Play,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import type { PublicBanner } from "@/app/lib/publicDataClient";
import { getWholesaleWhatsAppUrl } from "@/app/lib/whatsapp";

const FALLBACK_BANNERS = ["/banner.png", "/banner2.png", "/banner3.png"];

const AUTOPLAY_DELAY = 5500;
const SWIPE_THRESHOLD = 55;
const MAX_BANNERS = 6;

const WHOLESALE_WHATSAPP_URL = getWholesaleWhatsAppUrl();

type HeroSectionProps = {
  initialBanners?: PublicBanner[];
  managed?: boolean;
};

type SlideDirection = 1 | -1;

function getBannerSources(initialBanners?: PublicBanner[]) {
  const managedBanners = Array.isArray(initialBanners)
    ? initialBanners
        .map((banner) => String(banner?.img || "").trim())
        .filter(Boolean)
    : [];

  return Array.from(new Set([...managedBanners, ...FALLBACK_BANNERS])).slice(
    0,
    MAX_BANNERS,
  );
}

const slideVariants = {
  enter: (direction: SlideDirection) => ({
    opacity: 0,
    x: direction > 0 ? "4%" : "-4%",
    scale: 1.025,
    filter: "blur(2px)",
  }),

  center: {
    opacity: 1,
    x: "0%",
    scale: 1,
    filter: "blur(0px)",
  },

  exit: (direction: SlideDirection) => ({
    opacity: 0,
    x: direction > 0 ? "-3%" : "3%",
    scale: 1.01,
    filter: "blur(1px)",
  }),
};

export default function HeroSection({ initialBanners }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  const bannerSources = useMemo(
    () => getBannerSources(initialBanners),
    [initialBanners],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const totalBanners = bannerSources.length;
  const hasMultipleBanners = totalBanners > 1;

  const isAutoplayPaused =
    isHovered ||
    isFocused ||
    isDocumentHidden ||
    !isAutoplayEnabled ||
    Boolean(prefersReducedMotion);

  useEffect(() => {
    setActiveIndex(0);
    setDirection(1);
  }, [bannerSources]);

  const changeSlide = useCallback(
    (nextIndex: number, nextDirection: SlideDirection) => {
      if (totalBanners <= 1) return;

      const normalizedIndex = (nextIndex + totalBanners) % totalBanners;

      setDirection(nextDirection);
      setActiveIndex(normalizedIndex);
    },
    [totalBanners],
  );

  const showPreviousBanner = useCallback(() => {
    changeSlide(activeIndex - 1, -1);
  }, [activeIndex, changeSlide]);

  const showNextBanner = useCallback(() => {
    changeSlide(activeIndex + 1, 1);
  }, [activeIndex, changeSlide]);

  const showBanner = useCallback(
    (index: number) => {
      if (index === activeIndex) return;

      const directDistance = index - activeIndex;
      const wrappedDistance =
        directDistance > 0
          ? directDistance - totalBanners
          : directDistance + totalBanners;

      const nextDirection: SlideDirection =
        Math.abs(directDistance) <= Math.abs(wrappedDistance)
          ? directDistance > 0
            ? 1
            : -1
          : wrappedDistance > 0
            ? 1
            : -1;

      changeSlide(index, nextDirection);
    },
    [activeIndex, changeSlide, totalBanners],
  );

  useEffect(() => {
    if (!hasMultipleBanners || isAutoplayPaused) return;

    const autoplayTimer = window.setTimeout(() => {
      changeSlide(activeIndex + 1, 1);
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearTimeout(autoplayTimer);
    };
  }, [activeIndex, changeSlide, hasMultipleBanners, isAutoplayPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentHidden(document.hidden);
    };

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!hasMultipleBanners) return;

    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        showPreviousBanner();
      }

      if (event.key === "ArrowRight") {
        showNextBanner();
      }
    };

    window.addEventListener("keydown", handleKeyboardNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [hasMultipleBanners, showNextBanner, showPreviousBanner]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchCurrentX.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchCurrentX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) {
      touchStartX.current = null;
      touchCurrentX.current = null;
      return;
    }

    const distance = touchStartX.current - touchCurrentX.current;

    if (Math.abs(distance) >= SWIPE_THRESHOLD) {
      if (distance > 0) {
        showNextBanner();
      } else {
        showPreviousBanner();
      }
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  if (!totalBanners) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f9f6ef_0%,#f0eadf_100%)] px-1 py-1.5 sm:px-1.5 sm:py-2 lg:px-2">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-28 -top-32 h-80 w-80 rounded-full bg-[#577e42]/10 blur-[90px]" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#c39246]/10 blur-[95px]" />
        <div className="absolute left-1/2 top-1/2 h-48 w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-[80px]" />
      </div>

      <div className="mx-auto w-full max-w-[1536px]">
        <div
          className="overflow-hidden rounded-[8px] border border-[#d9cfbe] bg-[#fffdf9] shadow-[0_18px_55px_rgba(54,43,24,0.12)] sm:rounded-[10px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsFocused(false);
            }
          }}
        >
          {/* Main banner */}
          <div
            className="group/hero relative aspect-[2172/724] w-full touch-pan-y overflow-hidden bg-[#eee6d7]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="sync">
              <motion.div
                key={`${bannerSources[activeIndex]}-${activeIndex}`}
                custom={direction}
                variants={slideVariants}
                initial={prefersReducedMotion ? false : "enter"}
                animate="center"
                exit={prefersReducedMotion ? undefined : "exit"}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        x: {
                          duration: 0.72,
                          ease: [0.22, 1, 0.36, 1],
                        },
                        opacity: {
                          duration: 0.42,
                          ease: "easeOut",
                        },
                        scale: {
                          duration: 0.85,
                          ease: [0.22, 1, 0.36, 1],
                        },
                        filter: {
                          duration: 0.38,
                          ease: "easeOut",
                        },
                      }
                }
                className="absolute inset-0"
              >
                <Image
                  src={bannerSources[activeIndex]}
                  alt={`Amila Gold promotional banner ${activeIndex + 1}`}
                  fill
                  priority={activeIndex === 0}
                  fetchPriority={activeIndex === 0 ? "high" : "auto"}
                  quality={100}
                  sizes="(max-width: 640px) 100vw, (max-width: 1536px) 100vw, 1536px"
                  className="select-none object-cover object-center"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Premium visual overlays */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_45%,rgba(24,49,20,0.06)_100%)]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-black/[0.055] to-transparent"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-black/[0.055] to-transparent"
            />

            {/* Banner count */}
            {hasMultipleBanners && (
              <div className="absolute right-2 top-2 z-20 hidden items-center rounded-full border border-white/70 bg-black/25 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-white shadow-lg backdrop-blur-md sm:flex">
                {String(activeIndex + 1).padStart(2, "0")}
                <span className="mx-1 opacity-60">/</span>
                {String(totalBanners).padStart(2, "0")}
              </div>
            )}

            {/* Slider arrows */}
            {hasMultipleBanners && (
              <>
                <button
                  type="button"
                  onClick={showPreviousBanner}
                  aria-label="Show previous banner"
                  className="hidden lg:flex absolute left-5 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white transition-all duration-300 hover:scale-110 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
                >
                  <ChevronLeft className="h-7 w-7" strokeWidth={2.8} />
                </button>

                <button
                  type="button"
                  onClick={showNextBanner}
                  aria-label="Show next banner"
                  className="hidden lg:flex absolute right-5 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white transition-all duration-300 hover:scale-110 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
                >
                  <ChevronRight className="h-7 w-7" strokeWidth={2.8} />
                </button>
              </>
            )}
          </div>

          {/* Desktop action strip */}
          <div className="hidden min-h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-5 border-t border-[#ded3c1] bg-[linear-gradient(90deg,#fffdfa_0%,#f5eee3_50%,#fffdfa_100%)] px-4 py-2.5 sm:grid lg:min-h-[82px] lg:gap-8 lg:px-7">
            <div className="flex justify-start">
              <Link
                href="/shop"
                className="group/shop relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#316d31] bg-[linear-gradient(135deg,#123f19_0%,#28682c_54%,#4d8d42_100%)] px-6 text-[10px] font-black uppercase tracking-[0.13em] text-white shadow-[0_12px_30px_rgba(28,91,35,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_17px_36px_rgba(28,91,35,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397435] focus-visible:ring-offset-2 active:translate-y-0 lg:px-8 lg:text-[11px]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.22)_50%,transparent_75%)] transition-transform duration-700 group-hover/shop:translate-x-full"
                />

                <ShoppingBag
                  className="relative h-4 w-4 shrink-0"
                  strokeWidth={2.6}
                />

                <span className="relative whitespace-nowrap">Shop Now</span>

                <ArrowRight
                  className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover/shop:translate-x-1"
                  strokeWidth={2.7}
                />
              </Link>
            </div>

            {/* Quality badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#d5dfcf] bg-white/90 px-4 py-2 shadow-[0_8px_22px_rgba(45,66,34,0.08)] backdrop-blur-md lg:px-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d5e2d0] bg-[#edf5e9] text-[#32662f]">
                  <ShieldCheck
                    className="h-[18px] w-[18px]"
                    strokeWidth={2.5}
                  />
                </span>

                <div>
                  <p className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.15em] text-[#674a31] lg:text-[10px]">
                    Quality Assured
                  </p>

                  <p className="mt-0.5 whitespace-nowrap text-[9px] font-medium text-[#9a826a] lg:text-[10px]">
                    Carefully checked
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href={WHOLESALE_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group/wholesale relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full border-2 border-[#397738] bg-[linear-gradient(180deg,#ffffff_0%,#eef7eb_100%)] px-6 text-[9px] font-black uppercase tracking-[0.1em] text-[#285f29] shadow-[0_10px_27px_rgba(38,95,35,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eaf6e6] hover:shadow-[0_15px_34px_rgba(38,95,35,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397435] focus-visible:ring-offset-2 active:translate-y-0 lg:px-8 lg:text-[10px]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.75)_50%,transparent_75%)] transition-transform duration-700 group-hover/wholesale:translate-x-full"
                />

                <MessageCircle
                  className="relative h-4 w-4 shrink-0"
                  strokeWidth={2.7}
                />

                <span className="relative whitespace-nowrap">
                  WhatsApp Wholesale
                </span>

                <ArrowRight
                  className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover/wholesale:translate-x-1"
                  strokeWidth={2.7}
                />
              </a>
            </div>
          </div>

          {/* Mobile action section */}
          <div className="border-t border-[#ded3c1] bg-[linear-gradient(180deg,#fffefa_0%,#f7f0e5_100%)] p-2.5">
            <div className="mb-2 hidden lg:block flex items-center justify-between rounded-[12px] border border-[#ddd6c8] bg-white/75 px-2.5 py-2 shadow-[0_5px_16px_rgba(54,42,22,0.06)]">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf5e9] text-[#32662f]">
                  <CircleCheck className="h-4 w-4" strokeWidth={2.6} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[8px] font-black uppercase tracking-[0.12em] text-[#65492f]">
                    Quality Assured
                  </p>

                  <p className="mt-0.5 truncate text-[7.5px] font-medium text-[#957e66]">
                    Pure, carefully checked products
                  </p>
                </div>
              </div>

              {hasMultipleBanners && (
                <button
                  type="button"
                  onClick={() => setIsAutoplayEnabled((current) => !current)}
                  aria-label={
                    isAutoplayEnabled
                      ? "Pause banner autoplay"
                      : "Play banner autoplay"
                  }
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d6dfd0] bg-[#f3f8f0] text-[#356831] transition active:scale-95"
                >
                  {isAutoplayEnabled ? (
                    <Pause className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Play className="ml-0.5 h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/shop"
                className="group/shop relative inline-flex min-h-[46px] items-center justify-center gap-1.5 overflow-hidden rounded-[12px] border border-[#347035] bg-[linear-gradient(135deg,#143f19_0%,#28672c_55%,#4b8a40_100%)] px-2 text-[8.5px] font-black uppercase tracking-[0.08em] text-white shadow-[0_9px_22px_rgba(30,92,36,0.3)] transition active:scale-[0.98]"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2.6} />

                <span className="whitespace-nowrap">Shop Now</span>

                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/shop:translate-x-0.5"
                  strokeWidth={2.7}
                />
              </Link>

              <a
                href={WHOLESALE_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group/wholesale inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-[12px] border-2 border-[#397638] bg-[linear-gradient(180deg,#ffffff_0%,#edf7e9_100%)] px-1.5 text-center text-[7.5px] font-black uppercase leading-[9px] tracking-[0.05em] text-[#285e28] shadow-[0_8px_19px_rgba(37,91,34,0.16)] transition active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.6} />

                <span>
                  WhatsApp
                  <br />
                  Wholesale
                </span>

                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/wholesale:translate-x-0.5"
                  strokeWidth={2.7}
                />
              </a>
            </div>
          </div>

          {/* Bottom slider navigation */}
          {hasMultipleBanners && (
            <div className="relative flex min-h-[27px] items-center justify-center border-t border-[#e2d9ca] bg-[#fffdf9] px-3 py-1.5">
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Promotional banners"
              >
                {bannerSources.map((banner, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${banner}-${index}`}
                      type="button"
                      role="tab"
                      aria-label={`Show banner ${index + 1}`}
                      aria-selected={isActive}
                      onClick={() => showBanner(index)}
                      className={[
                        "relative h-1.5 overflow-hidden rounded-full",
                        "transition-all duration-500 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-[#3b7135] focus-visible:ring-offset-2",
                        isActive
                          ? "w-8 bg-[#dfe9da]"
                          : "w-1.5 bg-[#cbbda6] hover:w-3 hover:bg-[#9b7951]",
                      ].join(" ")}
                    >
                      {isActive && (
                        <motion.span
                          key={`progress-${activeIndex}-${isAutoplayPaused}`}
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: isAutoplayPaused ? 0 : 1,
                          }}
                          transition={{
                            duration: isAutoplayPaused
                              ? 0
                              : AUTOPLAY_DELAY / 1000,
                            ease: "linear",
                          }}
                          className="absolute inset-0 origin-left rounded-full bg-[#32682f]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <span className="absolute right-3 text-[8px] font-bold tracking-[0.1em] text-[#9a856c] sm:hidden">
                {activeIndex + 1}/{totalBanners}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
