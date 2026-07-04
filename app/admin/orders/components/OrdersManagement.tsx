"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import {
  Search,
  RefreshCw,
  DollarSign,
  Activity,
  RotateCcw,
  Clock,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Filter,
  XCircle,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";

import { loadAdminOrders, type AdminOrder } from "../orders.api";
import OrdersList from "./OrdersList";
import OrderDetailsModal from "./OrderDetailsModal";
import {
  type OrderSortKey,
  type OrderTab,
  getOrderTimestamp,
  getOrderTotal,
  isActiveStatus,
  isPaidStatus,
  isRefundStatus,
  isResolvedStatus,
  normalizeStatus,
} from "../orders.utils";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "green" | "red" | "amber" | "blue";
};

const tabOptions: Array<{ id: OrderTab; label: string }> = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "resolved", label: "Resolved" },
];

function money(currency: string, value: number) {
  return `${currency}${Number(value || 0).toFixed(2)}`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: StatCardProps) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50/70 text-emerald-700"
      : tone === "red"
        ? "border-red-200 bg-red-50/70 text-red-700"
        : tone === "amber"
          ? "border-amber-200 bg-amber-50/70 text-amber-700"
          : tone === "blue"
            ? "border-blue-200 bg-blue-50/70 text-blue-700"
            : "border-slate-200 bg-white text-slate-700";

  const iconClass =
    tone === "green"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "red"
        ? "bg-red-100 text-red-700"
        : tone === "amber"
          ? "bg-amber-100 text-amber-700"
          : tone === "blue"
            ? "bg-blue-100 text-blue-700"
            : "bg-slate-100 text-slate-500";

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
            {title}
          </p>
          <p className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 line-clamp-1 text-[11px] font-bold text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function OrdersLoadingState() {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-[12px] border border-slate-100 p-4 md:grid-cols-[1fr_160px_130px]"
          >
            <div className="grid gap-2">
              <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-72 max-w-full animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-9 animate-pulse rounded bg-slate-100" />
            <div className="h-9 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [sortBy, setSortBy] = useState<OrderSortKey>("time-desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);

  const { settings } = useSiteSettings();
  const currency = settings?.currencySymbol || "$";

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError("");

      const rows = await loadAdminOrders();
      setOrders(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load orders.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = normalizeStatus(order.status || "");

        acc.all += 1;

        if (isActiveStatus(status)) acc.active += 1;
        if (isResolvedStatus(status)) acc.resolved += 1;

        return acc;
      },
      { all: 0, active: 0, resolved: 0 },
    );
  }, [orders]);

  const salesStats = useMemo(() => {
    let totalSales = 0;
    let totalProcessing = 0;
    let totalRefund = 0;
    let totalPending = 0;
    let paidCount = 0;
    let refundCount = 0;

    const productAgg = new Map<
      number,
      { name: string; qty: number; revenue: number }
    >();

    orders.forEach((order) => {
      const amount = getOrderTotal(order);
      const paid = isPaidStatus(order);
      const refund = isRefundStatus(order);
      const active = isActiveStatus(normalizeStatus(order.status || ""));
      const payment = normalizeStatus(String(order.payment_status || ""));

      if (paid && !refund) {
        totalSales += amount;
        paidCount += 1;
      }

      if (active) totalProcessing += amount;

      if (refund) {
        totalRefund += amount;
        refundCount += 1;
      }

      if (!paid && !refund && payment === "pending") {
        totalPending += amount;
      }

      (order.items || []).forEach((item) => {
        const productId = Number(item.product_id || 0);

        if (!productId) return;

        const qty = Math.max(0, Number(item.quantity || 0));
        const price = Math.max(0, Number(item.price || 0));
        const name = String(item.product_name || `Product ${productId}`);
        const current = productAgg.get(productId) || {
          name,
          qty: 0,
          revenue: 0,
        };

        current.qty += qty;
        current.revenue += qty * price;
        productAgg.set(productId, current);
      });
    });

    const topProducts = Array.from(productAgg.entries())
      .sort((a, b) => b[1].qty - a[1].qty || b[1].revenue - a[1].revenue)
      .slice(0, 6)
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        qty: data.qty,
        revenue: data.revenue,
      }));

    const avgOrderValue = paidCount > 0 ? totalSales / paidCount : 0;

    return {
      totalSales,
      totalProcessing,
      totalRefund,
      totalPending,
      paidCount,
      refundCount,
      avgOrderValue,
      topProducts,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    const startTs = startDate
      ? new Date(`${startDate}T00:00:00`).getTime()
      : null;
    const endTs = endDate
      ? new Date(`${endDate}T23:59:59.999`).getTime()
      : null;

    return orders.filter((order) => {
      const status = normalizeStatus(order.status || "");
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active"
          ? isActiveStatus(status)
          : isResolvedStatus(status));

      if (!matchesTab) return false;

      if (startTs !== null || endTs !== null) {
        const orderTs = getOrderTimestamp(order);

        if (startTs !== null && orderTs < startTs) return false;
        if (endTs !== null && orderTs > endTs) return false;
      }

      if (!term) return true;

      const key = String(
        order.order_id || order.order_code || order._id || "",
      ).toLowerCase();
      const customer = String(order.FullName || "").toLowerCase();
      const email = String(order.user_email || "").toLowerCase();

      return key.includes(term) || customer.includes(term) || email.includes(term);
    });
  }, [orders, activeTab, query, startDate, endDate]);

  const filteredAndSortedOrders = useMemo(() => {
    const rows = [...filteredOrders];

    if (sortBy === "time-asc") {
      rows.sort((a, b) => getOrderTimestamp(a) - getOrderTimestamp(b));
      return rows;
    }

    if (sortBy === "price-desc") {
      rows.sort((a, b) => getOrderTotal(b) - getOrderTotal(a));
      return rows;
    }

    if (sortBy === "price-asc") {
      rows.sort((a, b) => getOrderTotal(a) - getOrderTotal(b));
      return rows;
    }

    rows.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
    return rows;
  }, [filteredOrders, sortBy]);

  const hasFilters = Boolean(query.trim() || startDate || endDate);
  const resolutionRate =
    counts.all > 0 ? Math.round((counts.resolved / counts.all) * 100) : 0;

  const clearFilters = () => {
    setQuery("");
    setStartDate("");
    setEndDate("");
    setSortBy("time-desc");
  };

  return (
    <div className="grid gap-6 pb-12">
      <header className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-600">
                Logistics Hub
              </p>
            </div>

            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-slate-950 md:text-5xl">
              Order <span className="text-red-600">Management</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Track revenue, active processing, refunds and customer orders from
              one clean admin workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-[12px] border border-slate-200 bg-slate-100 p-1">
              {tabOptions.map((tab) => {
                const count = counts[tab.id];

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition ${
                      activeTab === tab.id
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        activeTab === tab.id
                          ? "bg-slate-100 text-slate-700"
                          : "bg-white/70 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                strokeWidth={2.6}
                className={isLoading ? "animate-spin" : ""}
              />
              Sync
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={money(currency, salesStats.totalSales)}
          subtitle={`${salesStats.paidCount} completed transactions`}
          icon={<DollarSign size={20} />}
          tone="red"
        />

        <StatCard
          title="Active Processing"
          value={money(currency, salesStats.totalProcessing)}
          subtitle={`${counts.active} shipments in transit`}
          icon={<Activity size={20} />}
          tone="blue"
        />

        <StatCard
          title="Total Refunds"
          value={money(currency, salesStats.totalRefund)}
          subtitle={`${salesStats.refundCount} reversed orders`}
          icon={<RotateCcw size={20} />}
          tone="amber"
        />

        <StatCard
          title="Pending Settlement"
          value={money(currency, salesStats.totalPending)}
          subtitle="Awaiting payment confirmation"
          icon={<Clock size={20} />}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4">
          <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Avg. Order Value
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-emerald-50 text-emerald-600">
                <TrendingUp size={17} />
              </span>

              <p className="text-xl font-black tracking-[-0.03em] text-slate-950">
                {money(currency, salesStats.avgOrderValue)}
              </p>
            </div>
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Resolution Rate
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue-50 text-blue-600">
                <CheckCircle2 size={17} />
              </span>

              <p className="text-xl font-black tracking-[-0.03em] text-slate-950">
                {resolutionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm lg:col-span-8">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto]">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order ID, customer or email..."
                className="h-11 w-full rounded-[12px] border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2 xl:flex">
              <label className="relative block">
                <Calendar
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-11 w-full rounded-[12px] border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-black text-slate-600 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5 xl:w-[145px]"
                />
              </label>

              <label className="relative block">
                <Calendar
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-11 w-full rounded-[12px] border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-black text-slate-600 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5 xl:w-[145px]"
                />
              </label>

              <label className="relative block sm:col-span-2 xl:col-span-1">
                <Filter
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as OrderSortKey)
                  }
                  className="h-11 w-full appearance-none rounded-[12px] border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-black text-slate-600 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-950/5 xl:w-[170px]"
                >
                  <option value="time-desc">Newest first</option>
                  <option value="time-asc">Oldest first</option>
                  <option value="price-desc">Price high-low</option>
                  <option value="price-asc">Price low-high</option>
                </select>
              </label>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                >
                  <XCircle size={15} />
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
            <SlidersHorizontal size={14} />
            <span>
              Showing {filteredAndSortedOrders.length} of {orders.length} orders
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-[-0.02em] text-slate-950">
              <Package size={19} className="text-red-600" />
              Top Performing Products
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Product ranking by sold quantity and revenue.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">
            <ShoppingBag size={13} />
            {salesStats.topProducts.length} products
          </span>
        </div>

        {salesStats.topProducts.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm font-black text-slate-500">
              No product data available
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Product performance will appear after order items are available.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {salesStats.topProducts.map((prod, index) => (
              <div
                key={prod.productId}
                className="group flex items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white text-sm font-black text-slate-500 shadow-sm transition group-hover:bg-red-50 group-hover:text-red-600">
                  #{index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">
                    {prod.name}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    <span>ID: {prod.productId}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Qty: {prod.qty}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="whitespace-nowrap text-sm font-black text-emerald-600">
                    {money(currency, prod.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        {error ? (
          <div className="flex flex-col gap-3 rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-white px-4 text-xs font-black uppercase tracking-[0.1em] text-rose-700 shadow-sm transition hover:bg-rose-100 active:scale-[0.98]"
            >
              Retry Connection
            </button>
          </div>
        ) : null}

        {isLoading && !error ? (
          <OrdersLoadingState />
        ) : null}

        {!isLoading && !error ? (
          <OrdersList
            orders={filteredAndSortedOrders}
            currency={currency}
            onOpen={(order) => setActiveOrder(order)}
          />
        ) : null}
      </section>

      <OrderDetailsModal
        order={activeOrder}
        currency={currency}
        onClose={() => setActiveOrder(null)}
        onUpdated={loadOrders}
      />
    </div>
  );
}