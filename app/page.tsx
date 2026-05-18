import { HeroSection, HeritageSection, FeaturedProducts, SpotlightProducts } from "./components/HomeSections";
import { SlowCraftSection, NewsletterSection } from "./components/HomeSections2";
import TestimonialsSection from "./components/Testimonials";
import { normalizeBackendProduct } from "@/app/lib/backendProducts";
import type { Product } from "@/app/data/products";

type BannerRow = {
  id?: string;
  _id?: string;
  title?: string;
  subtitle?: string;
  targetUrl?: string;
  imageUrl?: string;
};

async function getInitialBanners() {
  const fallbackBase =
    process.env.BACKEND_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8080";
  const base = String(fallbackBase).replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${base}/api/backend/admin/banners/public`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const data = await response.json();
    const rows = Array.isArray(data?.banners) ? (data.banners as BannerRow[]) : [];
    return rows
      .filter((row) => row.imageUrl && row.targetUrl && row.title)
      .map((row) => ({
        id: String(row.id || row._id || row.imageUrl),
        title: String(row.title || ""),
        subtitle: String(row.subtitle || ""),
        href: String(row.targetUrl || "/shop"),
        img: String(row.imageUrl || ""),
      }));
  } catch {
    return [];
  }
}

export default async function HomeRoute() {
  const initialBanners = await getInitialBanners();
  const initialProducts = await getInitialProducts();
  return (
    <main>
      <HeroSection initialBanners={initialBanners} />
      <SpotlightProducts initialProducts={initialProducts} />
      <FeaturedProducts initialProducts={initialProducts} />
      <HeritageSection />
      <SlowCraftSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}

async function getInitialProducts(): Promise<Product[]> {
  const fallbackBase =
    process.env.BACKEND_PROXY_TARGET ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8080";
  const base = String(fallbackBase).replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${base}/user/show-product?limit=12`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const data = await response.json();
    const rows = Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data?.data)
        ? data.data
        : [];
    return rows
      .map(normalizeBackendProduct)
      .filter((item: Product) => Number.isFinite(item.id) && item.id > 0);
  } catch {
    return [];
  }
}
