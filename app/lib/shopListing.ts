import type { Product as BackendProduct } from "@/app/data/products";
import { matchVariantByCartSize } from "@/app/lib/backendProducts";

export type ListingProduct = {
  id: number;
  publicId?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  collection?: string;
  description?: string;
  quantity: number;
  variants?: BackendProduct["variants"];
};

/** Normalize weight labels for comparison (spacing/case). */
export function normWeightToken(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function finitePrice(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) && x >= 0 ? x : 0;
}

/** Min/max selling price across variants (or product-level price). */
export function minMaxListingPrice(p: ListingProduct): { min: number; max: number } {
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const valid = p.variants.map((v) =>
      finitePrice(
        (v as { price?: unknown; selling_price?: unknown }).price ??
          (v as { selling_price?: unknown }).selling_price
      )
    );
    return { min: Math.min(...valid), max: Math.max(...valid) };
  }
  const base = finitePrice(p.price);
  return { min: base, max: base };
}

/** True if product has at least one variant/label matching selected weight chips. */
export function productMatchesWeightFilters(p: ListingProduct, selectedWeights: string[]): boolean {
  if (!selectedWeights.length) return true;
  return selectedWeights.some((weight) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      return p.variants.some((v) => normWeightToken(String(v.label || "")) === normWeightToken(weight));
    }
    const w = weight.toLowerCase();
    return p.name.toLowerCase().includes(w) || String(p.description || "").toLowerCase().includes(w);
  });
}

/** Price used for sorting: cheapest offer, or variant matching selected weights when set. */
export function sortPriceForProduct(p: ListingProduct, selectedWeights: string[]): number {
  if (selectedWeights.length > 0 && Array.isArray(p.variants) && p.variants.length > 0) {
    for (const w of selectedWeights) {
      const m = matchVariantByCartSize(p, w);
      if (m) {
        return finitePrice(
          (m as { price?: unknown; selling_price?: unknown }).price ??
            (m as { selling_price?: unknown }).selling_price ??
            p.price
        );
      }
    }
  }
  return finitePrice(minMaxListingPrice(p).min);
}

export function compareListingPriceAsc(a: ListingProduct, b: ListingProduct, selectedWeights: string[]) {
  const d = sortPriceForProduct(a, selectedWeights) - sortPriceForProduct(b, selectedWeights);
  return d !== 0 ? d : a.id - b.id;
}

export function compareListingPriceDesc(a: ListingProduct, b: ListingProduct, selectedWeights: string[]) {
  const d = sortPriceForProduct(b, selectedWeights) - sortPriceForProduct(a, selectedWeights);
  return d !== 0 ? d : a.id - b.id;
}

/**
 * Variant shown in grid + add-to-cart: honor weight filters, else first in-stock, else first.
 * Mirrors search page behavior.
 */
export function resolveListingVariant(p: ListingProduct, selectedWeights: string[]) {
  const variants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : null;
  if (variants) {
    const selectedMatches = [];
    for (const w of selectedWeights) {
      const m = matchVariantByCartSize(p, w);
      if (m) {
        selectedMatches.push(m);
      }
    }
    const selectedMatch = selectedMatches.find((variant) => Number(variant.stock || 0) > 0) || selectedMatches[0];
    if (selectedMatch) {
      return {
        label: selectedMatch.label,
        price: Number(selectedMatch.price ?? p.price ?? 0),
        originalPrice: selectedMatch.originalPrice ?? p.originalPrice,
        image: selectedMatch.image && selectedMatch.image.trim() ? selectedMatch.image : p.image,
        stock: Math.max(0, Number(selectedMatch.stock || 0)),
      };
    }
    const withStock = variants.find((v) => Number(v.stock || 0) > 0);
    if (withStock) {
      return {
        label: withStock.label,
        price: Number(withStock.price ?? p.price ?? 0),
        originalPrice: withStock.originalPrice ?? p.originalPrice,
        image: withStock.image && withStock.image.trim() ? withStock.image : p.image,
        stock: Math.max(0, Number(withStock.stock || 0)),
      };
    }
    const first = variants[0];
    return {
      label: first.label,
      price: Number(first.price ?? p.price ?? 0),
      originalPrice: first.originalPrice ?? p.originalPrice,
      image: first.image && first.image.trim() ? first.image : p.image,
      stock: Math.max(0, Number(first.stock || 0)),
    };
  }
  return {
    label: "",
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    stock: Math.max(0, Number(p.quantity || 0)),
  };
}

/** Union of variant labels from catalog + common defaults for filter chips. */
export function collectWeightOptions(products: ListingProduct[]): string[] {
  const set = new Set<string>();
  const defaults = ["100g", "250g", "500g", "1kg", "2kg", "5kg"];
  defaults.forEach((d) => set.add(d));
  for (const p of products) {
    p.variants?.forEach((v) => {
      const lab = String(v?.label || "").trim();
      if (lab) set.add(lab);
    });
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
