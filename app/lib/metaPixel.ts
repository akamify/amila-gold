export const META_PIXEL_ID = "27920071607663832";

type MetaPixelScalar = string | number | boolean | null | undefined;
type MetaPixelPayloadValue =
  | MetaPixelScalar
  | Record<string, MetaPixelScalar>
  | Array<MetaPixelScalar | Record<string, MetaPixelScalar>>;
type MetaPixelPayload = Record<string, MetaPixelPayloadValue>;
type MetaPixelCommand = "track" | "trackCustom";
type MetaPixelOptions = {
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (
      command: "init" | MetaPixelCommand,
      eventName: string,
      parameters?: MetaPixelPayload,
      options?: MetaPixelOptions,
    ) => void;
    _fbq?: Window["fbq"];
  }
}

const isBrowser = () => typeof window !== "undefined";

function cleanMetaPixelValue(value: MetaPixelPayloadValue): MetaPixelPayloadValue {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (entry && typeof entry === "object") {
          return Object.fromEntries(
            Object.entries(entry).filter(([, itemValue]) => typeof itemValue !== "undefined"),
          );
        }
        return entry;
      })
      .filter((entry) => typeof entry !== "undefined");
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, itemValue]) => typeof itemValue !== "undefined"),
    );
  }

  return value;
}

function cleanMetaPixelPayload(parameters: MetaPixelPayload) {
  return Object.fromEntries(
    Object.entries(parameters)
      .filter(([, value]) => typeof value !== "undefined")
      .map(([key, value]) => [key, cleanMetaPixelValue(value)]),
  );
}

export function trackMetaPixelEvent(
  eventName: string,
  parameters: MetaPixelPayload = {},
  command: MetaPixelCommand = "track",
  options?: MetaPixelOptions,
) {
  if (!isBrowser() || typeof window.fbq !== "function") return;
  window.fbq(command, eventName, cleanMetaPixelPayload(parameters), options);
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
  options?: MetaPixelOptions,
) {
  if (!isBrowser()) return;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Ignore storage failures and still allow the event attempt.
  }
  trackMetaPixelEvent(eventName, parameters, command, options);
}
