"use client";

import { useEffect, useRef, useState } from "react";
import HeroSection from "@/app/components/home/HeroSection";
import SpotlightProducts from "@/app/components/home/SpotlightProductsSection";
import FeaturedProducts from "@/app/components/home/FeaturedProductsSection";
import HeritageSection from "@/app/components/home/HeritageSection";
import { SlowCraftSection, NewsletterSection } from "@/app/components/HomeSections2";
import TestimonialsSection from "@/app/components/Testimonials";
import {
  fetchPublicHomepageData,
  type PublicHomepageData,
} from "@/app/lib/publicDataClient";
import {
  HOMEPAGE_RECOVERY_KEY,
  HOMEPAGE_SOFT_REFETCH_KEY,
  readHomepagePublicCache,
  writeHomepagePublicCache,
} from "@/app/lib/homepagePublicCache";

const EMPTY_HOME_DATA: PublicHomepageData = {
  banners: [],
  featuredProducts: [],
  categories: [],
  testimonials: [],
  settings: null,
};

const devLog = (message: string, details?: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[homepage] ${message}`, details ?? "");
  }
};

function hasUsefulData(data: PublicHomepageData) {
  return (
    data.banners.length > 0 ||
    data.featuredProducts.length > 0 ||
    data.testimonials.length > 0 ||
    data.categories.length > 0 ||
    Boolean(data.settings)
  );
}

function warmBackend() {
  try {
    fetch("/api/backend/health", {
      method: "GET",
      cache: "no-store",
      keepalive: true,
    }).catch(() => {
      if (process.env.NODE_ENV !== "production") devLog("warmup failed");
    });
  } catch {
    // ignore warmup failures
  }
}

export default function HomepageClient() {
  const [homepageData, setHomepageData] = useState<PublicHomepageData>(EMPTY_HOME_DATA);
  const [isPublicDataLoading, setIsPublicDataLoading] = useState(true);
  const hasDataRef = useRef(false);
  const requestInFlightRef = useRef(false);

  const applyFreshData = (data: PublicHomepageData) => {
    hasDataRef.current = hasUsefulData(data);
    setHomepageData(data);
    writeHomepagePublicCache(data);
  };

  useEffect(() => {
    warmBackend();

    let active = true;
    const timers: number[] = [];
    const initialCache = readHomepagePublicCache();

    if (initialCache.data && hasUsefulData(initialCache.data)) {
      hasDataRef.current = true;
      setHomepageData(initialCache.data);
    }

    const fetchFresh = async (label: string) => {
      if (requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      if (!hasDataRef.current) setIsPublicDataLoading(true);
      devLog("fresh fetch started", { label });

      try {
        const data = await fetchPublicHomepageData();
        if (!active) return;
        devLog("fresh fetch success", {
          label,
          products: data.featuredProducts.length,
          banners: data.banners.length,
        });
        applyFreshData(data);
      } catch (error) {
        devLog("fresh fetch failed", { label, error });
      } finally {
        requestInFlightRef.current = false;
        if (active) setIsPublicDataLoading(false);
      }
    };

    fetchFresh(initialCache.status === "miss" ? "initial-static" : `initial-${initialCache.status}`);

    if (typeof window !== "undefined" && !window.sessionStorage.getItem(HOMEPAGE_RECOVERY_KEY)) {
      window.sessionStorage.setItem(HOMEPAGE_RECOVERY_KEY, "1");
      timers.push(window.setTimeout(() => fetchFresh("soft-recovery-3s"), 3000));
      timers.push(
        window.setTimeout(() => {
          if (!hasDataRef.current) fetchFresh("soft-recovery-10s");
        }, 10000)
      );
    }

    if (typeof window !== "undefined" && !window.sessionStorage.getItem(HOMEPAGE_SOFT_REFETCH_KEY)) {
      window.sessionStorage.setItem(HOMEPAGE_SOFT_REFETCH_KEY, "1");
      timers.push(window.setTimeout(() => fetchFresh("one-time-soft-refetch"), 1200));
    }

    return () => {
      active = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <main>
      <HeroSection />
      <SpotlightProducts initialProducts={homepageData.featuredProducts} managed loading={isPublicDataLoading && homepageData.featuredProducts.length === 0} />
      <FeaturedProducts initialProducts={homepageData.featuredProducts} managed loading={isPublicDataLoading && homepageData.featuredProducts.length === 0} />
      <HeritageSection />
      <SlowCraftSection />
      <TestimonialsSection initialTestimonials={homepageData.testimonials} managed />
      <NewsletterSection />
    </main>
  );
}
