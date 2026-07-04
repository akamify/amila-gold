"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import {
  X,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Package,
  History,
  Truck,
  ShieldCheck,
  Circle,
  Loader2,
  User,
  ReceiptText,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { type AdminOrder } from "../orders.api";
import {
  formatAddress,
  formatDate,
  formatStatusLabel,
  getCustomerName,
  getOrderKey,
} from "../orders.utils";
import { changeAdminOrderStatus } from "../orders.api";

type Props = {
  order: AdminOrder | null;
  currency: string;
  onClose: () => void;
  onUpdated: () => void;
};

type StatusTone = "success" | "error" | "";

function statusBadgeClass(status: string) {
  const normalized = String(status || "").toLowerCase();

  if (["delivered", "paid", "confirmed", "processed"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["cancelled", "refund", "rto", "failed", "rejected"].includes(normalized)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (["in_transit", "active", "shipped"].includes(normalized)) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-slate-100 text-slate-600">
          <Icon size={15} strokeWidth={2.5} />
        </span>

        <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-800">
          {title}
        </h4>
      </div>

      {children}
    </section>
  );
}

function RowInfo({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>

      <span
        className={`max-w-[210px] text-right text-xs ${
          strong ? "font-black text-slate-950" : "font-bold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderDetailsModal({
  order,
  currency,
  onClose,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone>("");

  useEffect(() => {
    setOpen(!!order);

    if (order) {
      setStatusUpdate(String(order.status || "pending"));
      setStatusMessage("");
      setStatusTone("");
    }
  }, [order]);

  useEffect(() => {
    if (!order) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !statusBusy) onClose();
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [order, onClose, statusBusy]);

  if (!order || !open || typeof document === "undefined") return null;

  const orderKey = getOrderKey(order);
  const statusHistory = order.status_history ?? [];
  const lineItems = order.items ?? [];
  const customerName =
    order.address?.FullName || order.FullName || getCustomerName(order);
  const customerEmail = order.address?.email || order.user_email || "";
  const primaryPhone = order.address?.phone1 || order.phone1 || "";
  const alternatePhone = order.address?.phone2 || order.phone2 || "";
  const normalizedStatus = String(order.status || "pending").toLowerCase();

  const statusFlowMap: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processed", "cancelled"],
    processed: ["in_transit", "cancelled"],
    in_transit: ["delivered", "rto"],
    delivered: ["delivered"],
    return: ["refund"],
    rto: ["refund"],
    refund: ["refund"],
    cancelled: ["cancelled"],
  };

  const nextStatuses = statusFlowMap[normalizedStatus] || [];
  const availableStatuses = [
    normalizedStatus,
    ...nextStatuses.filter((s) => s !== normalizedStatus),
  ];

  const lineItemsTotal = lineItems.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    return sum + quantity * price;
  }, 0);

  const totalAmount =
    Number(order.amount || 0) > 0 ? Number(order.amount) : lineItemsTotal;

  const handleStatusUpdate = async () => {
    if (!orderKey) return;

    setStatusBusy(true);
    setStatusMessage("");
    setStatusTone("");

    try {
      await changeAdminOrderStatus(orderKey, statusUpdate);
      setStatusMessage("Order status updated successfully.");
      setStatusTone("success");
      onUpdated();
    } catch {
      setStatusMessage("Status update failed. Please try again.");
      setStatusTone("error");
    } finally {
      setStatusBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={() => {
          if (!statusBusy) onClose();
        }}
      />

      <div className="order-modal relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
                  {order.order_id || order.order_code || "N/A"}
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${statusBadgeClass(
                    normalizedStatus,
                  )}`}
                >
                  {formatStatusLabel(normalizedStatus)}
                </span>

                <span className="text-[11px] font-bold text-slate-400">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <h3 className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-slate-950 md:text-3xl">
                {customerName}
              </h3>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Order manifest and fulfillment control
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={statusBusy}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close order details"
            >
              <X size={20} strokeWidth={2.6} />
            </button>
          </div>
        </header>

        <div className="order-modal-scroll flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-5 md:p-6">
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="grid gap-5 lg:col-span-7">
              <InfoCard icon={Truck} title="Fulfillment Control">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Next status
                    </span>

                    <select
                      value={statusUpdate}
                      onChange={(event) => setStatusUpdate(event.target.value)}
                      className="h-11 rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-xs font-black uppercase tracking-[0.08em] text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                    >
                      {availableStatuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                          disabled={status === normalizedStatus}
                        >
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={statusBusy || !orderKey}
                    className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-[12px] bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statusBusy ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>

                {statusMessage ? (
                  <div
                    className={`mt-3 flex items-center gap-2 rounded-[12px] border px-3 py-2 text-xs font-bold ${
                      statusTone === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {statusTone === "success" ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <AlertCircle size={15} />
                    )}
                    {statusMessage}
                  </div>
                ) : null}
              </InfoCard>

              <InfoCard icon={Package} title="Line Items">
                {lineItems.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-slate-200 py-10 text-center text-xs font-bold text-slate-400">
                    No line items found.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {lineItems.map((item, index) => {
                      const quantity = Number(item.quantity || 0);
                      const price = Number(item.price || 0);
                      const itemTotal = quantity * price;

                      return (
                        <article
                          key={index}
                          className="grid gap-3 rounded-[12px] border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm sm:grid-cols-[72px_minmax(0,1fr)_auto]"
                        >
                          <div className="relative h-20 w-full overflow-hidden rounded-[10px] bg-slate-100 sm:h-[72px] sm:w-[72px]">
                            <ResilientProductImage
                              sources={item.product_images || [item.product_image]}
                              alt={
                                item.product_name ||
                                `Product ${item.product_id}`
                              }
                              fallbackClassName="bg-slate-100 text-slate-400"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-black leading-5 text-slate-950">
                              {item.product_name ||
                                `Product ${item.product_id}`}
                            </p>

                            {item.size || item.color ? (
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                {item.size ? `Size: ${item.size}` : ""}
                                {item.size && item.color ? " • " : ""}
                                {item.color ? `Color: ${item.color}` : ""}
                              </p>
                            ) : null}

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                                Qty {quantity}
                              </span>

                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                                Product #{item.product_id || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between gap-4 sm:block sm:text-right">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                Unit
                              </p>
                              <p className="text-sm font-black text-slate-950">
                                {currency}
                                {price.toFixed(2)}
                              </p>
                            </div>

                            <div className="sm:mt-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                Total
                              </p>
                              <p className="text-sm font-black text-emerald-600">
                                {currency}
                                {itemTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </InfoCard>

              <InfoCard icon={History} title="Activity Timeline">
                <div className="relative ml-2 border-l border-slate-200 pl-5">
                  {statusHistory.length === 0 ? (
                    <p className="py-3 text-xs font-bold text-slate-400">
                      No activity recorded.
                    </p>
                  ) : (
                    <div className="grid gap-5">
                      {statusHistory.map((entry, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-white ring-4 ring-slate-50">
                            <Circle
                              size={8}
                              className={
                                index === 0
                                  ? "fill-red-600 text-red-600"
                                  : "fill-slate-300 text-slate-300"
                              }
                            />
                          </div>

                          <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-950">
                            {formatStatusLabel(entry.status)}
                          </p>

                          <p className="mt-1 text-[10px] font-bold text-slate-400">
                            {String(entry.timestamp)}
                          </p>

                          {entry.activity || entry.location ? (
                            <div className="mt-2 rounded-[10px] bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-600">
                              {entry.activity ? <p>By: {entry.activity}</p> : null}
                              {entry.location ? (
                                <p className="text-slate-400">
                                  Note: {entry.location}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </InfoCard>
            </div>

            <aside className="grid gap-5 lg:col-span-5 lg:self-start">
              <InfoCard icon={MapPin} title="Shipping Details">
                <p className="text-sm font-black text-slate-950">
                  {customerName}
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  {formatAddress(order)}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                  <Truck size={13} />
                  {String(
                    order.address?.addressType ||
                      order.addressType ||
                      "Residential",
                  )}
                </div>
              </InfoCard>

              <InfoCard icon={User} title="Customer Contact">
                <div className="grid gap-2">
                  {primaryPhone ? (
                    <a
                      href={`tel:${primaryPhone}`}
                      className="flex items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-white"
                    >
                      <Phone size={15} className="shrink-0 text-red-600" />
                      <span>{primaryPhone}</span>
                    </a>
                  ) : null}

                  {alternatePhone && alternatePhone !== primaryPhone ? (
                    <a
                      href={`tel:${alternatePhone}`}
                      className="flex items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-white"
                    >
                      <Phone size={15} className="shrink-0 text-slate-500" />
                      <span>
                        {alternatePhone}
                        <span className="ml-1 text-[10px] uppercase text-slate-400">
                          Alternate
                        </span>
                      </span>
                    </a>
                  ) : null}

                  {customerEmail ? (
                    <a
                      href={`mailto:${customerEmail}`}
                      className="flex items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-white"
                    >
                      <Mail size={15} className="shrink-0 text-red-600" />
                      <span className="min-w-0 break-all">{customerEmail}</span>
                    </a>
                  ) : null}

                  {!primaryPhone && !alternatePhone && !customerEmail ? (
                    <p className="text-xs font-bold text-slate-400">
                      Contact details unavailable.
                    </p>
                  ) : null}
                </div>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Payment Details">
                <div className="grid gap-1">
                  <RowInfo
                    label="Method"
                    value={order.payment_method || "N/A"}
                    strong
                  />

                  <RowInfo
                    label="Status"
                    value={
                      <span
                        className={
                          String(order.payment_status || "").toLowerCase() ===
                          "paid"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {order.payment_status || "Pending"}
                      </span>
                    }
                    strong
                  />

                  <RowInfo
                    label="Txn ID"
                    value={order.razorpay_payment_id || "---"}
                  />

                  {order.refund_request_type ? (
                    <RowInfo label="Refund Type" value={order.refund_request_type} />
                  ) : null}

                  {order.refund_reason ? (
                    <RowInfo label="Refund Reason" value={order.refund_reason} />
                  ) : null}

                  {order.refund_upi_id ? (
                    <RowInfo label="Refund UPI" value={order.refund_upi_id} />
                  ) : null}
                </div>
              </InfoCard>

              <section className="overflow-hidden rounded-[16px] bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <div className="border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <ShieldCheck size={17} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                      Verified Secure
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Total Order Value
                      </p>

                      <p className="mt-2 text-3xl font-black tracking-[-0.05em]">
                        {currency}
                        {Number(totalAmount).toFixed(2)}
                      </p>
                    </div>

                    <ReceiptText size={34} className="text-white/20" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-[12px] bg-white/5 px-3 py-3">
                      <p className="text-[10px] font-bold text-slate-400">
                        Items
                      </p>
                      <p className="mt-1 text-lg font-black">
                        {lineItems.length}
                      </p>
                    </div>

                    <div className="rounded-[12px] bg-white/5 px-3 py-3">
                      <p className="text-[10px] font-bold text-slate-400">
                        Status
                      </p>
                      <p className="mt-1 truncate text-sm font-black">
                        {formatStatusLabel(normalizedStatus)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              System Instance: 04-AA-X // Logistics Cloud
            </p>

            <button
              type="button"
              onClick={onClose}
              disabled={statusBusy}
              className="inline-flex h-9 items-center justify-center rounded-[10px] bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Exit Manifest
            </button>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .order-modal {
          animation: orderModalIn 180ms ease-out;
        }

        @keyframes orderModalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .order-modal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior: contain;
        }

        .order-modal-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .order-modal,
          .order-modal * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}