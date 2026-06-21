import { normalizeBackendProduct } from "@/app/lib/backendProducts";
import { getBackendBaseUrlCandidates } from "@/app/lib/session";
import type { Product } from "@/app/data/products";

export type PublicBanner = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  img: string;
};

export type PublicTestimonial = {
  id?: string | number;
  quote: string;
  name: string;
  role: string;
};

export type PublicHomepageData = {
  banners: PublicBanner[];
  featuredProducts: Product[];
  categories: Array<{ id: string; name: string }>;
  testimonials: PublicTestimonial[];
  settings: Record<string, unknown> | null;
};

type JsonRecord = Record<string, unknown>;
type FetchOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
  next?: { revalidate?: number; tags?: string[] };
};

const EMPTY_HOME_DATA: PublicHomepageData = {
  banners: [],
  featuredProducts: [],
  categories: [],
  testimonials: [],
  settings: null,
};

const devLog = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[public-data] ${message}`, error);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === "object" ? (value as JsonRecord) : {};

function getPublicBaseCandidates() {
  if (typeof window !== "undefined") {
    return ["/api/backend", ...getBackendBaseUrlCandidates().filter((base) => base !== "/api/backend")];
  }

  const direct =
    process.env.BACKEND_PROXY_TARGET ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "";
  const normalizedDirect = String(direct || "").trim().replace(/\/$/, "");
  const candidates = getBackendBaseUrlCandidates().filter((base) => !base.startsWith("/"));
  return Array.from(new Set([normalizedDirect, ...candidates, "http://localhost:8080"].filter(Boolean)));
}

async function fetchJsonWithRetry<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const retries = Math.max(0, options.retries ?? 1);
  const timeoutMs = Math.max(500, options.timeoutMs ?? 2500);
  const backoffMs = Math.max(50, options.backoffMs ?? 900);
  const { timeoutMs: _timeoutMs, retries: _retries, backoffMs: _backoffMs, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method: fetchOptions.method || "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeout);
      if (attempt >= retries) throw error;
      await sleep(backoffMs * (attempt + 1));
    }
  }

  throw new Error("Request failed");
}

function buildUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}${path}`;
}

function mapBanner(value: unknown): PublicBanner | null {
  const row = asRecord(value);
  const image = String(row.imageUrl || row.img || "").trim();
  const href = String(row.targetUrl || row.href || "/shop").trim();
  if (!image) return null;
  return {
    id: String(row.id || row._id || image),
    title: String(row.title || ""),
    subtitle: String(row.subtitle || ""),
    href: href || "/shop",
    img: image,
  };
}

function mapTestimonial(value: unknown): PublicTestimonial | null {
  const row = asRecord(value);
  const quote = String(row.quote || "").trim();
  const name = String(row.name || "").trim();
  if (!quote || !name) return null;
  return {
    id: String(row.id || row._id || name),
    quote,
    name,
    role: String(row.role || ""),
  };
}

function mapCategory(value: unknown) {
  const row = asRecord(value);
  const name = String(row.name || "").trim();
  if (!name) return null;
  return { id: String(row.id || row._id || name), name };
}

function mapHomepagePayload(payload: unknown): PublicHomepageData {
  const data = asRecord(payload);
  const banners = Array.isArray(data.banners) ? data.banners : [];
  const products = Array.isArray(data.featuredProducts)
    ? data.featuredProducts
    : Array.isArray(data.products)
      ? data.products
      : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];

  return {
    banners: banners.map(mapBanner).filter((item): item is PublicBanner => item !== null),
    featuredProducts: products
      .map(normalizeBackendProduct)
      .filter((item: Product) => Number.isFinite(item.id) && item.id > 0),
    categories: categories.map(mapCategory).filter((item): item is { id: string; name: string } => item !== null),
    testimonials: testimonials
      .map(mapTestimonial)
      .filter((item): item is PublicTestimonial => item !== null),
    settings: data.settings && typeof data.settings === "object" ? asRecord(data.settings) : null,
  };
}

async function fetchFromFirstAvailable<T>(
  path: string,
  mapper: (payload: unknown) => T,
  options: FetchOptions
): Promise<T> {
  let lastError: unknown = null;
  for (const base of getPublicBaseCandidates()) {
    try {
      const payload = await fetchJsonWithRetry<unknown>(buildUrl(base, path), options);
      return mapper(payload);
    } catch (error) {
      lastError = error;
      devLog(`failed ${path} via ${base}`, error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${path}`);
}

export async function fetchPublicProducts(limit = 12): Promise<Product[]> {
  return fetchFromFirstAvailable(
    `/user/show-product?limit=${encodeURIComponent(String(limit))}`,
    (payload) => {
      const data = asRecord(payload);
      const rows = Array.isArray(data.products) ? data.products : Array.isArray(data.data) ? data.data : [];
      return rows
        .map(normalizeBackendProduct)
        .filter((item: Product) => Number.isFinite(item.id) && item.id > 0);
    },
    { timeoutMs: 4500, retries: 1, backoffMs: 900, next: { revalidate: 300, tags: ["products"] } }
  );
}

export async function fetchPublicBannersData(): Promise<PublicBanner[]> {
  return fetchFromFirstAvailable(
    "/admin/banners/public",
    (payload) => {
      const rows = Array.isArray(asRecord(payload).banners) ? (asRecord(payload).banners as unknown[]) : [];
      return rows.map(mapBanner).filter((item): item is PublicBanner => item !== null);
    },
    { timeoutMs: 4000, retries: 1, backoffMs: 900, next: { revalidate: 3600, tags: ["banners"] } }
  );
}

export async function fetchPublicTestimonialsData(): Promise<PublicTestimonial[]> {
  return fetchFromFirstAvailable(
    "/admin/testimonials/public",
    (payload) => {
      const rows = Array.isArray(asRecord(payload).testimonials) ? (asRecord(payload).testimonials as unknown[]) : [];
      return rows.map(mapTestimonial).filter((item): item is PublicTestimonial => item !== null);
    },
    { timeoutMs: 4000, retries: 1, backoffMs: 900, next: { revalidate: 3600, tags: ["testimonials"] } }
  );
}

export async function fetchPublicHomepageData(): Promise<PublicHomepageData> {
  try {
    return await fetchFromFirstAvailable(
      "/admin/homepage/public",
      mapHomepagePayload,
      { timeoutMs: 4500, retries: 1, backoffMs: 1000, next: { revalidate: 300, tags: ["homepage", "products", "banners"] } }
    );
  } catch (aggregateError) {
    devLog("aggregate homepage endpoint failed, using settled fallbacks", aggregateError);
  }

  const settled = await Promise.allSettled([
    fetchPublicBannersData(),
    fetchPublicProducts(12),
    fetchPublicTestimonialsData(),
    fetchFromFirstAvailable("/admin/settings/public", (payload) => {
      const settings = asRecord(payload).settings;
      return settings && typeof settings === "object" ? asRecord(settings) : null;
    }, { timeoutMs: 4000, retries: 1, backoffMs: 900, next: { revalidate: 3600, tags: ["settings"] } }),
  ]);

  return {
    ...EMPTY_HOME_DATA,
    banners: settled[0].status === "fulfilled" ? settled[0].value : [],
    featuredProducts: settled[1].status === "fulfilled" ? settled[1].value : [],
    testimonials: settled[2].status === "fulfilled" ? settled[2].value : [],
    settings: settled[3].status === "fulfilled" ? settled[3].value : null,
  };
}
