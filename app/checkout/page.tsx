"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import {
  fetchUserAddresses,
  createUserAddress,
  updateUserAddress,
  createBackendOrder,
  verifyBackendPayment,
  type UserAddress,
  type UserAddressInput,
} from "@/app/lib/apiClient";
import AddressCard from "@/app/components/address/AddressCard";
import AddressForm from "@/app/components/address/AddressForm";
import AddressModal from "@/app/components/address/AddressModal";
import { fetchBackendProducts, matchVariantByCartSize } from "@/app/lib/backendProducts";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SHIPPING = 0;
const SELECTED_ADDRESS_STORAGE_KEY = "checkout:selected-address-id";
const LOGIN_RETURN_TO = "/checkout";

const createEmptyAddress = (): UserAddressInput => ({
  FullName: "",
  phone1: "",
  phone2: "",
  address: "",
  address_line2: "",
  city: "",
  state: "",
  district: "",
  pinCode: "",
  country: "India",
  addressType: "Home",
});

function CheckoutAddressSkeleton() {
  return (
    <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-outline-variant/10 bg-white/80 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 rounded-full bg-surface-variant/30 animate-pulse" />
                <div className="h-4 w-24 rounded-full bg-surface-variant/20 animate-pulse" />
              </div>
              <div className="h-5 w-5 rounded-full bg-surface-variant/20 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded-full bg-surface-variant/20 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-surface-variant/20 animate-pulse" />
              <div className="h-4 w-2/3 rounded-full bg-surface-variant/20 animate-pulse" />
            </div>
            <div className="h-10 w-28 rounded-full bg-surface-variant/20 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-14 rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface animate-pulse" />
    </div>
  );
}

function CheckoutSummarySkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
      <div className="h-8 w-40 rounded-full bg-surface-variant/30 animate-pulse" />
      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-full bg-surface-variant/20 animate-pulse" />
          <div className="h-4 w-16 rounded-full bg-surface-variant/20 animate-pulse" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-full bg-surface-variant/20 animate-pulse" />
          <div className="h-4 w-16 rounded-full bg-surface-variant/20 animate-pulse" />
        </div>
        <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-baseline">
          <div className="h-6 w-16 rounded-full bg-surface-variant/20 animate-pulse" />
          <div className="h-8 w-24 rounded-full bg-surface-variant/30 animate-pulse" />
        </div>
      </div>
      <div className="mt-6 h-14 rounded-full bg-surface-variant/30 animate-pulse" />
      <div className="mt-3 h-3 w-40 mx-auto rounded-full bg-surface-variant/20 animate-pulse" />
    </div>
  );
}

type BuyNowItem = {
  id: number;
  name: string;
  price: number;
  color: string;
  size: string;
  image: string;
  collection: string;
  qty: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isBuyNow = searchParams?.get('buyNow') === 'true';

  const { items, itemCount, clearCart, isHydrating } = useCart();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { settings, isLoading: isSettingsLoading } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "Rs.";

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "COD">("Razorpay");
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [newAddress, setNewAddress] = useState<UserAddressInput>(createEmptyAddress());
  const [hasStockConflict, setHasStockConflict] = useState(false);
  const [stockConflictMessage, setStockConflictMessage] = useState("");

  // Use buyNowItem if present (Buy Now flow), otherwise use cart items
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  const checkoutItemCount = buyNowItem ? buyNowItem.qty : itemCount;

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + SHIPPING;
  const isPageLoading = isHydrating || isAuthLoading || isSettingsLoading;

  // Load buyNowItem from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('sr_buy_now_item');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBuyNowItem(parsed);
      } catch {
        localStorage.removeItem('sr_buy_now_item');
      }
    }
  }, []);

  useEffect(() => {
    const validateCheckoutStock = async () => {
      if (!checkoutItems.length) {
        setHasStockConflict(false);
        setStockConflictMessage("");
        return;
      }
      try {
        const products = await fetchBackendProducts();
        const map = new Map(products.map((product) => [product.id, product]));
        for (const item of checkoutItems) {
          const product = map.get(item.id);
          if (!product) {
            setHasStockConflict(true);
            setStockConflictMessage("Some items are unavailable. Please review your cart.");
            return;
          }
          const variant = matchVariantByCartSize(product, item.size);
          const available = variant
            ? Math.max(0, Number(variant.stock || 0))
            : Math.max(0, Number(product.quantity || 0));
          if (available < Number(item.qty || 0)) {
            setHasStockConflict(true);
            setStockConflictMessage("Some items are out of stock. Please update cart before checkout.");
            return;
          }
        }
        setHasStockConflict(false);
        setStockConflictMessage("");
      } catch {
        setHasStockConflict(false);
        setStockConflictMessage("");
      }
    };
    validateCheckoutStock();
  }, [checkoutItems]);

  const persistSelectedAddressId = (value: number | null) => {
    if (typeof window === "undefined") return;
    if (!value) {
      window.sessionStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, String(value));
  };

  const syncSelectedAddress = (rows: UserAddress[]) => {
    if (!rows.length) {
      setSelectedAddressId(null);
      persistSelectedAddressId(null);
      return;
    }

    const fallback = rows[0].address_id;
    if (typeof window === "undefined") {
      setSelectedAddressId(fallback);
      return;
    }

    const savedRaw = window.sessionStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
    const saved = Number(savedRaw || 0);
    const validSaved =
      Number.isInteger(saved) && rows.some((row) => row.address_id === saved) ? saved : fallback;

    setSelectedAddressId(validSaved);
    persistSelectedAddressId(validSaved);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated) {
        setIsLoadingAddresses(false);
        return;
      }
      setIsLoadingAddresses(true);
      try {
        const data = await fetchUserAddresses();
        setAddresses(data);
        syncSelectedAddress(data);
      } catch {
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, [isAuthenticated]);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressError("");
    setNewAddress(createEmptyAddress());
  };

  const openEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.address_id);
    setAddressError("");
    setNewAddress({
      FullName: addr.FullName || "",
      phone1: addr.phone1 || "",
      phone2: addr.phone2 || "",
      address: addr.address || "",
      address_line2: addr.address_line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      district: addr.district || "",
      pinCode: addr.pinCode || "",
      country: addr.country || "India",
      addressType: addr.addressType || "Home",
    });
    setShowAddAddress(true);
  };

  const handleAddressSubmit = async () => {
    if (!newAddress.FullName || !newAddress.phone1 || !newAddress.address || !newAddress.city || !newAddress.pinCode) {
      setAddressError("Please fill all required fields.");
      return;
    }
    try {
      setAddressError("");
      if (editingAddressId) {
        const updated = await updateUserAddress(editingAddressId, newAddress);
        const nextRows = addresses.map((addr) => (addr.address_id === editingAddressId ? updated : addr));
        setAddresses(nextRows);
        setSelectedAddressId(updated.address_id);
        persistSelectedAddressId(updated.address_id);
      } else {
        const created = await createUserAddress(newAddress);
        const nextRows = [...addresses, created];
        setAddresses(nextRows);
        setSelectedAddressId(created.address_id);
        persistSelectedAddressId(created.address_id);
      }
      setShowAddAddress(false);
      resetAddressForm();
    } catch {
      setAddressError("Failed to save address.");
    }
  };

  const handlePayment = async () => {
    if (!checkoutItemCount || isProcessing) return;
    if (hasStockConflict) {
      setPaymentError(stockConflictMessage || "Some items are out of stock.");
      return;
    }
    if (!selectedAddressId) {
      setPaymentError("Please select a delivery address.");
      return;
    }
    if (!isAuthenticated) {
      router.push(`/user/auth?returnTo=${encodeURIComponent(LOGIN_RETURN_TO)}`);
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      const data = (await createBackendOrder(
        checkoutItems.map((item) => ({
          product_id: item.id,
          quantity: item.qty,
          size: item.size,
          color: item.color || "",
          price: item.price,
        })),
        selectedAddressId,
        undefined,
        paymentMethod
      )) as Record<string, unknown>;

      if (paymentMethod === "COD") {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sr_buy_now_item');
        }
        if (!buyNowItem) {
          clearCart();
        }
        const codOrderId = String(data.order_id || data.local_order_id || "");
        router.push(`/order/success?order_id=${encodeURIComponent(codOrderId)}`);
        return;
      }

      const orderId = (data.order as Record<string, unknown>)?.id as string;
      const localOrderId = String(data.local_order_id || "");
      const razorpayRuntimeKey = String(data.key || "");
      if (!orderId || !razorpayRuntimeKey) throw new Error("Razorpay is not configured yet.");

      const selectedAddress = addresses.find((a) => a.address_id === selectedAddressId);

      const razorpay = new window.Razorpay({
        key: razorpayRuntimeKey,
        amount: Number(data.amount || Math.round(total * 100)),
        currency: String(data.currency || "INR"),
        name: settings.siteName || "Amila Gold",
        description: `${checkoutItemCount} item${checkoutItemCount > 1 ? 's' : ''}`,
        order_id: orderId,
        prefill: {
          name: selectedAddress?.FullName || "",
          email: user?.email || "",
          contact: selectedAddress?.phone1 || "",
        },
        theme: { color: "#154212" },
        handler: async (paymentResponse: Record<string, unknown>) => {
          try {
            const verifyData = (await verifyBackendPayment({
              razorpay_order_id: String(paymentResponse.razorpay_order_id || ""),
              razorpay_payment_id: String(paymentResponse.razorpay_payment_id || ""),
              razorpay_signature: String(paymentResponse.razorpay_signature || ""),
              items: checkoutItems.map((item) => ({
                product_id: item.id,
                quantity: item.qty,
                size: item.size,
                color: item.color || "",
                price: item.price,
              })),
              address_id: selectedAddressId || undefined,
              email: user?.email || "",
            })) as Record<string, unknown>;

            if (verifyData.status) {
              // Clear buyNowItem from localStorage
              if (typeof window !== 'undefined') {
                localStorage.removeItem('sr_buy_now_item');
              }
              // Only clear cart for normal checkout (not Buy Now)
              if (!buyNowItem) {
                clearCart();
              }
              router.push(`/order/success?order_id=${encodeURIComponent(String(verifyData.order_id || localOrderId || ""))}`);
            } else {
              router.push(`/order/failed?error=${encodeURIComponent(String(verifyData.message || "Payment verification failed"))}`);
            }
          } catch {
            router.push(`/order/failed?error=${encodeURIComponent("Payment verification failed")}`);
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) },
      });

      razorpay.open();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment could not be started. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!isPageLoading && !checkoutItemCount) {
    return (
      <main className="min-h-screen pt-20 pb-2 px-3 max-w-6xl mx-auto flex items-center justify-center">
        <div className="text-center space-y-6">
          <span className="material-symbols-outlined text-7xl text-secondary opacity-30">shopping_cart</span>
          <h1 className="font-headline text-4xl text-primary font-bold">Your cart is empty</h1>
          <p className="text-on-surface-variant">{buyNowItem ? 'Buy Now item expired. Please try again.' : 'Add products before checkout.'}</p>
          <Link href="/shop" className="inline-block mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-6 lg:pb-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
      <div className="flex items-start justify-between gap-8 lg:gap-12 flex-col lg:flex-row">
        <section className="flex-1 w-full space-y-6">
          <header className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">Checkout</h1>
              <p className="mt-2 text-on-surface-variant">Select address and complete payment.</p>
            </div>
            <Link href="/cart" className="hidden sm:inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">west</span>
              Back to cart
            </Link>
          </header>

          {isPageLoading ? (
            <CheckoutAddressSkeleton />
          ) : !isAuthenticated ? (
            <div className="flex items-center flex-col bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8 text-center">
              <p className="text-on-surface-variant mb-4">Please login to continue</p>
              <Link href={`/user/auth?returnTo=${encodeURIComponent(LOGIN_RETURN_TO)}`} className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                Login
              </Link>
            </div>
          ) : isLoadingAddresses ? (
            <CheckoutAddressSkeleton />
          ) : (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8 text-center">
                  <p className="text-on-surface-variant mb-4">No saved addresses found</p>
                </div>
              ) : (
                <div
                  className="space-y-4 max-h-[330px] overflow-y-auto hide-scrollbar overscroll-contain pr-1"
                  data-lenis-prevent="true"
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => event.stopPropagation()}
                >
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.address_id}
                      address={addr}
                      selected={selectedAddressId === addr.address_id}
                      onSelect={() => {
                        setSelectedAddressId(addr.address_id);
                        persistSelectedAddressId(addr.address_id);
                      }}
                      onEdit={() => openEditAddress(addr)}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  resetAddressForm();
                  setShowAddAddress(true);
                }}
                className="w-full py-4 border-2 border-dashed border-outline-variant/50 rounded-2xl text-on-surface-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-surface"
              >
                <span className="material-symbols-outlined">add</span>
                Add new address
              </button>

              {addressError ? <p className="text-sm text-error">{addressError}</p> : null}
              {showAddAddress && (
                <AddressModal
                  title={editingAddressId ? "Edit address" : "Add new address"}
                  onClose={() => {
                    setShowAddAddress(false);
                    resetAddressForm();
                  }}
                >
                  <AddressForm
                    value={newAddress}
                    onChange={setNewAddress}
                    onSubmit={handleAddressSubmit}
                    onCancel={() => {
                      setShowAddAddress(false);
                      resetAddressForm();
                    }}
                    submitLabel={editingAddressId ? "Update address" : "Save address"}
                    error={addressError}
                  />
                </AddressModal>
              )}
            </div>
          )}
        </section>

        <aside className="w-full lg:w-[420px] lg:sticky lg:top-28 self-start">
          {isPageLoading ? (
            <CheckoutSummarySkeleton />
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
              <h2 className="font-headline text-2xl text-primary font-bold">Order Summary</h2>

              {/* Products List */}
              <div className="mt-6 space-y-4 max-h-[250px] overflow-y-auto hide-scrollbar overscroll-contain pr-1" data-lenis-prevent="true">
                {checkoutItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 p-3 bg-white rounded-2xl border border-outline-variant/10">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-variant/20 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        // unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-primary text-sm truncate">{item.name}</h3>
                      {item.size && (
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Size: {item.size}</span>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-on-surface-variant">Qty: {item.qty}</span>
                        <span className="font-bold text-secondary text-sm">{currencySymbol}{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-3">
                <div className="pb-2">
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Razorpay")}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold ${paymentMethod === "Razorpay" ? "border-primary text-primary bg-primary/5" : "border-outline-variant/30 text-on-surface-variant"}`}
                    >
                      Razorpay
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold ${paymentMethod === "COD" ? "border-primary text-primary bg-primary/5" : "border-outline-variant/30 text-on-surface-variant"}`}
                    >
                      COD
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span>{currencySymbol}{SHIPPING.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-baseline">
                  <span className="font-headline text-xl font-bold text-primary">Total</span>
                  <span className="font-headline text-2xl font-black text-secondary">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing || !selectedAddressId || !isAuthenticated || hasStockConflict}
                className="mt-6 w-full bg-primary text-on-primary py-4 rounded-full font-headline text-lg font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
              >
                <span className="material-symbols-outlined">credit_card</span>
                <span>{isProcessing ? "Processing..." : paymentMethod === "COD" ? "Place COD Order" : `Pay ${currencySymbol}${total.toFixed(2)}`}</span>
              </button>

              <p className="text-center text-on-surface-variant text-xs font-body mt-3">{paymentMethod === "COD" ? "Cash on Delivery selected" : "Secure checkout via Razorpay"}</p>
              {hasStockConflict ? <p className="text-center text-sm text-error mt-2">{stockConflictMessage || "Some items are out of stock."}</p> : null}
              {paymentError ? <p className="text-center text-sm text-error mt-2">{paymentError}</p> : null}
            </div>
          )}
        </aside>

      </div>
    </main>
  );
}
