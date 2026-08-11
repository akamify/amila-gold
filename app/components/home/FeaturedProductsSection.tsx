"use client";

import SymbolIcon from "@/app/components/icons/SymbolIcon";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import {
  createProductHref,
  getProductImageSources,
  type Product,
} from "@/app/data/products";
import { peekCached, putCached } from "@/app/lib/clientCache";
import { fetchFeaturedProducts } from "@/app/lib/productsClient";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

const MIN_PRODUCTS = 4;
const MAX_PRODUCTS = 6;

function formatMoney(currencySymbol: string, value: number) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${currencySymbol}${amount.toLocaleString()}`;
}

function discountPct(original: number | undefined, selling: number) {
  if (!original || original <= selling) return 0;
  return Math.min(95, Math.round(((original - selling) / original) * 100));
}

function FeaturedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.9rem] border border-[#ece7dc] bg-white p-4 shadow-[0_18px_45px_rgba(37,28,16,0.05)]">
      <div className="aspect-square animate-pulse rounded-[1.45rem] bg-[#eef1f4]" />
      <div className="space-y-3 px-1 pt-4">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#eef1f4]" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#eef1f4]" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#eef1f4]" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-2xl bg-[#eef1f4]" />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  currencySymbol,
}: {
  product: Product;
  currencySymbol: string;
}) {
  const primary =
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants[0]
      : undefined;
  const sellingPrice = Number(product.price ?? primary?.price ?? 0);
  const originalPrice = product.originalPrice ?? primary?.originalPrice;
  const imageSources = getProductImageSources(product, primary?.label);
  const productHref = createProductHref(product);
  const badge = discountPct(originalPrice, sellingPrice);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-[#ece7dc] bg-white p-4 shadow-[0_18px_45px_rgba(37,28,16,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(37,28,16,0.10)]">
      <Link
        href={productHref}
        aria-label={`Open ${product.name}`}
        className="relative block overflow-hidden rounded-[1.45rem] border border-[#f0ede5] bg-[linear-gradient(180deg,#fbfcfd,#f2f4f6)]"
      >
        <div className="flex aspect-square items-center justify-center p-4 md:p-5">
          {imageSources.length > 0 ? (
            <ResilientProductImage
              sources={imageSources}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              fallbackClassName="bg-[#f3f5f7] text-[#7f8b96]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[1.1rem] bg-[#f3f5f7] text-[#7f8b96]">
              <SymbolIcon name={"image"} className="text-4xl" />
            </div>
          )}
        </div>

        {badge > 0 ? (
          <div className="absolute left-4 top-4 rounded-full bg-[#163f19] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
            {badge}% off
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 min-h-[3.4rem] text-lg font-bold leading-7 text-[#162033] transition-colors group-hover:text-[#245b20]">
            {product.name}
          </h3>

          <div className="shrink-0 text-right">
            <p className="text-base font-black text-[#162033]">
              {formatMoney(currencySymbol, sellingPrice)}
            </p>
            {originalPrice && originalPrice > sellingPrice ? (
              <p className="text-xs text-[#9ca3af] line-through">
                {formatMoney(currencySymbol, originalPrice)}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-6 text-[#637083]">
          {product.description ||
            "Freshly crafted product with trusted quality and traditional taste."}
        </p>

        <div className="mt-5">
          <Link
            href={productHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173f19,#2f6b2f)] px-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-all duration-300 hover:opacity-95"
          >
            View Product
            <SymbolIcon name={"arrow_forward"} className="text-sm" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProductsSection({
  initialProducts = [],
  managed = false,
  loading: externalLoading,
}: {
  initialProducts?: Product[];
  managed?: boolean;
  loading?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(
    initialProducts.length < MIN_PRODUCTS || Boolean(externalLoading),
  );
  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";

  useEffect(() => {
    const enoughSeedData = initialProducts.length >= MIN_PRODUCTS;

    if (enoughSeedData) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    if (managed) {
      setProducts(initialProducts);
      setLoading(true);
      return;
    }

    setProducts(initialProducts);
    setLoading(initialProducts.length === 0);
  }, [externalLoading, initialProducts, managed]);

  useEffect(() => {
    if (!managed && initialProducts.length >= MIN_PRODUCTS) return;

    const cached = peekCached<Product[]>("products:all").data;
    if (Array.isArray(cached) && cached.length >= MIN_PRODUCTS) {
      setProducts(cached);
      setLoading(false);
    }

    let cancelled = false;
    fetchFeaturedProducts()
      .then((rows) => {
        if (cancelled) return;
        if (Array.isArray(rows) && rows.length > 0) {
          putCached("products:all", 5 * 60 * 1000, rows);
          setProducts(rows);
        }
      })
      .catch(() => {
        if (!cancelled && !Array.isArray(cached)) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialProducts.length, managed]);

  const visibleProducts = useMemo(
    () => products.slice(0, MAX_PRODUCTS),
    [products],
  );

  return (
    <section className="bg-[linear-gradient(180deg,#fcfcfd_0%,#f7f3eb_100%)] py-10 md:py-14 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#876640]">
              Featured Collection
            </p>
            <h2 className="text-3xl font-black tracking-tight text-[#162033] sm:text-4xl lg:text-5xl">
              Purest Offerings
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#637083] sm:text-base">
              Carefully curated essentials designed for your lifestyle.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-[#d8d6cc] bg-white px-6 text-xs font-black uppercase tracking-[0.18em] text-[#245b20] transition-all hover:border-[#245b20] hover:bg-[#fbfdf9]"
          >
            View All Collection
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <FeaturedCardSkeleton key={index} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-[1.9rem] border border-[#ece7dc] bg-white px-6 py-14 text-center text-sm font-medium text-[#637083] shadow-[0_18px_45px_rgba(37,28,16,0.05)]">
            Products are being refreshed. Please check again shortly.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
