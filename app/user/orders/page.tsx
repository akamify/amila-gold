"use client";

import SymbolIcon from "@/app/components/icons/SymbolIcon";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import { OrderListSkeleton } from "@/app/components/Skeletons";
import { useRequireAuth } from "@/app/context/AuthContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { createProductHref } from "@/app/data/products";
import { fetchOrders } from "@/app/lib/apiClient";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type UserOrder = {
  order_id?: string;
  order_code?: string;
  status?: string;
  amount?: number;
  createdAt?: string;
  items?: Array<{
    product_id?: number;
    quantity?: number;
    price?: number;
    size?: string;
    product_image?: string;
    product?: {
      product_code?: string;
      title?: string;
      name?: string;
      product_image?: string[];
    };
  }>;
};

export default function OrdersPage() {
  const { isLoading: authLoading, isAuthenticated } =
    useRequireAuth("/user/auth");
  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsDataLoading(true);
    fetchOrders()
      .then((rows) => setOrders(Array.isArray(rows) ? (rows as UserOrder[]) : []))
      .catch(() => setOrders([]))
      .finally(() => setIsDataLoading(false));
  }, [isAuthenticated]);

  const mappedOrders = useMemo(
    () =>
      orders.map((order) => {
        const status = String(order.status || "pending");
        const lower = status.toLowerCase();
        const statusBg =
          lower.includes("transit") || lower.includes("ship")
            ? "bg-secondary"
            : null;
        const icon = lower.includes("deliver")
          ? "check_circle"
          : lower.includes("harvest")
            ? "eco"
            : null;
        const firstImage = Array.isArray(order.items)
          ? order.items[0]?.product?.product_image?.[0] ||
            order.items[0]?.product_image ||
            ""
          : "";
        const firstProduct = Array.isArray(order.items)
          ? order.items[0]
          : undefined;
        const firstName = String(
          firstProduct?.product?.title || firstProduct?.product?.name || "",
        );
        const firstId = Number(firstProduct?.product_id || 0);
        const firstPublicId = String(
          firstProduct?.product?.product_code || "",
        );
        const safeAmount = Number(order.amount || 0);
        const itemsTotal = Array.isArray(order.items)
          ? order.items.reduce((sum, item) => {
              const price = Number(item.price || 0);
              const qty = Number(item.quantity || 0);
              return (
                sum +
                (Number.isFinite(price) ? price : 0) *
                  (Number.isFinite(qty) ? qty : 0)
              );
            }, 0)
          : 0;
        const normalizedAmount =
          safeAmount > 0
            ? itemsTotal > 0 && safeAmount > itemsTotal * 5
              ? safeAmount / 100
              : safeAmount
            : itemsTotal;

        return {
          id: String(order.order_code || order.order_id || ""),
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "-",
          status,
          statusColor:
            lower.includes("transit") || lower.includes("ship")
              ? "text-secondary"
              : lower.includes("deliver")
                ? "text-on-surface-variant"
                : "text-primary",
          statusBg,
          icon,
          total: `${currencySymbol}${normalizedAmount.toFixed(2)}`,
          images: Array.isArray(firstProduct?.product?.product_image)
            ? [firstImage, ...firstProduct.product.product_image]
            : [firstImage],
          productHref:
            firstId > 0 && firstName
              ? createProductHref(
                  {
                    id: firstId,
                    publicId: firstPublicId || undefined,
                    name: firstName,
                  },
                  firstProduct?.size,
                )
              : "",
          opacityClass: lower.includes("deliver")
            ? "opacity-80 grayscale-[10%]"
            : "",
        };
      }),
    [currencySymbol, orders],
  );

  if (authLoading || (isAuthenticated && isDataLoading)) {
    return <OrderListSkeleton />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mt-4 flex-grow md:mt-8">
      <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline text-3xl tracking-tight text-primary italic md:text-5xl lg:text-6xl">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Track every order, payment, and delivery update in one place.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {mappedOrders.map((order) => (
          <div
            key={order.id}
            className={`group rounded-[1.75rem] border border-outline-variant/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,236,0.95))] p-5 shadow-[0_16px_44px_rgba(29,66,26,0.05)] transition-all hover:-translate-y-0.5 hover:border-outline-variant/30 hover:shadow-[0_18px_46px_rgba(29,66,26,0.08)] md:p-7 ${order.opacityClass}`}
          >
            <div className="flex flex-col items-start gap-5 xl:flex-row xl:items-center xl:gap-8">
              {order.productHref ? (
                <Link
                  href={order.productHref}
                  className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/10 bg-white shadow-sm md:h-28 md:w-28"
                >
                  <ResilientProductImage sources={order.images} alt="Order Item" />
                </Link>
              ) : (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/10 bg-white shadow-sm md:h-28 md:w-28">
                  <ResilientProductImage sources={order.images} alt="Order Item" />
                </div>
              )}

              <div className="grid w-full flex-grow grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant md:text-[10px]">
                    Order Number
                  </p>
                  <p className="text-sm font-bold text-primary md:text-base">
                    {order.id}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant md:text-[10px]">
                    Date Placed
                  </p>
                  <p className="text-sm text-primary/80 md:text-base">
                    {order.date}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant md:text-[10px]">
                    Status
                  </p>
                  <div className={`flex items-center gap-2 ${order.statusColor}`}>
                    {order.statusBg ? (
                      <span
                        className={`h-2 w-2 rounded-full ${order.statusBg}`}
                      />
                    ) : null}
                    {order.icon ? (
                      <SymbolIcon
                        name={order.icon}
                        className="text-[16px] md:text-[20px]"
                      />
                    ) : null}
                    <p className="text-sm font-bold md:text-base">
                      {order.status}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant md:text-[10px]">
                    Total
                  </p>
                  <p className="font-headline text-lg font-bold italic text-primary md:text-xl">
                    {order.total}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-end self-stretch xl:w-auto">
                <Link
                  href={`/user/orders/${encodeURIComponent(order.id)}`}
                  className="w-full rounded-full border-[1.5px] border-secondary px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-secondary transition-all hover:bg-secondary-container/20 xl:w-auto"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mappedOrders.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-outline-variant/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,236,0.95))] p-8 text-center text-on-surface-variant shadow-[0_16px_44px_rgba(29,66,26,0.05)]">
          No orders yet.
        </div>
      ) : null}

      <div className="mt-14 flex flex-col items-center border-t border-outline-variant/20 py-12 text-center">
        <SymbolIcon
          name={"history"}
          className="mb-4 text-4xl text-outline opacity-50"
        />
        <p className="font-headline text-2xl font-bold italic text-primary">
          Looking for older orders?
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-on-surface-variant">
          Orders older than one year are archived. Please contact our heritage
          concierge for historical records.
        </p>
      </div>
    </div>
  );
}
