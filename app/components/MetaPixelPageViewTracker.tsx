"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPixelPageView } from "@/app/lib/metaPixel";

export default function MetaPixelPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedPath.current === path) return;

    lastTrackedPath.current = path;
    trackMetaPixelPageView(path);
  }, [pathname, searchParams]);

  return null;
}
