"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import {
  fetchBackendProductById,
  matchVariantByCartSize,
} from "@/app/lib/backendProducts";
import { createProductHref } from "@/app/data/products";
import ConfirmModal from "@/app/components/ConfirmModal";

const SHIPPING = 0;
const CART_IMAGE_FALLBACK = "/placeholder-product.png";

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
  const normalizedSources = React.useMemo(
    () => normalizeImageSources(sources),
    [sources],
  );

  const normalizedFallbackSources = React.useMemo(
    () => normalizeImageSources([...fallbackSources, CART_IMAGE_FALLBACK]),
    [fallbackSources],
  );

  const sourceKey = React.useMemo(
    () => normalizedSources.join("|"),
    [normalizedSources],
  );

  const fallbackKey = React.useMemo(
    () => normalizedFallbackSources.join("|"),
    [normalizedFallbackSources],
  );

  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [fallbackIndex, setFallbackIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    setSourceIndex(0);
    setFallbackIndex(0);
    setLoaded(false);
    setShowFallback(false);
  }, [sourceKey, fallbackKey]);

  React.useEffect(() => {
    if (normalizedSources.length > 0) return;

    const fallbackDelay = window.setTimeout(() => {
      setShowFallback(true);
    }, 1200);

    return () => {
      window.clearTimeout(fallbackDelay);
    };
  }, [normalizedSources.length, sourceKey]);

  React.useEffect(() => {
    if (showFallback || normalizedSources.length === 0 || loaded) return;

    const slowLoadTimer = window.setTimeout(() => {
      if (sourceIndex < normalizedSources.length - 1) {
        setSourceIndex((current) => current + 1);
        setLoaded(false);
      } else {
        setShowFallback(true);
        setLoaded(false);
      }
    }, 7000);

    return () => {
      window.clearTimeout(slowLoadTimer);
    };
  }, [
    loaded,
    normalizedSources.length,
    showFallback,
    sourceIndex,
    sourceKey,
  ]);

  const activeSource = showFallback
    ? normalizedFallbackSources[fallbackIndex] || CART_IMAGE_FALLBACK
    : normalizedSources[sourceIndex] || "";

  const showSkeleton = !loaded && !showFallback;

  return (
    <>
      {showSkeleton ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-variant/30 via-white to-surface-variant/40" />
      ) : null}

      {activeSource ? (
        <img
          key={`${showFallback ? "fallback" : "source"}-${activeSource}`}
          src={activeSource}
          alt={alt}
          loading="eager"
          decoding="async"
          className={`h-full w-full object-cover transition-all duration-500 ${
            loaded || showFallback ? "opacity-100" : "opacity-0"
          } ${
            isOutOfStock
              ? "grayscale opacity-55"
              : "group-hover:scale-105"
          }`}
          onLoad={() => {
            setLoaded(true);
          }}
          onError={() => {
            setLoaded(false);

            if (!showFallback) {
              if (sourceIndex < normalizedSources.length - 1) {
                setSourceIndex((current) => current + 1);
              } else {
                setShowFallback(true);
                setFallbackIndex(0);
              }

              return;
            }

            if (fallbackIndex < normalizedFallbackSources.length - 1) {
              setFallbackIndex((current) => current + 1);
            }
          }}
        />
      ) : null}
    </>
  );
}

function CartSkeletonCard() {
  return (
    <div className="rounded-[0.5rem] border border-outline-variant/30 bg-white p-3 sm:p-6">
      <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
        <div className="h-32 animate-pulse rounded-[0.5rem] bg-surface-variant/30 sm:h-44" />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-surface-variant/30" />
              <div className="grid max-w-[220px] grid-cols-2 gap-2">
                <div className="h-7 animate-pulse rounded-full bg-surface-variant/20" />
                <div className="h-7 animate-pulse rounded-full bg-surface-variant/20" />
              </div>
            </div>

            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-variant/20" />
          </div>

          <div className="flex items-end justify-between gap-4 pt-6">
            <div className="h-11 w-28 animate-pulse rounded-2xl bg-surface-variant/20" />

            <div className="space-y-2">
              <div className="ml-auto h-3 w-16 animate-pulse rounded-full bg-surface-variant/20" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-surface-variant/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] bg-surface px-3 pt-[7.5rem] pb-2 font-['Poppins'] sm:px-8 lg:px-16">
      <div className="flex flex-col items-start gap-12 lg:grid lg:grid-cols-12">
        <section className="w-full space-y-10 lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-3">
              <div className="h-12 w-52 animate-pulse rounded-full bg-surface-variant/30" />
              <div className="h-5 w-72 animate-pulse rounded-full bg-surface-variant/20" />
            </div>

            <div className="h-5 w-32 animate-pulse rounded-full bg-surface-variant/20" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <CartSkeletonCard key={index} />
            ))}
          </div>
        </section>

        <aside className="w-full lg:sticky lg:top-32 lg:col-span-4">
          <div className="rounded-[0.5rem] border border-outline-variant/30 bg-white p-4 shadow-2xl shadow-primary/5 lg:p-8">
            <div className="h-8 w-40 animate-pulse rounded-full bg-surface-variant/30" />

            <div className="mt-8 space-y-5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded-full bg-surface-variant/20" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-surface-variant/20" />
              </div>

              <div className="flex items-center justify-between">
                <div className="h-4 w-28 animate-pulse rounded-full bg-surface-variant/20" />
                <div className="h-6 w-14 animate-pulse rounded-full bg-surface-variant/20" />
              </div>

              <div className="my-2 h-px bg-outline-variant/20" />

              <div className="flex items-end justify-between py-2">
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-surface-variant/20" />
                  <div className="h-4 w-20 animate-pulse rounded-full bg-surface-variant/20" />
                </div>

                <div className="h-10 w-28 animate-pulse rounded-full bg-surface-variant/30" />
              </div>
            </div>

            <div className="mt-10 h-14 animate-pulse rounded-[1.5rem] bg-surface-variant/30" />

            <div className="mt-8 space-y-4">
              <div className="h-4 w-36 animate-pulse rounded-full bg-surface-variant/20" />
              <div className="h-4 w-40 animate-pulse rounded-full bg-surface-variant/20" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQty, itemCount, isHydrating } = useCart();
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
          variant?.image,
          ...(variant?.images || []),
          item.image,
          ...(product?.images || []),
          product?.image,
        ]);
      });

      setStockByItem(nextStock);
      setProductHrefByItem(nextHrefs);
      setImageSourcesByItem(nextImages);
    } catch {
      const fallbackImages: Record<string, string[]> = {};

      items.forEach((item) => {
        const key = `${item.id}|${item.size}|${item.color}`;
        fallbackImages[key] = normalizeImageSources([item.image]);
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
      <main className="flex min-h-screen items-center justify-center bg-surface px-6 pt-3 pb-2 font-['Poppins']">
        <div className="max-w-md animate-fade-in text-center">
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
            <span className="material-symbols-outlined relative text-8xl text-primary/20">
              shopping_basket
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary">
            Your cart is empty
          </h1>

          <p className="mb-10 leading-relaxed text-on-surface-variant/70">
            It looks like you haven&apos;t added anything to your cart yet.
            Discover our exclusive collection and find something you love.
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 font-bold text-white transition-all hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1600px] bg-surface px-3 pt-[7.5rem] pb-2 font-['Poppins'] sm:px-8 lg:px-16">
      <div className="flex flex-col items-start gap-12 lg:grid lg:grid-cols-12">
        <section className="w-full space-y-10 lg:col-span-8">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-5xl">
                Your Bag
              </h1>

              <p className="mt-2 font-medium tracking-wide text-on-surface-variant/60">
                {itemCount} {itemCount === 1 ? "item" : "items"} selected for
                checkout
              </p>
            </div>

            <Link
              href="/shop"
              className="flex items-center gap-2 text-sm font-bold text-primary underline-offset-8 hover:underline"
            >
              <span className="material-symbols-outlined text-base">
                add_shopping_cart
              </span>
              Add more items
            </Link>
          </header>

          <div className="space-y-6">
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
                  className={`group relative flex flex-row gap-3 rounded-[0.5rem] border p-3 transition-all duration-500 sm:p-6 ${
                    isOutOfStock || exceedsStock
                      ? "border-error/30 bg-error/[0.03]"
                      : "border-outline-variant/30 bg-white hover:shadow-2xl hover:shadow-primary/5"
                  }`}
                >
                  {isOutOfStock ? (
                    <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-[0.5rem] bg-surface-variant/10 sm:w-40 lg:w-[15vw] lg:max-w-[220px]">
                      {imageContent}
                    </div>
                  ) : (
                    <Link
                      href={productHref}
                      className="relative block aspect-square w-28 shrink-0 overflow-hidden rounded-[0.5rem] bg-surface-variant/10 sm:w-40 lg:w-[15vw] lg:max-w-[220px]"
                      aria-label={`Open ${item.name} ${item.size}`}
                    >
                      {imageContent}
                    </Link>
                  )}

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {isOutOfStock ? (
                          <h3 className="mb-1 text-xl font-bold text-primary/60">
                            {item.name}
                          </h3>
                        ) : (
                          <Link href={productHref} className="block">
                            <h3 className="mb-1 text-xl font-bold text-primary transition-colors group-hover:text-primary-container">
                              {item.name}
                            </h3>
                          </Link>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-surface-variant/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            Size: {item.size}
                          </span>

                          {item.color ? (
                            <span className="rounded-full bg-surface-variant/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                              Color: {item.color}
                            </span>
                          ) : null}
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
                        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant/40 transition-all hover:bg-error/10 hover:text-error disabled:opacity-40"
                        aria-label={`Remove ${item.name} from cart`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl leading-none">
                          delete_sweep
                        </span>
                      </button>
                    </div>

                    <div className="mt-6 flex items-center justify-between sm:mt-2">
                      <div className="flex items-center rounded-2xl border border-outline-variant/10 bg-surface-variant/20 p-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(item, -1, available)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-primary transition-all hover:bg-white hover:shadow-sm disabled:opacity-30"
                          disabled={
                            item.qty <= 1 ||
                            isOutOfStock ||
                            isItemPending ||
                            Boolean(stockError)
                          }
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">
                            remove
                          </span>
                        </button>

                        <span className="w-10 text-center text-sm font-bold text-primary">
                          {item.qty}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(item, 1, available)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-primary transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                          disabled={
                            !stockKnown ||
                            isOutOfStock ||
                            isItemPending ||
                            item.qty >= available
                          }
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">
                            add
                          </span>
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="block text-xs font-bold uppercase leading-none tracking-tighter text-on-surface-variant/50">
                          Subtotal
                        </span>

                        <span className="text-2xl font-black leading-none tracking-tighter text-primary">
                          {currencySymbol}
                          {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="w-full lg:sticky lg:top-32 lg:col-span-4">
          <div className="rounded-[0.5rem] border border-outline-variant/30 bg-white p-4 shadow-2xl shadow-primary/5 lg:p-8">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-primary">
              Order Summary
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between text-on-surface-variant/70">
                <span className="text-sm font-medium">Bag Subtotal</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant/70">
                <span className="text-sm font-medium">Delivery Charges</span>
                <span className="rounded bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                  Free
                </span>
              </div>

              <div className="my-2 h-px bg-outline-variant/20" />

              <div className="flex items-center justify-between py-2">
                <p className="mb-1 text-[20px] font-black uppercase tracking-widest text-on-surface-variant/80">
                  Total
                </p>

                <div className="text-right">
                  <p className="text-4xl font-black leading-none tracking-tighter text-primary">
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
              className={`group mt-10 flex w-full items-center justify-center gap-3 rounded-[1.5rem] py-5 text-lg font-bold transition-all ${
                isCheckoutBlocked
                  ? "cursor-not-allowed bg-surface-variant text-on-surface-variant/50"
                  : "bg-primary text-white hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]"
              }`}
            >
              {isStockLoading
                ? "Checking Stock…"
                : stockError
                  ? "Stock Check Required"
                  : hasOutOfStockItems || hasQuantityConflict
                    ? "Update Cart to Continue"
                    : "Secure Checkout"}

              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-lg text-primary/60">
                  verified
                </span>
                <p className="text-xs font-medium">Authenticity Guaranteed</p>
              </div>

              <div className="flex items-center gap-3 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-lg text-primary/60">
                  local_shipping
                </span>
                <p className="text-xs font-medium">
                  Safe & Disinfected Delivery
                </p>
              </div>
            </div>
          </div>
        </aside>
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