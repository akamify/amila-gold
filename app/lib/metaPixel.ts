const parsePixelIds = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

const DEFAULT_META_PIXEL_IDS = ["1517846239807807", "914367171674247"];

export const META_PIXEL_IDS = Array.from(
  new Set([
    ...parsePixelIds(
      [
        process.env.NEXT_PUBLIC_META_PIXEL_IDS,
        process.env.NEXT_PUBLIC_META_PIXEL_ID,
      ]
        .filter(Boolean)
        .join(","),
    ),
    ...DEFAULT_META_PIXEL_IDS,
  ]),
);

export const META_PIXEL_ID = META_PIXEL_IDS[0] || "";

type MetaPixelEventParams = Record<string, string | number | boolean | string[] | Array<Record<string, unknown>>>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackMetaPixelEvent(eventName: string, params?: MetaPixelEventParams) {
  if (typeof window === "undefined" || META_PIXEL_IDS.length === 0 || typeof window.fbq !== "function") {
    return false;
  }

  window.fbq("track", eventName, params || {});
  return true;
}
