"use client";
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import React, { useEffect, useRef, useState } from "react";
import {
  fetchPublicTestimonialsData,
  type PublicTestimonial,
} from "../lib/publicDataClient";
import { TestimonialsGridSkeleton } from "./Skeletons";

type TestimonialItem = {
  id?: string | number;
  quote: string;
  name: string;
  role: string;
};

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [];
const TESTIMONIALS_STORAGE_KEY = "sr_testimonials";
const TESTIMONIALS_CACHE_TIME = 5 * 60 * 1000;

function TestimonialsSection({
  initialTestimonials = [],
  managed = false,
}: {
  initialTestimonials?: PublicTestimonial[];
  managed?: boolean;
}) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    initialTestimonials.length ? initialTestimonials : FALLBACK_TESTIMONIALS,
  );
  const [isLoading, setIsLoading] = useState(initialTestimonials.length === 0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const getCachedTestimonials = (): TestimonialItem[] | null => {
    if (typeof window === "undefined") return null;

    try {
      const cached = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);

      if (!cached) return null;

      const data = JSON.parse(cached);

      if (
        data.timestamp &&
        Date.now() - data.timestamp < TESTIMONIALS_CACHE_TIME
      ) {
        return data.testimonials;
      }

      return null;
    } catch {
      return null;
    }
  };

  const saveToCache = (items: TestimonialItem[]) => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        TESTIMONIALS_STORAGE_KEY,
        JSON.stringify({
          testimonials: items,
          timestamp: Date.now(),
        }),
      );
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (initialTestimonials.length > 0) {
      setTestimonials(initialTestimonials);
      setIsLoading(false);
    } else if (managed) {
      setTestimonials(FALLBACK_TESTIMONIALS);
      setIsLoading(false);
    }
  }, [initialTestimonials, managed]);

  useEffect(() => {
    if (managed) return;

    const cached = getCachedTestimonials();

    if (cached && cached.length > 0) {
      setTestimonials(cached);
      setIsLoading(false);
    }

    fetchPublicTestimonialsData()
      .then((rowsUnknown) => {
        if (!Array.isArray(rowsUnknown) || rowsUnknown.length === 0) return;

        type RawRow = {
          id: string | number;
          quote: string;
          name: string;
          role?: string | null;
        };

        const rows = rowsUnknown as RawRow[];

        const mappedTestimonials = rows.map((row) => ({
          id: row.id,
          quote: row.quote,
          name: row.name,
          role: row.role || "",
        }));

        setTestimonials(mappedTestimonials);
        saveToCache(mappedTestimonials);
      })
      .catch(() => {
        if (!cached || cached.length === 0) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [managed]);

  const updateScrollControls = () => {
    const track = trackRef.current;

    if (!track) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);

    setCanScrollPrev(track.scrollLeft > 2);
    setCanScrollNext(track.scrollLeft < maxScroll);
  };

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    updateScrollControls();

    const onScroll = () => updateScrollControls();
    const onResize = () => updateScrollControls();

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [testimonials.length, isLoading]);

  const scrollTrack = (direction: "prev" | "next") => {
    const track = trackRef.current;

    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-testimonial-card]");
    const cardWidth = card?.offsetWidth ?? 0;
    const step = cardWidth + 24;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);

    const nextLeft =
      direction === "next"
        ? Math.min(track.scrollLeft + step, maxScroll)
        : Math.max(track.scrollLeft - step, 0);

    track.scrollTo({ left: nextLeft, behavior: "smooth" });
    window.setTimeout(updateScrollControls, 350);
  };

  const controlsVisible = canScrollPrev || canScrollNext;

  return (
    <section className="testimonials-section overflow-hidden bg-surface py-8 md:py-10 lg:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-6 flex flex-col gap-5 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary/80">
              Customer words
            </p>

            <h2 className="font-headline text-3xl leading-tight text-primary md:text-4xl lg:text-[42px]">
              Shared Stories from the{" "}
              <span className="italic text-secondary">Modern Agrarian</span>{" "}
              Table
            </h2>
          </div>

          {controlsVisible ? (
            <div className="hidden gap-3 md:flex md:justify-end">
              <button
                onClick={() => scrollTrack("prev")}
                disabled={!canScrollPrev}
                className="grid h-11 w-11 place-items-center rounded-full border border-primary/20 text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous testimonial"
                type="button"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={() => scrollTrack("next")}
                disabled={!canScrollNext}
                className="grid h-11 w-11 place-items-center rounded-full border border-primary/20 text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next testimonial"
                type="button"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>

        {controlsVisible ? (
          <div className="mb-4 flex justify-end gap-3 md:hidden">
            <button
              onClick={() => scrollTrack("prev")}
              disabled={!canScrollPrev}
              className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous testimonial"
              type="button"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => scrollTrack("next")}
              disabled={!canScrollNext}
              className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next testimonial"
              type="button"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="relative overflow-hidden">
          {isLoading ? (
            <TestimonialsGridSkeleton count={3} />
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[18px] border border-primary/10 bg-surface-container-low px-5 py-12 text-center md:py-16">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest">
                <SymbolIcon name={"chat_bubble_outline"} className="text-3xl text-on-surface-variant/40" />
              </div>

              <h3 className="font-headline mb-2 text-2xl text-primary md:text-3xl">
                No Testimonials Yet
              </h3>

              <p className="mx-auto max-w-md text-sm leading-6 text-on-surface-variant/70">
                Be the first to share your experience with our community. Your
                feedback helps others discover the authentic taste of tradition.
              </p>
            </div>
          ) : (
            <div
              ref={trackRef}
              className="testimonials-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 md:gap-5 lg:gap-6"
            >
              {testimonials.map((t, index) => (
                <div
                  key={t.id || `${t.name}-${index}`}
                  data-testimonial-card
                  className="testimonial-card flex min-h-[270px] shrink-0 snap-start flex-col justify-between rounded-[22px] bg-surface-container-low p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm sm:min-h-[250px] sm:[flex:0_0_72%] md:min-h-[265px] md:[flex:0_0_44%] md:p-6 lg:min-h-[285px] lg:[flex:0_0_31.5%]"
                >
                  <div className="min-w-0">
                    <svg
                      className="mb-4 h-8 w-8 text-secondary/30 md:mb-5 md:h-9 md:w-9"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path
                        d="M3.983 21L3.983 18C3.983 16.8954 4.87843 16 5.983 16H8.983C9.53528 16 9.983 15.5523 9.983 15V9C9.983 8.44772 9.53528 8 8.983 8H4.983C4.43071 8 3.983 8.44772 3.983 9V11"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>

                    <p className="testimonial-quote font-headline line-clamp-5 text-base italic leading-relaxed text-on-surface md:text-lg">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-primary/10 pt-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-headline text-lg font-bold text-primary shadow-sm"
                      aria-hidden="true"
                    >
                      {t.name.trim().charAt(0).toLocaleUpperCase() || "?"}
                    </div>

                    <div className="min-w-0">
                      <h5 className="truncate text-sm font-bold text-on-surface md:text-base">
                        {t.name}
                      </h5>

                      {t.role ? (
                        <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                          {t.role}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .testimonials-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior-x: contain;
        }

        .testimonials-track::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .testimonial-card {
          transform: translateZ(0);
        }

        @media (max-width: 639px) {
          .testimonial-card {
            flex: 0 0 86%;
          }
        }

        @media (min-width: 1024px) {
          .testimonial-quote {
            display: -webkit-box;
            -webkit-line-clamp: 5;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .testimonial-card {
            transition: none !important;
            transform: none !important;
          }

          .testimonials-track {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

export default TestimonialsSection;