import type { Product } from "@/app/data/products";
import { fetchPublicProducts } from "@/app/lib/publicDataClient";

export async function fetchFeaturedProducts(): Promise<Product[]> {
    return fetchPublicProducts(12);
}
