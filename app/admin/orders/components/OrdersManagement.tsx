'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';
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
  Filter
} from 'lucide-react';

import { loadAdminOrders, type AdminOrder } from '../orders.api';
import OrdersList from './OrdersList';
import OrderDetailsModal from './OrderDetailsModal';
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
} from '../orders.utils';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [sortBy, setSortBy] = useState<OrderSortKey>('time-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  
  const { settings } = useSiteSettings();
  const currency = settings?.currencySymbol || '$';

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const rows = await loadAdminOrders();
      setOrders(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load orders.');
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
        const status = normalizeStatus(order.status || '');
        acc.all += 1;
        if (isActiveStatus(status)) acc.active += 1;
        if (isResolvedStatus(status)) acc.resolved += 1;
        return acc;
      },
      { all: 0, active: 0, resolved: 0 }
    );
  }, [orders]);

  const salesStats = useMemo(() => {
    let totalSales = 0;
    let totalProcessing = 0;
    let totalRefund = 0;
    let totalPending = 0;
    let paidCount = 0;
    let refundCount = 0;

    const productAgg = new Map<number, { name: string; qty: number; revenue: number }>();

    orders.forEach((order) => {
      const amount = getOrderTotal(order);
      const paid = isPaidStatus(order);
      const refund = isRefundStatus(order);
      const active = isActiveStatus(normalizeStatus(order.status || ''));
      const payment = normalizeStatus(String(order.payment_status || ''));

      if (paid && !refund) {
        totalSales += amount;
        paidCount += 1;
      }
      if (active) totalProcessing += amount;
      if (refund) {
        totalRefund += amount;
        refundCount += 1;
      }
      if (!paid && !refund && payment === 'pending') {
        totalPending += amount;
      }

      (order.items || []).forEach((item) => {
        const productId = Number(item.product_id || 0);
        if (!productId) return;
        const qty = Math.max(0, Number(item.quantity || 0));
        const price = Math.max(0, Number(item.price || 0));
        const name = String(item.product_name || `Product ${productId}`);
        const current = productAgg.get(productId) || { name, qty: 0, revenue: 0 };
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
    const startTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTs = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;

    return orders.filter((order) => {
      const status = normalizeStatus(order.status || '');
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' ? isActiveStatus(status) : isResolvedStatus(status));

      if (!matchesTab) return false;

      if (startTs !== null || endTs !== null) {
        const orderTs = getOrderTimestamp(order);
        if (startTs !== null && orderTs < startTs) return false;
        if (endTs !== null && orderTs > endTs) return false;
      }

      if (!term) return true;

      const key = String(order.order_id || order.order_code || order._id || '').toLowerCase();
      const customer = String(order.FullName || '').toLowerCase();
      const email = String(order.user_email || '').toLowerCase();
      return key.includes(term) || customer.includes(term) || email.includes(term);
    });
  }, [orders, activeTab, query, startDate, endDate]);

  const filteredAndSortedOrders = useMemo(() => {
    const rows = [...filteredOrders];

    if (sortBy === 'time-asc') {
      rows.sort((a, b) => getOrderTimestamp(a) - getOrderTimestamp(b));
      return rows;
    }
    if (sortBy === 'price-desc') {
      rows.sort((a, b) => getOrderTotal(b) - getOrderTotal(a));
      return rows;
    }
    if (sortBy === 'price-asc') {
      rows.sort((a, b) => getOrderTotal(a) - getOrderTotal(b));
      return rows;
    }

    rows.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
    return rows;
  }, [filteredOrders, sortBy]);

  // Reusable Stat Card Component
  const StatCard = ({ title, value, subtitle, icon, highlight = false }: any) => (
    <div className={`relative overflow-hidden rounded-2xl border ${highlight ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-white'} p-6 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className={`mt-2 text-3xl font-black tracking-tighter ${highlight ? 'text-red-600' : 'text-slate-900'}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${highlight ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {subtitle}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-20 py-5">
      
      {/* Header Section */}
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-red-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
              Logistics Hub
            </p>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase md:text-6xl">
            Order <span className="text-red-600">Management</span>
          </h1>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Segmented Control Tabs */}
          <div className="flex inline-flex rounded-xl bg-slate-100 p-1">
            {[
              { id: 'all', label: 'All Orders', count: counts.all },
              { id: 'active', label: 'Active', count: counts.active },
              { id: 'resolved', label: 'Resolved', count: counts.resolved },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OrderTab)}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] ${activeTab === tab.id ? 'bg-slate-100' : 'bg-slate-200/50'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={loadOrders}
            disabled={isLoading}
            className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            Sync
          </button>
        </div>
      </header>

      {/* Primary Financial Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`${currency}${salesStats.totalSales.toFixed(2)}`}
          subtitle={`${salesStats.paidCount} Completed Transactions`}
          icon={<DollarSign size={20} />}
          highlight={true}
        />
        <StatCard 
          title="Active Processing" 
          value={`${currency}${salesStats.totalProcessing.toFixed(2)}`}
          subtitle={`${counts.active} Shipments in transit`}
          icon={<Activity size={20} />}
        />
        <StatCard 
          title="Total Refunds" 
          value={`${currency}${salesStats.totalRefund.toFixed(2)}`}
          subtitle={`${salesStats.refundCount} Reversed Orders`}
          icon={<RotateCcw size={20} />}
        />
        <StatCard 
          title="Pending Settlement" 
          value={`${currency}${salesStats.totalPending.toFixed(2)}`}
          subtitle="Awaiting Payment Confirmation"
          icon={<Clock size={20} />}
        />
      </div>

      {/* Secondary Stats & Filters Row */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Secondary Stats */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Avg. Order Value</p>
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <p className="text-xl font-black text-slate-900">{currency}{salesStats.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resolution Rate</p>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-500" />
              <p className="text-xl font-black text-slate-900">
                {counts.all > 0 ? Math.round((counts.resolved / counts.all) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

          <div className="relative flex items-center col-span-6 rounded-xl border border-slate-100 bg-white p-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH ID / CUSTOMER / EMAIL..."
              className="w-full rounded-xl bg-slate-50 py-4 pl-12 pr-4 text-[10px] font-black tracking-widest text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
        {/* Right: Search & Filters */}
        <div className="lg:col-span-8 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-2 sm:flex-row">
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-full w-full rounded-xl bg-slate-50 pl-9 pr-3 text-[10px] font-black tracking-widest text-slate-600 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-slate-100 min-w-[130px]"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-full w-full rounded-xl bg-slate-50 pl-9 pr-3 text-[10px] font-black tracking-widest text-slate-600 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-slate-100 min-w-[130px]"
              />
            </div>
            <div className="relative hidden md:block">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as OrderSortKey)}
                className="h-full w-full appearance-none rounded-xl bg-slate-50 pl-9 pr-8 text-[10px] font-black tracking-widest text-slate-600 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-slate-100 cursor-pointer"
              >
                <option value="time-desc">NEWEST FIRST</option>
                <option value="time-asc">OLDEST FIRST</option>
                <option value="price-desc">PRICE: HIGH-LOW</option>
                <option value="price-asc">PRICE: LOW-HIGH</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase flex items-center gap-2">
            <Package className="text-red-600" /> Top Performing Assets
          </h3>
        </div>
        
        {salesStats.topProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            No Product Data Available
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salesStats.topProducts.map((prod, index) => (
              <div key={prod.productId} className="group relative flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-slate-400 shadow-sm group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{prod.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>ID: {prod.productId}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Qty: {prod.qty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">
                    {currency}{prod.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* States & List */}
      <div className="space-y-4">
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
            <button
              onClick={loadOrders}
              className="rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 shadow-sm hover:bg-rose-100 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {isLoading && !error && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white py-20 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Syncing Orders...
            </span>
          </div>
        )}

        {!isLoading && !error && (
          <OrdersList
            orders={filteredAndSortedOrders}
            currency={currency}
            onOpen={(order) => setActiveOrder(order)}
          />
        )}
      </div>

      {/* Modal Details */}
      <OrderDetailsModal
        order={activeOrder}
        currency={currency}
        onClose={() => setActiveOrder(null)}
        onUpdated={loadOrders}
      />
    </div>
  );
}