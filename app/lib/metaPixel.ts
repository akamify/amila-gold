"use client";

export const META_PIXEL_ID = "27920071607663832";

type MetaPixelScalar = string | number | boolean | null | undefined;
type MetaPixelPayloadValue =
  | MetaPixelScalar
  | Record<string, MetaPixelScalar>
  | Array<MetaPixelScalar | Record<string, MetaPixelScalar>>;
type MetaPixelPayload = Record<string, MetaPixelPayloadValue>;
type MetaPixelCommand = "track" | "trackCustom";

declare global {
  interface Window {
    fbq?: (
      command: "init" | MetaPixelCommand,
      eventName: string,
      parameters?: MetaPixelPayload,
    ) => void;
    _fbq?: Window["fbq"];
  }
}

const isBrowser = () => typeof window !== "undefined";

export function trackMetaPixelEvent(
  eventName: string,
  parameters: MetaPixelPayload = {},
  command: MetaPixelCommand = "track",
) {
  if (!isBrowser() || typeof window.fbq !== "function") return;
  window.fbq(command, eventName, parameters);
}

export function trackMetaPixelPageView(path: string) {
  trackMetaPixelEvent("PageView", { page_path: path });
}

export function buildMetaPixelContentIds(items: Array<{ id: number | string }>) {
  return items.map((item) => String(item.id));
}

export function trackMetaPixelOnce(
  storageKey: string,
  eventName: string,
  parameters: MetaPixelPayload = {},
  command: MetaPixelCommand = "track",
) {
  if (!isBrowser()) return;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Ignore storage failures and still allow the event attempt.
  }
  trackMetaPixelEvent(eventName, parameters, command);
}
