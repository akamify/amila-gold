"use client";

import { RefObject, useEffect, useState } from "react";

export function useDesktopFloatingBarVisibility(sentinelRef: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let sentinelInView = true;
    let footerInView = false;
    let scrolled = false;
    let rafId = 0;

    const compute = () => {
      setVisible(Boolean(scrolled && !sentinelInView && !footerInView));
    };

    const onScroll = () => {
      const next = window.scrollY > 40;
      if (next === scrolled) return;
      scrolled = next;
      compute();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let sentinelObserver: IntersectionObserver | null = null;
    let footerObserver: IntersectionObserver | null = null;

    const setupObservers = () => {
      const sentinelEl = sentinelRef.current;
      const footerEl = document.querySelector("[data-footer-sentinel]") || document.querySelector("[data-site-footer]");

      if (!sentinelEl) {
        rafId = window.requestAnimationFrame(setupObservers);
        return;
      }

      sentinelObserver = new IntersectionObserver(
        ([entry]) => {
          sentinelInView = Boolean(entry?.isIntersecting);
          compute();
        },
        { root: null, threshold: 0, rootMargin: "0px 0px 60% 0px" },
      );

      sentinelObserver.observe(sentinelEl);

      if (footerEl) {
        footerObserver = new IntersectionObserver(
          ([entry]) => {
            footerInView = Boolean(entry?.isIntersecting);
            compute();
          },
          { root: null, threshold: 0, rootMargin: "0px" },
        );
        footerObserver.observe(footerEl);
      }

      compute();
    };

    setupObservers();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(rafId);
      sentinelObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, [sentinelRef]);

  return visible;
}
