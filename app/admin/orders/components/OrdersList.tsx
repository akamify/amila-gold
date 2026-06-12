'use client';

import React, { useState } from 'react';
import ResilientProductImage from '@/app/components/ResilientProductImage';
import {
  Box,
  ChevronRight,
  ExternalLink,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  User,
  ShoppingBag
} from 'lucide-react';
import {
  type AdminOrder,
  formatDate,
  formatStatusLabel,
  getCustomerName,
  getOrderKey,
  getOrderTotal,
  normalizeStatus,
} from '../orders.utils';

type Props = {
  orders: AdminOrder[];
  currency: string;
  onOpen: (order: AdminOrder) => void;
};

export default function OrdersList({ orders, currency, onOpen }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  function truncateCustomer(order: AdminOrder) {
    const email = String(order.user_email || '').trim();
    return email || 'Guest User';
  }

  if (orders.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-24">
        <div className="rounded-full bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <Box className="text-slate-300" size={40} />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">No orders found yet</p>
        <p className="text-xs text-slate-400">Your new orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Header for Desktop - Optional but improves clarity */}
      <div className="hidden lg:grid lg:grid-cols-12 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <div className="col-span-4">Customer & Order ID</div>
        <div className="col-span-3">Product Details</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-3 text-right">Total Amount</div>
      </div>

      <div className="grid gap-4">
        {currentOrders.map((order) => {
          const orderKey = getOrderKey(order) || `${order.user_email}-${order.createdAt}`;
          const status = normalizeStatus(order.status || 'pending');
          const total = getOrderTotal(order);
          const firstItem = order.items?.[0];
          const itemCount = order.items.length;

          const isCompleted = ['completed', 'delivered', 'confirmed'].includes(status);
          const isPending = ['pending', 'processing'].includes(status);

          return (
            <article
              key={orderKey}
              onClick={() => onOpen(order)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-100/40"
            >
              <div className="flex flex-col cursor-pointer gap-6 p-5 lg:grid lg:grid-cols-12 lg:items-center lg:p-6">

                {/* Column 1: Identity */}
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-tight text-indigo-600 uppercase">
                        #{order.order_id || order.order_code || 'N/A'}
                      </p>
                      <h3 className="text-base font-bold text-slate-900">
                        {getCustomerName(order)}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(order.createdAt)}</span>
                        <span className="flex items-center gap-1"><CreditCard size={12} /> {order.payment_method}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Product Preview */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-2 ring-1 ring-slate-100 transition-colors group-hover:bg-white">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white bg-white shadow-sm">
                      <ResilientProductImage
                        sources={firstItem?.product_images || [firstItem?.product_image]}
                        alt={firstItem?.product_name || 'Product'}
                        fallbackClassName="bg-slate-50 text-slate-400"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{firstItem?.product_name || 'Generic Item'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {itemCount > 1 ? `+${itemCount - 1} more items` : `Qty: ${firstItem?.quantity || 1}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Status */}
                <div className="lg:col-span-2 flex justify-start lg:justify-center">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${isCompleted ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                      isPending ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                        'bg-rose-50 text-rose-700 ring-rose-200'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    {formatStatusLabel(status)}
                  </div>
                </div>

                {/* Column 4: Total & Action */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 lg:col-span-3 lg:justify-end lg:border-none lg:pt-0 gap-5">
                  <div className="lg:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Price</p>
                    <p className="text-xl font-black text-slate-900">
                      {currency}{total.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onOpen(order); }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-600 active:scale-95"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* Decorative trace bar */}
              <div className="bg-slate-50 px-6 py-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  <ShoppingBag size={10} /> {truncateCustomer(order)}
                </span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            Page <span className="text-slate-900 font-bold">{currentPage}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex gap-1 mx-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-9 min-w-[36px] px-2 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
