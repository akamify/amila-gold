"use client";

import React, { useEffect, useRef, useState } from "react";
import * as apiClient from "../lib/apiClient";
import { TestimonialsGridSkeleton } from "./Skeletons";

type TestimonialItem = {
  id?: string | number;
  quote: string;
  name: string;
  role: string;
};

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [];
const TESTIMONIALS_STORAGE_KEY = 'sr_testimonials';
const TESTIMONIALS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Load testimonials from localStorage (fast initial load)
  const getCachedTestimonials = (): TestimonialItem[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
      if (!cached) return null;
      const data = JSON.parse(cached);
      if (data.timestamp && Date.now() - data.timestamp < TESTIMONIALS_CACHE_TIME) {
        return data.testimonials;
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveToCache = (items: TestimonialItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify({
        testimonials: items,
        timestamp: Date.now(),
      }));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    // Try to load from cache first for fast initial display
    const cached = getCachedTestimonials();
    if (cached && cached.length > 0) {
      setTestimonials(cached);
      setIsLoading(false);
    }

    // Then fetch from API
    const fetchFnUnknown =
      (apiClient as Record<string, unknown>).fetchAdminTestimonials ??
      (apiClient as Record<string, unknown>).fetchAdminTestimonial;

    if (typeof fetchFnUnknown !== "function") {
      setIsLoading(false);
      return;
    }

    (fetchFnUnknown as () => Promise<unknown>)()
      .then((rowsUnknown) => {
        if (!Array.isArray(rowsUnknown) || rowsUnknown.length === 0) return;

        type RawRow = { id: string | number; quote: string; name: string; role?: string | null };
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
        // If API fails, keep cached data if available
        if (!cached || cached.length === 0) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const scrollTrack = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-testimonial-card]");
    const cardWidth = card?.offsetWidth ?? 0;
    const step = cardWidth + 24;
    track.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 lg:py-32 bg-surface overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 md:mb-16">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl md:text-5xl text-primary leading-tight">
              Shared Stories from the <br className="hidden md:block" />
              <span className="italic text-secondary">Modern Agrarian</span>{" "}
              Table
            </h2>
          </div>

          <div className="hidden md:flex gap-3 justify-end">
            <button
              onClick={() => scrollTrack("prev")}
              className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 transition-all"
              aria-label="Previous Testimonial"
              type="button"
            >
              <svg
                width="24"
                height="24"
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
              className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 transition-all"
              aria-label="Next Testimonial"
              type="button"
            >
              <svg
                width="24"
                height="24"
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
        </div>

        <div className="flex md:hidden justify-end gap-3 mb-5">
          <button
            onClick={() => scrollTrack("prev")}
            className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 transition-all"
            aria-label="Previous Testimonial"
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
            className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 transition-all"
            aria-label="Next Testimonial"
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

        <div className="relative overflow-hidden">
          {isLoading ? (
            <TestimonialsGridSkeleton count={3} />
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">chat_bubble_outline</span>
                </div>
                <h3 className="font-headline text-2xl md:text-3xl text-primary mb-3">
                  No Testimonials Yet
                </h3>
                <p className="text-on-surface-variant/70 max-w-md mx-auto">
                  Be the first to share your experience with our community. Your feedback helps others discover the authentic taste of tradition.
                </p>
            </div>
          ) : (
              <div
                ref={trackRef}
                className="hide-scrollbar flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth"
              >
                {testimonials.map((t, index) => (
                  <div
                    key={t.id || `${t.name}-${index}`}
                    data-testimonial-card
                    className="testimonial-card snap-start [flex:0_0_85%] md:[flex:0_0_45%] lg:[flex:0_0_30%] shrink-0 p-8 md:p-10 bg-surface-container-low rounded-[2rem] hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <svg
                        className="w-10 h-10 text-secondary/30 mb-6"
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

                      <p className="text-on-surface text-lg md:text-xl font-headline italic mb-10 leading-relaxed">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-4 border-t border-primary/10 pt-6 mt-auto">
                      <div
                        className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-headline text-xl text-primary font-bold shrink-0 shadow-sm"
                        aria-hidden="true"
                      >
                        {t.name.trim().charAt(0).toLocaleUpperCase() || "?"}
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-sm md:text-base">
                          {t.name}
                        </h5>
                        <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
                          {t.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
