"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cancelUserOrder, fetchOrders } from "@/app/lib/apiClient";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { createProductHref } from "@/app/data/products";

type OrderRow = {
  order_id?: string;
  order_code?: string;
  status?: string;
  amount?: number;
  createdAt?: string;
  FullName?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  payment_method?: string;
  refund_reason?: string;
  razorpay_payment_id?: string;
  status_history?: Array<{ status?: string; updatedAt?: string }>;
  items?: Array<{ product_id?: number; quantity?: number; price?: number; product_image?: string; product?: { product_code?: string; title?: string; name?: string; product_image?: string[] } }>;
};

import { OrderDetailSkeleton } from "@/app/components/Skeletons";

export default function OrderDetailsPage() {
  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";
  const params = useParams();
  const orderId = params?.id ? decodeURIComponent(params.id as string) : "#AG-882910";
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [orderActionReason, setOrderActionReason] = useState("");
  const [orderActionUpi, setOrderActionUpi] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    setIsDataLoading(true);
    fetchOrders()
      .then((rows) => setOrders(Array.isArray(rows) ? (rows as OrderRow[]) : []))
      .catch(() => setOrders([]))
      .finally(() => setIsDataLoading(false));
  }, []);

  const order = useMemo(
    () => orders.find((row) => String(row.order_code || row.order_id || "") === String(orderId)),
    [orders, orderId]
  );
  const items = Array.isArray(order?.items) ? order.items : [];
  const orderPlacedText = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const rawAmount = Number(order?.amount || 0);
  const total = rawAmount > 0 ? (rawSubtotal > 0 && rawAmount > rawSubtotal * 5 ? rawAmount / 100 : rawAmount) : rawSubtotal;
  const subtotal = rawSubtotal > 0 ? rawSubtotal : total;
  const isCodPayment = String(order?.payment_method || "").trim().toLowerCase() === "cod";
  const codCharge = isCodPayment ? Math.max(0, total - subtotal) : 0;
  const totalQty = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 0)), 0);
  const fallbackUnitPrice = totalQty > 0 && subtotal > 0 ? subtotal / totalQty : 0;
  const displayItems = items.map((item) => {
    const qty = Math.max(1, Number(item.quantity || 0));
    const originalPrice = Number(item.price || 0);
    const resolvedPrice = originalPrice > 0 ? originalPrice : fallbackUnitPrice;
    return { ...item, quantity: qty, price: resolvedPrice };
  });
  const normalizedStatus = String(order?.status || "confirmed").toLowerCase().replace(/\s+/g, "_");
  const canCancel = ["pending", "confirmed"].includes(normalizedStatus);
  const formatDisplayDate = (date: Date) =>
    `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
  const etaCard = useMemo(() => {
    const resolveStatusDate = (targetStatus: string): Date | null => {
      const entry = (order?.status_history || [])
        .filter((statusEntry) => String(statusEntry?.status || "").toLowerCase().replace(/\s+/g, "_") === targetStatus)
        .slice(-1)[0];
      if (entry?.updatedAt) {
        const parsed = new Date(entry.updatedAt);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
      return null;
    };

    const completedStatusMeta: Record<string, string> = {
      delivered: "Delivered on",
      cancelled: "Cancelled on",
      rto: "RTO on",
      return: "Returned on",
      refund: "Refunded on",
    };

    const statusLabel = completedStatusMeta[normalizedStatus];
    if (statusLabel) {
      const statusDate =
        resolveStatusDate(normalizedStatus) ||
        (order?.createdAt ? new Date(order.createdAt) : new Date());
      return {
        heading: statusLabel,
        dateText: formatDisplayDate(statusDate),
        helperText: "Final status date",
      };
    }

    const base = order?.createdAt ? new Date(order.createdAt) : new Date();
    const seed = String(order?.order_id || order?.order_code || orderId)
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const dayOffset = 3 + (seed % 3);
    const eta = new Date(base.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    return {
      heading: "Estimated Arrival",
      dateText: formatDisplayDate(eta),
      helperText: "Estimated in 3-5 days",
    };
  }, [normalizedStatus, order?.createdAt, order?.order_code, order?.order_id, order?.status_history, orderId]);
  const isCancelled = normalizedStatus === "cancelled";
  const paymentMethod = String(order?.payment_method || "Razorpay");
  const needsUpiForCancel = canCancel && paymentMethod.toLowerCase() === "razorpay";
  const baseStatuses = ["confirmed", "processed", "in_transit", "delivered"];
  const tailStatuses = ["rto", "return", "refund"];
  const progressStatuses = isCancelled
    ? ["confirmed", "cancelled"]
    : [...baseStatuses, ...(tailStatuses.includes(normalizedStatus) ? [normalizedStatus] : [])];
  const activeIndex = Math.max(0, progressStatuses.indexOf(normalizedStatus));
  const progressWidth = progressStatuses.length > 1 ? `${(activeIndex / (progressStatuses.length - 1)) * 100}%` : "100%";
  const getStatusIcon = (status: string) => {
    if (status === "cancelled") return "cancel";
    if (status === "confirmed") return "check_circle";
    if (status === "processed") return "inventory_2";
    if (status === "in_transit") return "local_shipping";
    if (status === "delivered") return "home";
    if (status === "rto") return "keyboard_return";
    if (status === "return") return "assignment_return";
    if (status === "refund") return "currency_rupee";
    return "radio_button_unchecked";
  };

  if (isDataLoading) return <OrderDetailSkeleton />;

  return (
    <div className="flex-1 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row pb-4">
      {/* Main Content Canvas */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-8">
          <div>
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-4 font-bold">
              <Link href="/user/orders" className="hover:text-primary transition-colors">Orders</Link>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-secondary tracking-widest">Order {orderId}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline italic tracking-tighter text-primary">Order Details</h1>
            <p className="mt-4 text-on-surface-variant max-w-md font-body text-sm leading-relaxed">
              Placed on {orderPlacedText}. Your artisanal collection is currently {String(order?.status || "processing").toLowerCase()}.
            </p>
          </div>
          {actionMessage ? (
            <p className="py-2 text-xs uppercase tracking-widest text-secondary font-bold">{actionMessage}</p>
          ) : null}
          <div />
        </div>

        {/* Delivery Progress Tracker */}
        <div className="bg-surface-container-low rounded-xl p-2 md:p-12 mb-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-8">
            <div className="flex-1 w-full">
              <div className="flex justify-between mb-8 relative">
                {progressStatuses.map((st, idx) => {
                  const isActive = idx <= activeIndex;
                  const activeClasses = isCancelled
                    ? "bg-error text-white"
                    : "bg-primary text-on-primary";
                  return (
                    <div key={st} className={`text-center z-10 w-20 flex flex-col items-center ${!isActive ? "opacity-40" : ""}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ring-4 ring-surface shadow-md ${isActive ? activeClasses : "bg-outline-variant text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined text-lg">{getStatusIcon(st)}</span>
                      </div>
                      <p className={`text-[9px] uppercase tracking-tighter font-bold ${isCancelled && isActive ? "text-error" : isActive ? "text-primary" : ""}`}>
                        {st.replace(/_/g, " ")}
                      </p>
                    </div>
                  );
                })}
                <div className="absolute top-5 left-10 right-10 h-1 bg-surface-variant rounded-full -z-10">
                  <div className={`h-full rounded-full ${isCancelled ? "bg-error" : "bg-primary"}`} style={{ width: progressWidth }} />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-64 bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 font-bold">{etaCard.heading}</p>
              <p className="text-2xl font-headline italic text-primary font-bold">{etaCard.dateText}</p>
              <p className="text-xs text-on-surface-variant mt-2 font-medium">{etaCard.helperText}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Order Items */}
          <div className="xl:col-span-2 space-y-8">
            <h3 className="text-2xl lg:text-3xl font-headline italic text-primary font-bold">Purchased Items</h3>
            <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="divide-y divide-outline-variant/10">
                {displayItems.map((item, idx) => (
                  <div key={`${item.product_id || idx}-${idx}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 hover:bg-surface-container-low transition-colors group">
                    <Link
                      href={createProductHref({
                        id: Number(item.product_id || 0),
                        publicId: item.product?.product_code || undefined,
                        name: item.product?.title || item.product?.name || `product-${item.product_id || "item"}`,
                      })}
                      className="w-24 h-24 bg-surface-variant rounded-lg overflow-hidden flex-shrink-0 block"
                    >
                      {(item.product?.product_image?.[0] || item.product_image) ? (
                        <img className="w-full h-full object-cover" src={item.product?.product_image?.[0] || item.product_image || ""} alt={item.product?.title || item.product?.name || "Product"} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1.5">Order Item</p>
                      <h4 className="text-lg lg:text-xl font-headline font-bold text-primary group-hover:text-secondary group-hover:underline transition-colors">{item.product?.title || item.product?.name || "Product"}</h4>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <div className="flex items-center sm:justify-end gap-2 flex-wrap">
                        <p className="text-lg font-bold text-primary">{currencySymbol}{Number(item.price || 0).toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Qty: {Number(item.quantity || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-8">
            {/* Address & Payment */}
            <div className="bg-surface-container rounded-xl p-8 space-y-8 shadow-sm">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4 font-bold">Shipping Address</p>
                <p className="text-sm font-bold text-primary">{order?.FullName || "-"}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
                  {order?.address_line1 || "-"}<br />
                  {order?.city || "-"}, {order?.state || "-"} {order?.pinCode || ""}<br />
                  {order?.country || "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4 font-bold">Payment Details</p>
                <p className="text-sm text-primary font-bold">Order ID: {String(order?.order_id || order?.order_code || orderId)}</p>
                <p className="text-sm text-on-surface-variant mt-2">Transaction ID: {String(order?.razorpay_payment_id || "N/A")}</p>
                <p className="text-sm text-on-surface-variant mt-2">Payment Method: {String(order?.payment_method || "Razorpay")}</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-primary text-on-primary rounded-xl p-8 shadow-2xl shadow-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary-container/80 mb-8 font-bold">Order Summary</p>
              <div className="space-y-5 relative z-10">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Subtotal</span>
                  <span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Heritage Shipping</span>
                  <span className="font-medium">{currencySymbol}0.00</span>
                </div>
                {isCodPayment && codCharge > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">COD Charge</span>
                    <span className="font-medium">{currencySymbol}{codCharge.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="pt-6 mt-2 border-t border-on-primary/20 flex justify-between items-baseline">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Total</span>
                  <span className="text-3xl font-headline italic font-bold">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Support Badge */}
            <div className="flex flex-col items-center justify-center text-center p-6 border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">

              <p className="text-xs text-on-surface-variant mb-3">
                Need assistance with this order?
              </p>

              <button
                onClick={() => setShowHelpModal(true)}
                className="inline-flex items-center justify-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest border-b-2 border-secondary pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  headset_mic
                </span>

                Need Help
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl border border-outline-variant/20">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-headline text-primary font-bold">
                Need Help?
              </h2>

              <button
                onClick={() => setShowHelpModal(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div className="space-y-3">

              {/* Contact */}
              <button
                onClick={() => {
                  window.location.href = "/contact";
                }}
                className="w-full rounded-xl border border-outline-variant/30 px-4 py-3 text-sm font-bold hover:bg-surface-container-low transition-colors"
              >
                Contact Support
              </button>

              {/* Cancel */}
              {canCancel && (
                <button
                  onClick={() => {
                    setShowHelpModal(false);
                    setShowActionModal(true);
                  }}
                  className="w-full rounded-xl bg-error px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-error/90"
                >
                  Cancel Order
                </button>
              )}

            </div>
          </div>
        </div>
      )}
      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-outline-variant/20">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-headline text-primary font-bold">
                Cancel Order
              </h2>

              <button
                onClick={() => setShowActionModal(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <textarea
              value={orderActionReason}
              onChange={(e) => setOrderActionReason(e.target.value)}
              placeholder="Cancellation reason"
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3 text-sm outline-none focus:border-primary"
              rows={4}
            />

            {needsUpiForCancel ? (
              <input
                value={orderActionUpi}
                onChange={(e) => setOrderActionUpi(e.target.value)}
                placeholder="Refund UPI ID"
                className="mt-3 w-full rounded-xl border border-outline-variant/30 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            ) : null}

            {actionMessage ? (
              <p className="mt-3 text-xs text-secondary font-bold">
                {actionMessage}
              </p>
            ) : null}

            <button
              onClick={async () => {
                const reason = orderActionReason.trim();
                const upi = orderActionUpi.trim();

                if (!reason) {
                  setActionMessage("Please enter reason.");
                  return;
                }

                if (needsUpiForCancel && !upi) {
                  setActionMessage("Please enter refund UPI ID.");
                  return;
                }

                try {
                  setBusyAction(true);
                  setActionMessage("");

                  await cancelUserOrder(
                    String(order?.order_code || order?.order_id || orderId),
                    reason,
                    upi
                  );

                  setActionMessage("Order cancelled successfully.");

                  const rows = await fetchOrders();

                  setOrders(
                    Array.isArray(rows)
                      ? (rows as OrderRow[])
                      : []
                  );

                  setOrderActionReason("");
                  setOrderActionUpi("");

                  setTimeout(() => {
                    setShowActionModal(false);
                  }, 1200);

                } catch {
                  setActionMessage("Unable to cancel order.");
                } finally {
                  setBusyAction(false);
                }
              }}
              disabled={busyAction}
              className="mt-5 w-full rounded-xl bg-error px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-error/90 disabled:opacity-60"
            >
              {busyAction ? "Please wait..." : "Cancel Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
