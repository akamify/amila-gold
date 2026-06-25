import React from "react";
import type { Metadata } from "next";
import { createProductHref, formatProductNameForPath } from "@/app/data/products";
import { fetchBackendProductById } from "@/app/lib/backendProducts";
import ProductPageClient from "./components/ProductPageClient";

type ProductPageProps = {
  params: Promise<{ id: string; name?: string }>;
};

const PRODUCT_SEO = {
  plain: {
    title: "Buy Pure Organic Jaggery (Desi Gud) Online – Amila Gold",
    description:
      "Traditional sugarcane jaggery, slow-boiled and unrefined. No sesame, ginger, or peanuts — just pure, chemical-free desi gud. Order online now.",
    keywords: ["organic jaggery cubes", "desi gud online", "pure sugarcane jaggery"],
  },
  peanut: {
    title: "Buy Organic Jaggery Peanut Mix Online – Amila Gold",
    description:
      "Pure sugarcane jaggery blended with crunchy peanuts, white sesame, and dry ginger. Chemical-free and wholesome. Order online today.",
    keywords: ["jaggery peanut mix", "organic jaggery peanut mix online"],
  },
  cashew: {
    title: "Buy Organic Jaggery Cashew Mix Online – Amila Gold",
    description:
      "Pure sugarcane jaggery with rich cashews, dry ginger, and sesame seeds. No artificial colors or chemicals. Order online from Amila Gold.",
    keywords: ["jaggery cashew mix", "organic jaggery cashew mix online"],
  },
} satisfies Record<string, Pick<Metadata, "title" | "description" | "keywords">>;

function decodeRouteName(value?: string) {
  return decodeURIComponent(String(value || "").replace(/-/g, " ")).trim();
}

function getProductSeoKey(productName: string) {
  const normalized = productName.toLowerCase();
  if (normalized.includes("peanut")) return "peanut";
  if (normalized.includes("cashew") || normalized.includes("kaju") || normalized.includes("काजू")) return "cashew";
  if (normalized.includes("jaggery") || normalized.includes("gud") || normalized.includes("गुड़")) return "plain";
  return "";
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchBackendProductById(resolvedParams.id);
  const productName = product?.name || decodeRouteName(resolvedParams.name) || "Amila Gold Product";
  const seoKey = getProductSeoKey(`${productName} ${formatProductNameForPath(productName)}`);
  const matchedSeo = seoKey ? PRODUCT_SEO[seoKey as keyof typeof PRODUCT_SEO] : null;
  const canonicalPath = product ? createProductHref(product).split("?")[0] : `/product/${resolvedParams.id}/${resolvedParams.name || formatProductNameForPath(productName)}`;

  if (matchedSeo) {
    return {
      ...matchedSeo,
      alternates: {
        canonical: `https://amilagold.com${canonicalPath}`,
      },
    };
  }

  return {
    title: `${productName} – Amila Gold`,
    description: `Buy ${productName} online from Amila Gold. Pure, traditional, chemical-free jaggery products delivered across India.`,
    keywords: [productName, "organic jaggery online", "desi gud online"],
    alternates: {
      canonical: `https://amilagold.com${canonicalPath}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  return <ProductPageClient id={resolvedParams.id} name={resolvedParams.name} />;
}
