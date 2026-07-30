export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "854287154395936";

type MetaPixelEventParams = Record<string, string | number | boolean | string[] | Array<Record<string, unknown>>>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackMetaPixelEvent(eventName: string, params?: MetaPixelEventParams) {
  if (typeof window === "undefined" || !META_PIXEL_ID || typeof window.fbq !== "function") {
    return false;
  }

  window.fbq("track", eventName, params || {});
  return true;
}
