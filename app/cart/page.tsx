"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { fetchBackendProductById, matchVariantByCartSize } from "@/app/lib/backendProducts";
import { createProductHref } from "@/app/data/products";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import ConfirmModal from "@/app/components/ConfirmModal";

const SHIPPING = 0;

function CartSkeletonCard() {
  return (
    <div className="rounded-[0.5rem] border border-outline-variant/30 bg-white p-3 sm:p-6">
      <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
        <div className="h-32 rounded-[0.5rem] bg-surface-variant/30 sm:h-44 animate-pulse" />
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-5 w-2/3 rounded-full bg-surface-variant/30 animate-pulse" />
              <div className="grid grid-cols-2 gap-2 max-w-[220px]">
                <div className="h-7 rounded-full bg-surface-variant/20 animate-pulse" />
                <div className="h-7 rounded-full bg-surface-variant/20 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-surface-variant/20 animate-pulse" />
          </div>
          <div className="flex items-end justify-between gap-4 pt-6">
            <div className="h-11 w-28 rounded-2xl bg-surface-variant/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-16 rounded-full bg-surface-variant/20 animate-pulse ml-auto" />
              <div className="h-7 w-24 rounded-full bg-surface-variant/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <main className="min-h-screen pt-30 pb-2 px-3 sm:px-8 lg:px-16 bg-surface font-['Poppins'] max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
        <section className="w-full lg:col-span-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="h-12 w-52 rounded-full bg-surface-variant/30 animate-pulse" />
              <div className="h-5 w-72 rounded-full bg-surface-variant/20 animate-pulse" />
            </div>
            <div className="h-5 w-32 rounded-full bg-surface-variant/20 animate-pulse" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <CartSkeletonCard key={index} />
            ))}
          </div>
        </section>

        <aside className="w-full lg:col-span-4 lg:sticky lg:top-32">
          <div className="bg-white border border-outline-variant/30 rounded-[0.5rem] p-4 lg:p-8 shadow-2xl shadow-primary/5">
            <div className="h-8 w-40 rounded-full bg-surface-variant/30 animate-pulse" />
            <div className="mt-8 space-y-5">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 rounded-full bg-surface-variant/20 animate-pulse" />
                <div className="h-4 w-16 rounded-full bg-surface-variant/20 animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 rounded-full bg-surface-variant/20 animate-pulse" />
                <div className="h-6 w-14 rounded-full bg-surface-variant/20 animate-pulse" />
              </div>
              <div className="h-px bg-outline-variant/20 my-2" />
              <div className="flex justify-between items-end py-2">
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded-full bg-surface-variant/20 animate-pulse" />
                  <div className="h-4 w-20 rounded-full bg-surface-variant/20 animate-pulse" />
                </div>
                <div className="h-10 w-28 rounded-full bg-surface-variant/30 animate-pulse" />
              </div>
            </div>
            <div className="mt-10 h-14 rounded-[1.5rem] bg-surface-variant/30 animate-pulse" />
            <div className="mt-8 space-y-4">
              <div className="h-4 w-36 rounded-full bg-surface-variant/20 animate-pulse" />
              <div className="h-4 w-40 rounded-full bg-surface-variant/20 animate-pulse" />
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

  const [stockByItem, setStockByItem] = React.useState<Record<string, number>>({});
  const [productHrefByItem, setProductHrefByItem] = React.useState<Record<string, string>>({});
  const [imageSourcesByItem, setImageSourcesByItem] = React.useState<Record<string, string[]>>({});
  const [isStockLoading, setIsStockLoading] = React.useState(false);
  const [stockError, setStockError] = React.useState("");
  const [pendingItemKey, setPendingItemKey] = React.useState("");
  const [removeTarget, setRemoveTarget] = React.useState<{ id: number; size: string; color: string; name: string } | null>(null);

  const itemIdentityKey = React.useMemo(
    () => items.map((item) => `${item.id}|${item.size}|${item.color}`).join("::"),
    [items]
  );

  const loadStock = async () => {
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
      const productIds = [...new Set(items.map((item) => item.id).filter((id) => id > 0))];
      const products = await Promise.all(productIds.map((productId) => fetchBackendProductById(productId)));
      const productMap = new Map(
        products
          .filter((product): product is NonNullable<typeof product> => Boolean(product))
          .map((product) => [product.id, product])
      );
      const nextStock: Record<string, number> = {};
      const nextHrefs: Record<string, string> = {};
      const nextImages: Record<string, string[]> = {};

      items.forEach((item) => {
        const key = `${item.id}|${item.size}|${item.color}`;
        const product = productMap.get(item.id);
        const variant = product ? matchVariantByCartSize(product, item.size) : undefined;
        nextStock[key] = variant
          ? Math.max(0, Number(variant.stock || 0))
          : product
            ? Math.max(0, Number(product.quantity || 0))
            : 0;
        nextHrefs[key] = product
          ? createProductHref(product, variant?.label || item.size)
          : createProductHref({ id: item.id, name: item.name }, item.size);
        nextImages[key] = [
          variant?.image,
          ...(variant?.images || []),
          item.image,
          ...(product?.images || []),
          product?.image,
        ].map((source) => String(source || "").trim()).filter(Boolean);
      });

      setStockByItem(nextStock);
      setProductHrefByItem(nextHrefs);
      setImageSourcesByItem(nextImages);
    } catch {
      setStockError("Stock status could not be refreshed. Please try again.");
    } finally {
      setIsStockLoading(false);
    }
  };

  React.useEffect(() => {
    loadStock();
  }, [itemIdentityKey]);

  const handleQuantityChange = async (item: { id: number; size: string; color: string; qty: number }, delta: number, maxStock: number) => {
    const key = `${item.id}|${item.size}|${item.color}`;
    if (pendingItemKey === key) return;
    const nextQty = item.qty + delta;
    if (nextQty < 1 || (maxStock > 0 && nextQty > maxStock)) return;
    setPendingItemKey(key);
    await updateQty(item.id, item.size, delta, item.color);
    setPendingItemKey("");
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const key = `${removeTarget.id}|${removeTarget.size}|${removeTarget.color}`;
    setPendingItemKey(key);
    const removed = await removeItem(removeTarget.id, removeTarget.size, removeTarget.color);
    setPendingItemKey("");
    if (removed) setRemoveTarget(null);
  };

  const hasOutOfStockItems = !isStockLoading && !stockError && items.some((item) => {
    const key = `${item.id}|${item.size}|${item.color}`;
    return (stockByItem[key] ?? 0) <= 0;
  });
  const hasQuantityConflict = !isStockLoading && !stockError && items.some((item) => {
    const key = `${item.id}|${item.size}|${item.color}`;
    const available = stockByItem[key] ?? 0;
    return available > 0 && item.qty > available;
  });
  const isCheckoutBlocked = isStockLoading || Boolean(stockError) || hasOutOfStockItems || hasQuantityConflict;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + SHIPPING;

  if (isHydrating) {
    return <CartPageSkeleton />;
  }

  if (!itemCount) {
    return (
      <main className="min-h-screen pt-3 pb-2 px-6 flex items-center justify-center bg-surface font-['Poppins']">
        <div className="text-center max-w-md animate-fade-in">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
            <span className="material-symbols-outlined text-8xl text-primary/20 relative">shopping_basket</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4 tracking-tight">Your cart is empty</h1>
          <p className="text-on-surface-variant/70 mb-10 leading-relaxed">
            It looks like you haven't added anything to your cart yet. Discover our exclusive collection and find something you love.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">explore</span>
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-30 pb-2 px-3 sm:px-8 lg:px-16 bg-surface font-['Poppins'] max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">

        {/* Left Side: Items List (Height is now flexible) */}
        <section className="w-full lg:col-span-8 space-y-10">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tighter">Your Bag</h1>
              <p className="mt-2 text-on-surface-variant/60 font-medium tracking-wide">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected for checkout
              </p>
            </div>
            <Link href="/shop" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline underline-offset-8">
              <span className="material-symbols-outlined text-base">add_shopping_cart</span>
              Add more items
            </Link>
          </header>

          <div className="space-y-6">
            {items.map((item) => {
              const key = `${item.id}|${item.size}|${item.color}`;
              const hasStockValue = Object.prototype.hasOwnProperty.call(stockByItem, key);
              const available = stockByItem[key] ?? 0;
              const stockKnown = !isStockLoading && !stockError && hasStockValue;
              const isOutOfStock = stockKnown && available <= 0;
              const exceedsStock = stockKnown && available > 0 && item.qty > available;
              const productHref = productHrefByItem[key] || createProductHref({ id: item.id, name: item.name }, item.size);
              const isItemPending = pendingItemKey === key;
              const imageContent = (
                <>
                  <ResilientProductImage
                    sources={imageSourcesByItem[key] || [item.image]}
                    alt={item.name}
                    className={`h-full w-full object-cover transition-transform duration-700 ${isOutOfStock ? "grayscale opacity-55" : "group-hover:scale-105"
                      }`}
                  />
                  {isOutOfStock ? (
                    <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/25">
                      <span className="rounded-full bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-error">Out of Stock</span>
                    </div>
                  ) : null}
                </>
              );
              return (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className={`group relative rounded-[0.5rem] border p-3 sm:p-6 flex flex-row gap-3 transition-all duration-500 ${isOutOfStock || exceedsStock
                      ? "border-error/30 bg-error/[0.03]"
                      : "border-outline-variant/30 bg-white hover:shadow-2xl hover:shadow-primary/5"
                    }`}
                >
                  {/* Product Image */}
                  {isOutOfStock ? (
                    <div className="w-28 sm:w-40 lg:w-[15vw] lg:max-w-[220px] aspect-square rounded-[0.5rem] overflow-hidden bg-surface-variant/10 shrink-0 relative">
                      {imageContent}
                    </div>
                  ) : (
                    <Link
                      href={productHref}
                      className="w-28 sm:w-40 lg:w-[15vw] lg:max-w-[220px] aspect-square rounded-[0.5rem] overflow-hidden bg-surface-variant/10 shrink-0 relative block"
                      aria-label={`Open ${item.name} ${item.size}`}
                    >
                      {imageContent}
                    </Link>
                  )}

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {isOutOfStock ? (
                          <h3 className="text-xl font-bold text-primary/60 mb-1">{item.name}</h3>
                        ) : (
                          <Link href={productHref} className="block">
                            <h3 className="text-xl font-bold text-primary mb-1 group-hover:text-primary-container transition-colors">{item.name}</h3>
                          </Link>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-surface-variant/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            Size: {item.size}
                          </span>
                          {item.color && (
                            <span className="px-3 py-1 bg-surface-variant/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setRemoveTarget({ id: item.id, size: item.size, color: item.color, name: item.name })}
                        disabled={isItemPending}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant/40 hover:bg-error/10 hover:text-error transition-all disabled:opacity-40"
                        aria-label={`Remove ${item.name} from cart`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl leading-none">delete_sweep</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-6 sm:mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-surface-variant/20 rounded-2xl p-1 border border-outline-variant/10">
                        <button
                          onClick={() => handleQuantityChange(item, -1, available)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-primary transition-all disabled:opacity-30"
                          disabled={item.qty <= 1 || isOutOfStock || isItemPending || Boolean(stockError)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-primary">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1, available)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={!stockKnown || isOutOfStock || isItemPending || item.qty >= available}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs text-on-surface-variant/50 block font-bold uppercase tracking-tighter leading-none">Subtotal</span>
                        <span className="text-2xl font-black text-primary tracking-tighter leading-none">
                          {currencySymbol}{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Side: Summary (Sticky) */}
        <aside className="w-full lg:col-span-4 lg:sticky lg:top-32">
          <div className="bg-white border border-outline-variant/30 rounded-[0.5rem] p-4 lg:p-8 shadow-2xl shadow-primary/5">
            <h2 className="text-2xl font-bold text-primary mb-8 tracking-tight">Order Summary</h2>

            <div className="space-y-5">
              <div className="flex justify-between items-center text-on-surface-variant/70">
                <span className="text-sm font-medium">Bag Subtotal</span>
                <span className="font-semibold">{currencySymbol}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant/70">
                <span className="text-sm font-medium">Delivery Charges</span>
                <span className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em] bg-secondary/10 px-2 py-0.5 rounded">Free</span>
              </div>

              <div className="h-px bg-outline-variant/20 my-2" />

              <div className="flex justify-between items-center py-2">
                <p className="text-[20px] text-on-surface-variant/80 uppercase font-black tracking-widest mb-1">Total</p>
                <div className="text-right">
                  <p className="text-4xl font-black text-primary leading-none tracking-tighter">
                    {currencySymbol}{total.toLocaleString()}
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
              className={`mt-10 w-full py-5 rounded-[1.5rem] font-bold text-lg transition-all flex items-center justify-center gap-3 group ${isCheckoutBlocked
                  ? "cursor-not-allowed bg-surface-variant text-on-surface-variant/50"
                  : "bg-primary text-white hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]"
                }`}
            >
              {isStockLoading ? "Checking Stock…" : stockError ? "Stock Check Required" : hasOutOfStockItems || hasQuantityConflict ? "Update Cart to Continue" : "Secure Checkout"}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-primary/60 text-lg">verified</span>
                <p className="text-xs font-medium">Authenticity Guaranteed</p>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-primary/60 text-lg">local_shipping</span>
                <p className="text-xs font-medium">Safe & Disinfected Delivery</p>
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
        loading={Boolean(removeTarget && pendingItemKey === `${removeTarget.id}|${removeTarget.size}|${removeTarget.color}`)}
        onClose={() => {
          if (!pendingItemKey) setRemoveTarget(null);
        }}
        onConfirm={confirmRemove}
      />
    </main>
  );
}
