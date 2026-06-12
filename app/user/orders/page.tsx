"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/app/context/AuthContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { fetchOrders } from "@/app/lib/apiClient";
import { createProductHref } from "@/app/data/products";
import ResilientProductImage from "@/app/components/ResilientProductImage";
type UserOrder = {
  order_id?: string;
  order_code?: string;
  status?: string;
  amount?: number;
  createdAt?: string;
  items?: Array<{ product_id?: number; quantity?: number; price?: number; size?: string; product_image?: string; product?: { product_code?: string; title?: string; name?: string; product_image?: string[] } }>;
};

import { OrderListSkeleton } from "@/app/components/Skeletons";

export default function OrdersPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth('/user/auth');
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

  const mappedOrders = useMemo(() => orders.map((order) => {
    const status = String(order.status || 'pending');
    const lower = status.toLowerCase();
    const statusBg = lower.includes('transit') || lower.includes('ship') ? "bg-secondary" : null;
    const icon = lower.includes('deliver') ? "check_circle" : lower.includes('harvest') ? "eco" : null;
    const firstImage = Array.isArray(order.items)
      ? (order.items[0]?.product?.product_image?.[0] || order.items[0]?.product_image || "")
      : "";
    const firstProduct = Array.isArray(order.items) ? order.items[0] : undefined;
    const firstName = String(firstProduct?.product?.title || firstProduct?.product?.name || "");
    const firstId = Number(firstProduct?.product_id || 0);
    const firstPublicId = String(firstProduct?.product?.product_code || "");
    const safeAmount = Number(order.amount || 0);
    const itemsTotal = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 0);
        return sum + (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 0);
      }, 0)
      : 0;
    const normalizedAmount = safeAmount > 0
      ? (itemsTotal > 0 && safeAmount > itemsTotal * 5 ? safeAmount / 100 : safeAmount)
      : itemsTotal;
    return {
      id: String(order.order_code || order.order_id || ""),
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-",
      status,
      statusColor: lower.includes('transit') || lower.includes('ship') ? "text-secondary" : lower.includes('deliver') ? "text-on-surface-variant" : "text-primary",
      statusBg,
      icon,
      total: `${currencySymbol}${normalizedAmount.toFixed(2)}`,
      images: Array.isArray(firstProduct?.product?.product_image)
        ? [firstImage, ...firstProduct.product.product_image]
        : [firstImage],
      productHref: firstId > 0 && firstName
        ? createProductHref({ id: firstId, publicId: firstPublicId || undefined, name: firstName }, firstProduct?.size)
        : "",
      opacityClass: lower.includes('deliver') ? "opacity-80 grayscale-[10%]" : "",
    };
  }), [currencySymbol, orders]);

  if (authLoading || (isAuthenticated && isDataLoading)) {
    return <OrderListSkeleton />;
  }


  if (!isAuthenticated) return null;

  return (
    <div className="flex-grow">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline tracking-tighter text-primary italic">Order History</h1>
          <p className="text-on-surface-variant mt-2 font-body text-sm">Tracking your journey through the harvest.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary font-bold uppercase tracking-widest cursor-pointer hover:bg-secondary/10 px-3 py-1.5 rounded-lg transition-colors">
          <span>All Seasons</span>
          <span className="material-symbols-outlined text-lg">expand_more</span>
        </div>
      </div>

      {/* Orders Grid/List */}
      <div className="space-y-8">
        {mappedOrders.map((order) => (
          <div key={order.id} className={`bg-surface-container-low rounded-xl p-6 md:p-8 transition-all hover:bg-surface-container group border border-transparent hover:border-outline-variant/30 ${order.opacityClass}`}>
            <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
              {order.productHref ? (
                <Link href={order.productHref} className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-sm block">
                  <ResilientProductImage sources={order.images} alt="Order Item" />
                </Link>
              ) : (
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-sm">
                  <ResilientProductImage sources={order.images} alt="Order Item" />
                </div>
              )}
              
              <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 w-full">
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Order Number</p>
                  <p className="font-bold text-primary text-sm md:text-base">{order.id}</p>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Date Placed</p>
                  <p className="font-body text-sm md:text-base text-primary/80">{order.date}</p>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Status</p>
                  <div className={`flex items-center gap-2 ${order.statusColor}`}>
                    {order.statusBg && <span className={`w-2 h-2 rounded-full ${order.statusBg}`}></span>}
                    {order.icon && <span className="material-symbols-outlined text-[16px] md:text-[20px]">{order.icon}</span>}
                    <p className="font-bold text-sm md:text-base">{order.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Total</p>
                  <p className="font-headline italic text-lg md:text-xl text-primary font-bold">{order.total}</p>
                </div>
              </div>
              
              <div className="w-full xl:w-auto self-stretch flex items-end">
                <Link
                  href={`/user/orders/${encodeURIComponent(order.id)}`}
                  className="w-full xl:w-auto px-8 py-3 rounded-full border-[1.5px] border-secondary text-secondary font-bold text-xs uppercase tracking-widest hover:bg-secondary-container/20 transition-all text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {mappedOrders.length === 0 && (
        <div className="rounded-xl border border-outline-variant/30 p-8 text-center text-on-surface-variant">
          No orders yet.
        </div>
      )}

      {/* Empty State Message */}
      <div className="mt-20 py-16 border-t border-outline-variant/20 flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-4 opacity-50">history</span>
        <p className="font-headline text-2xl text-primary italic font-bold">Looking for older harvests?</p>
        <p className="text-on-surface-variant max-w-sm mt-3 text-sm leading-relaxed">
          Orders older than one year are archived. Please contact our heritage concierge for historical records.
        </p>
      </div>
    </div>
  );
}
