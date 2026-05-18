import { HeroSection, HeritageSection, FeaturedProducts, SpotlightProducts } from "./components/HomeSections";
import { SlowCraftSection, NewsletterSection } from "./components/HomeSections2";
import TestimonialsSection from "./components/Testimonials";

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
  return (
    <main>
      <HeroSection initialBanners={initialBanners} />
      <SpotlightProducts />
      <FeaturedProducts />
      <HeritageSection />
      <SlowCraftSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
