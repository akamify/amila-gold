"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPixelPageView } from "@/app/lib/metaPixel";

export default function MetaPixelPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef("");
  const hasSeenInitialPage = useRef(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedPath.current === path) return;

    lastTrackedPath.current = path;
    if (!hasSeenInitialPage.current) {
      hasSeenInitialPage.current = true;
      return;
    }

    trackMetaPixelPageView(path);
  }, [pathname, searchParams]);

  return null;
}
