import HeroSection from "./components/home/HeroSection";
import HeritageSection from "./components/home/HeritageSection";
import FeaturedProducts from "./components/home/FeaturedProductsSection";
import SpotlightProducts from "./components/home/SpotlightProductsSection";
import { SlowCraftSection, NewsletterSection } from "./components/HomeSections2";
import TestimonialsSection from "./components/Testimonials";
import { fetchPublicHomepageData } from "@/app/lib/publicDataClient";

export const revalidate = 300;

export default async function HomeRoute() {
  const homepage = await fetchPublicHomepageData();

  return (
    <main>
      <HeroSection initialBanners={homepage.banners} />
      <SpotlightProducts initialProducts={homepage.featuredProducts} />
      <FeaturedProducts initialProducts={homepage.featuredProducts} />
      <HeritageSection />
      <SlowCraftSection />
      <TestimonialsSection initialTestimonials={homepage.testimonials} />
      <NewsletterSection />
    </main>
  );
}
