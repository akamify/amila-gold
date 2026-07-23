"use client";
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import React from "react";
import Link from "next/link";
import ConfirmModal from "@/app/components/ConfirmModal";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { useCart } from "@/app/context/CartContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { createProductHref } from "@/app/data/products";
import {
  fetchBackendProductById,
  matchVariantByCartSize,
} from "@/app/lib/backendProducts";

const SHIPPING = 0;
const CART_IMAGE_FALLBACK = "/logo.png";

type CartItemBase = {
  id: number;
  name: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  image?: string;
  collection?: string;
};

function normalizeImageSources(
  sources: Array<string | null | undefined>,
): string[] {
  const seen = new Set<string>();

  return sources
    .map((source) => String(source || "").trim())
    .filter(Boolean)
    .filter((source) => {
      if (seen.has(source)) return false;
      seen.add(source);
      return true;
    });
}

function CartItemImage({
  sources,
  fallbackSources,
  alt,
  isOutOfStock,
}: {
  sources: string[];
  fallbackSources: string[];
  alt: string;
  isOutOfStock: boolean;
}) {
  const resolvedSources = React.useMemo(
    () =>
      normalizeImageSources([
        ...fallbackSources,
        ...sources,
        CART_IMAGE_FALLBACK,
      ]),
    [fallbackSources, sources],
  );

  return (
    <div className="absolute inset-0">
      <ResilientProductImage
        sources={resolvedSources}
        alt={alt}
        eager
        compact
        className={`h-full w-full object-cover transition-transform duration-300 ${
          isOutOfStock
            ? "grayscale opacity-55"
            : "group-hover:scale-[1.03]"
        }`}
        fallbackClassName="bg-slate-100 text-slate-500"
      />
    </div>
  );
}

function CartSkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,0.05)] sm:p-4">
      <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 sm:grid-cols-[132px_minmax(0,1fr)] lg:grid-cols-[156px_minmax(0,1fr)]">
        <div className="h-[92px] w-[92px] animate-pulse rounded-xl bg-slate-100 sm:h-auto sm:w-auto sm:aspect-square" />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
              <div className="h-6 w-2/3 animate-pulse rounded-full bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
                <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="h-11 w-32 animate-pulse rounded-full bg-slate-100" />
            <div className="space-y-2">
              <div className="ml-auto h-3 w-16 animate-pulse rounded-full bg-slate-100" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] px-2 pb-28 pt-[.25rem] font-body sm:px-5 sm:pt-[6.75rem] lg:px-8 lg:pb-10 xl:px-10">
      <div className="mx-auto grid max-w-[1540px] gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-6">
        <section className="min-w-0 space-y-3 sm:space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
            <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-3 h-10 w-48 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-3 h-4 w-60 animate-pulse rounded-full bg-slate-100" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <CartSkeletonCard key={index} />
            ))}
          </div>
        </section>

        <aside>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            </div>
            <div className="mt-6 h-14 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQty,
    itemCount,
    isHydrating,
    syncError,
  } = useCart();
  const { settings } = useSiteSettings();

  const currencySymbol = settings.currencySymbol || "Rs.";

  const [stockByItem, setStockByItem] = React.useState<Record<string, number>>(
    {},
  );
  const [productHrefByItem, setProductHrefByItem] = React.useState<
    Record<string, string>
  >({});
  const [imageSourcesByItem, setImageSourcesByItem] = React.useState<
    Record<string, string[]>
  >({});
  const [isStockLoading, setIsStockLoading] = React.useState(false);
  const [stockError, setStockError] = React.useState("");
  const [pendingItemKey, setPendingItemKey] = React.useState("");
  const [removeTarget, setRemoveTarget] = React.useState<{
    id: number;
    size: string;
    color: string;
    name: string;
  } | null>(null);

  const itemIdentityKey = React.useMemo(
    () => items.map((item) => `${item.id}|${item.size}|${item.color}`).join("::"),
    [items],
  );

  const loadStock = React.useCallback(async () => {
    if (!items.length) {
      setStockByItem({});
      setProductHrefByItem({});
      setImageSourcesByItem({});
      setStockError("");
      return;
    }

    setIsStockLoading(true);
    setStockError("");
    setImageSourcesByItem(
      Object.fromEntries(
        items.map((item) => [
          `${item.id}|${item.size}|${item.color}`,
          normalizeImageSources([item.image, CART_IMAGE_FALLBACK]),
        ]),
      ),
    );

    try {
      const productIds = [
        ...new Set(items.map((item) => item.id).filter((id) => id > 0)),
      ];

      const products = await Promise.all(
        productIds.map((productId) => fetchBackendProductById(productId)),
      );

      const productMap = new Map(
        products
          .filter((product): product is NonNullable<typeof product> =>
            Boolean(product),
          )
          .map((product) => [product.id, product]),
      );

      const nextStock: Record<string, number> = {};
      const nextHrefs: Record<string, string> = {};
      const nextImages: Record<string, string[]> = {};

      items.forEach((item) => {
        const key = `${item.id}|${item.size}|${item.color}`;
        const product = productMap.get(item.id);
        const variant = product
          ? matchVariantByCartSize(product, item.size)
          : undefined;

        nextStock[key] = variant
          ? Math.max(0, Number(variant.stock || 0))
          : product
            ? Math.max(0, Number(product.quantity || 0))
            : 0;

        nextHrefs[key] = product
          ? createProductHref(product, variant?.label || item.size)
          : createProductHref({ id: item.id, name: item.name }, item.size);

        nextImages[key] = normalizeImageSources([
          item.image,
          variant?.image,
          ...(variant?.images || []),
          ...(product?.images || []),
          product?.image,
          CART_IMAGE_FALLBACK,
        ]);
      });

      setStockByItem(nextStock);
      setProductHrefByItem(nextHrefs);
      setImageSourcesByItem(nextImages);
    } catch {
      const fallbackImages: Record<string, string[]> = {};

      items.forEach((item) => {
        const key = `${item.id}|${item.size}|${item.color}`;
        fallbackImages[key] = normalizeImageSources([
          item.image,
          CART_IMAGE_FALLBACK,
        ]);
      });

      setImageSourcesByItem(fallbackImages);
      setStockError("Stock status could not be refreshed. Please try again.");
    } finally {
      setIsStockLoading(false);
    }
  }, [items]);

  React.useEffect(() => {
    loadStock();
  }, [itemIdentityKey, loadStock]);

  const handleQuantityChange = async (
    item: { id: number; size: string; color: string; qty: number },
    delta: number,
    maxStock: number,
  ) => {
    const key = `${item.id}|${item.size}|${item.color}`;

    if (pendingItemKey === key) return;

    const nextQty = item.qty + delta;

    if (nextQty < 1 || (maxStock > 0 && nextQty > maxStock)) return;

    setPendingItemKey(key);

    try {
      await updateQty(item.id, item.size, delta, item.color);
    } finally {
      setPendingItemKey("");
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;

    const key = `${removeTarget.id}|${removeTarget.size}|${removeTarget.color}`;

    setPendingItemKey(key);

    try {
      const removed = await removeItem(
        removeTarget.id,
        removeTarget.size,
        removeTarget.color,
      );

      if (removed) {
        setRemoveTarget(null);
      }
    } finally {
      setPendingItemKey("");
    }
  };

  const hasOutOfStockItems =
    !isStockLoading &&
    !stockError &&
    items.some((item) => {
      const key = `${item.id}|${item.size}|${item.color}`;
      return (stockByItem[key] ?? 0) <= 0;
    });

  const hasQuantityConflict =
    !isStockLoading &&
    !stockError &&
    items.some((item) => {
      const key = `${item.id}|${item.size}|${item.color}`;
      const available = stockByItem[key] ?? 0;
      return available > 0 && item.qty > available;
    });

  const isCheckoutBlocked =
    isStockLoading ||
    Boolean(stockError) ||
    hasOutOfStockItems ||
    hasQuantityConflict;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + SHIPPING;

  if (isHydrating) {
    return <CartPageSkeleton />;
  }

  if (!itemCount) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1f3f6] px-6 pt-3 pb-2 font-body">
        <div className="max-w-md text-center">
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
            <SymbolIcon
              name={"shopping_basket"}
              className="relative text-8xl text-primary/20"
            />
          </div>

          <h1 className="font-headline mb-4 text-4xl font-bold tracking-tight text-primary">
            Your cart is empty
          </h1>

          <p className="mb-10 leading-relaxed text-slate-600">
            It looks like you haven&apos;t added anything to your cart yet.
            Discover our exclusive collection and find something you love.
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 font-bold text-white transition-all hover:shadow-xl active:scale-95"
          >
            <SymbolIcon name={"explore"} className="text-sm" />
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-2 pb-4 pt-[2.25rem] font-body sm:px-5 sm:pt-[2rem] lg:px-8 lg:pb-2 xl:px-10">
      <div className="mx-auto grid max-w-[1540px] gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-6">
        <section className="min-w-0 space-y-3 sm:space-y-4">
          <header className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-6 sm:py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/55">
              Shopping Cart
            </p>
            <h1 className="font-headline mt-1 text-2xl font-black tracking-tight text-slate-900 sm:mt-2 sm:text-4xl">
              Your Bag
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:mt-2 sm:text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout
            </p>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:mt-4 sm:pt-4">
              <div className="hidden flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:flex">
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  Free delivery
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  Secure checkout
                </span>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"
              >
                <SymbolIcon name={"add_shopping_cart"} className="text-base" />
                Add more items
              </Link>
            </div>
          </header>

          {syncError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {syncError}
            </div>
          ) : null}

          {stockError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {stockError}
            </div>
          ) : null}

          <div className="space-y-3">
            {items.map((item: CartItemBase) => {
              const key = `${item.id}|${item.size}|${item.color}`;
              const hasStockValue = Object.prototype.hasOwnProperty.call(
                stockByItem,
                key,
              );
              const available = stockByItem[key] ?? 0;
              const stockKnown = !isStockLoading && !stockError && hasStockValue;
              const isOutOfStock = stockKnown && available <= 0;
              const exceedsStock =
                stockKnown && available > 0 && item.qty > available;
              const productHref =
                productHrefByItem[key] ||
                createProductHref({ id: item.id, name: item.name }, item.size);
              const isItemPending = pendingItemKey === key;
              const resolvedImageSources = imageSourcesByItem[key] || [];

              const imageContent = (
                <>
                  <CartItemImage
                    sources={resolvedImageSources}
                    fallbackSources={[item.image || ""]}
                    alt={item.name}
                    isOutOfStock={isOutOfStock}
                  />

                  {isOutOfStock ? (
                    <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/25">
                      <span className="rounded-full bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-error">
                        Out of Stock
                      </span>
                    </div>
                  ) : null}
                </>
              );

              return (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition-all duration-300 sm:p-4 ${
                    isOutOfStock || exceedsStock
                      ? "border-error/30 ring-1 ring-error/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 sm:grid-cols-[132px_minmax(0,1fr)] lg:grid-cols-[156px_minmax(0,1fr)]">
                    {isOutOfStock ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100 sm:h-auto sm:w-full sm:aspect-square">
                        {imageContent}
                      </div>
                    ) : (
                      <Link
                        href={productHref}
                        className="relative block h-24 w-24 overflow-hidden rounded-xl bg-slate-100 sm:h-auto sm:w-full sm:aspect-square"
                        aria-label={`Open ${item.name} ${item.size}`}
                      >
                        {imageContent}
                      </Link>
                    )}

                    <div className="flex min-w-0 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:mb-2 sm:text-[10px] sm:tracking-[0.24em]">
                            {item.collection || "Cart Item"}
                          </p>

                          {isOutOfStock ? (
                            <h3 className="font-headline line-clamp-2 text-sm font-bold leading-5 text-slate-500 sm:text-lg">
                              {item.name}
                            </h3>
                          ) : (
                            <Link href={productHref} className="block">
                              <h3 className="font-headline line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                                {item.name}
                              </h3>
                            </Link>
                          )}

                          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:rounded-full sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                              Size: {item.size}
                            </span>

                            {item.color ? (
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:rounded-full sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                                Color: {item.color}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 sm:mt-3 sm:text-xs">
                            <span>
                              Unit Price: {currencySymbol}
                              {item.price.toLocaleString()}
                            </span>
                            <span className="font-semibold text-emerald-700">Free Delivery</span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setRemoveTarget({
                              id: item.id,
                              size: item.size,
                              color: item.color,
                              name: item.name,
                            })
                          }
                          disabled={isItemPending}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-40 sm:h-10 sm:w-10"
                          aria-label={`Remove ${item.name} from cart`}
                          type="button"
                        >
                          <SymbolIcon
                            name={"delete_sweep"}
                            className="text-lg leading-none sm:text-xl"
                          />
                        </button>
                      </div>

                      <div className="col-span-2 mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:col-span-1 sm:mt-4 sm:items-end sm:pt-4">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 sm:rounded-full sm:p-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(item, -1, available)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-all hover:bg-white hover:shadow-sm disabled:opacity-30 sm:h-9 sm:w-9 sm:rounded-full"
                            disabled={
                              item.qty <= 1 ||
                              isOutOfStock ||
                              isItemPending ||
                              Boolean(stockError)
                            }
                            type="button"
                          >
                            <SymbolIcon name={"remove"} className="text-base" />
                          </button>

                          <span className="w-9 text-center text-xs font-bold text-slate-900 sm:w-12 sm:text-sm">
                            {item.qty}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(item, 1, available)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9 sm:rounded-full"
                            disabled={
                              !stockKnown ||
                              isOutOfStock ||
                              isItemPending ||
                              item.qty >= available
                            }
                            type="button"
                          >
                            <SymbolIcon name={"add"} className="text-base" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Item Total
                          </span>

                          <span className="mt-1 block text-lg font-black leading-none tracking-tight text-slate-900 sm:text-2xl">
                            {currencySymbol}
                            {(item.price * item.qty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-5 lg:p-6">
            <h2 className="font-headline mb-5 text-xl font-black tracking-tight text-slate-900 sm:mb-6 sm:text-2xl">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">Bag Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {currencySymbol}
                  {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">Delivery Charges</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Free
                </span>
              </div>

              <div className="my-2 h-px bg-slate-100" />

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
                  Total
                </p>

                <div className="text-right">
                  <p className="text-3xl font-black leading-none tracking-tight text-slate-900">
                    {currencySymbol}
                    {total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={isCheckoutBlocked ? "#" : "/checkout"}
              onClick={(event) => {
                if (isCheckoutBlocked) event.preventDefault();
              }}
              aria-disabled={isCheckoutBlocked}
              className={`group mt-6 hidden w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold transition-all lg:flex ${
                isCheckoutBlocked
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-[#fb641b] text-white hover:bg-[#f75d12] active:scale-[0.99]"
              }`}
            >
              {isStockLoading
                ? "Checking Stock..."
                : stockError
                  ? "Stock Check Required"
                  : hasOutOfStockItems || hasQuantityConflict
                    ? "Update Cart to Continue"
                    : "Secure Checkout"}

              <SymbolIcon
                name={"arrow_forward"}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-slate-600">
                <SymbolIcon
                  name={"verified"}
                  className="text-lg text-primary/60"
                />
                <p className="text-xs font-medium">Authenticity Guaranteed</p>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <SymbolIcon
                  name={"local_shipping"}
                  className="text-lg text-primary/60"
                />
                <p className="text-xs font-medium">Safe Delivery Across India</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2.5 shadow-[0_-12px_34px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Total
            </p>
            <p className="text-xl font-black text-slate-900">
              {currencySymbol}
              {total.toLocaleString()}
            </p>
          </div>

          <Link
            href={isCheckoutBlocked ? "#" : "/checkout"}
            onClick={(event) => {
              if (isCheckoutBlocked) event.preventDefault();
            }}
            aria-disabled={isCheckoutBlocked}
            className={`inline-flex min-w-[170px] items-center justify-center rounded-xl px-5 py-3 text-sm font-bold ${
              isCheckoutBlocked
                ? "bg-slate-200 text-slate-500"
                : "bg-[#fb641b] text-white"
            }`}
          >
            {isCheckoutBlocked ? "Review Cart" : "Place Order"}
          </Link>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(removeTarget)}
        title="Remove item from cart?"
        message="Are you sure you want to remove this product from your cart?"
        cancelLabel="Cancel"
        confirmLabel="Remove"
        tone="danger"
        loading={Boolean(
          removeTarget &&
            pendingItemKey ===
              `${removeTarget.id}|${removeTarget.size}|${removeTarget.color}`,
        )}
        onClose={() => {
          if (!pendingItemKey) setRemoveTarget(null);
        }}
        onConfirm={confirmRemove}
      />
    </main>
  );
}
