'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import {
  X,
  MapPin,
  CreditCard,
  Package,
  History,
  Truck,
  ShieldCheck,
  Circle,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { type AdminOrder } from '../orders.api';
import {
  formatAddress,
  formatDate,
  formatStatusLabel,
  getCustomerName,
  getOrderKey,
} from '../orders.utils';
import { changeAdminOrderStatus } from '../orders.api';

type Props = {
  order: AdminOrder | null;
  currency: string;
  onClose: () => void;
  onUpdated: () => void;
};

export default function OrderDetailsModal({ order, currency, onClose, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setOpen(!!order);

    if (order) {
      setStatusUpdate(String(order.status || 'pending'));
      setStatusMessage('');
    }
  }, [order]);

  useEffect(() => {
    if (!order) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('keydown', onEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [order, onClose]);

  if (!order || !open || typeof document === 'undefined') return null;

  const orderKey = getOrderKey(order);
  const statusHistory = order.status_history ?? [];
  const lineItems = order.items ?? [];

  const normalizedStatus = String(order.status || 'pending').toLowerCase();

  const statusFlowMap: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],

    confirmed: ['processed', 'cancelled'],

    processed: ['in_transit', 'cancelled'],

    in_transit: ['delivered', 'rto'],

    delivered: ['return'],

    return: ['refund'],

    rto: ['refund'],

    refund: ['refund'],

    cancelled: ['cancelled'],
  };

  const nextStatuses =
    statusFlowMap[normalizedStatus] || [];

  const availableStatuses = [
    normalizedStatus,
    ...nextStatuses.filter((s) => s !== normalizedStatus),
  ];

  const totalAmount = lineItems.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    return sum + quantity * price;
  }, 0);

  const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon size={14} className="text-red-600" />
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
        {title}
      </h4>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 md:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-900 px-2 py-0.5 text-[9px] font-black text-white">
                {order.order_id || order.order_code || 'N/A'}
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                / {formatDate(order.createdAt)}
              </p>
            </div>
            <h3 className="mt-1 text-2xl font-black italic tracking-tighter text-slate-900 uppercase md:text-3xl">
              {getCustomerName(order)}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <X size={20} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <SectionTitle icon={Truck} title="Fulfillment Control" />
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    {availableStatuses.map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={s === normalizedStatus}
                      >
                        {s === normalizedStatus
                          ? `${formatStatusLabel(s)}`
                          : formatStatusLabel(s)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={async () => {
                      if (!orderKey) return;

                      setStatusBusy(true);
                      try {
                        await changeAdminOrderStatus(orderKey, statusUpdate);
                        setStatusMessage('Update Successful');
                        onUpdated();
                      } catch {
                        setStatusMessage('Update Failed');
                      } finally {
                        setStatusBusy(false);
                      }
                    }}
                    disabled={statusBusy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-600 disabled:opacity-50"
                  >
                    {statusBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </div>

                {statusMessage && (
                  <p className="mt-3 text-center text-[9px] font-black uppercase tracking-widest text-red-600">
                    {statusMessage}
                  </p>
                )}
              </div>

              <div>
                <SectionTitle icon={Package} title="Line Items" />
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-4 rounded-xl border border-slate-50 bg-white p-4 shadow-sm transition-hover hover:border-slate-200 sm:grid-cols-[72px_1fr_auto]"
                    >
                      <div className="h-20 w-full overflow-hidden rounded-2xl bg-slate-50 sm:h-20 sm:w-20">
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name || `Product ${item.product_id}`}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black uppercase tracking-tight text-slate-900">
                          {item.product_name || `Product ${item.product_id}`}
                        </p>
                        {(item.size || item.color) ? (
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                            {item.size ? `Variant: ${item.size}` : ''}
                            {item.size && item.color ? ' • ' : ''}
                            {item.color ? `Color: ${item.color}` : ''}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Quantity: {Number(item.quantity || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          {currency}{Number(item.price).toFixed(2)}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                          Total: {currency}{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionTitle icon={History} title="Activity Logs" />
                <div className="relative ml-2 space-y-6 border-l-2 border-slate-100 pl-6">
                  {statusHistory.length === 0 ? (
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      No activity recorded
                    </p>
                  ) : (
                    statusHistory.map((entry, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-slate-100">
                          <Circle
                            size={8}
                            className={idx === 0 ? 'fill-red-600 text-red-600' : 'fill-slate-300 text-slate-300'}
                          />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                          {formatStatusLabel(entry.status)}
                        </p>
                        <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                          {String(entry.timestamp)}
                        </p>
                        {(entry.activity || entry.location) && (
                          <div className="mt-2 rounded-lg bg-slate-50 p-2 text-[9px] font-medium text-slate-600">
                            {entry.activity && <span>By: {entry.activity}</span>}
                            {entry.location && (
                              <span className="mt-1 block italic opacity-70">
                                Note: {entry.location}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:sticky space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 p-6">
                <SectionTitle icon={MapPin} title="Shipping Registry" />
                <p className="text-xs font-bold leading-relaxed text-slate-600">
                  {formatAddress(order)}
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-400">
                  <Truck size={12} />
                  TYPE: {String(order.address?.addressType || order.addressType || 'RESIDENTIAL')}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 p-6">
                <SectionTitle icon={CreditCard} title="Fiscal Registry" />
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Method
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-900">
                      {order.payment_method || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Payment Status
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-500'
                        }`}
                    >
                      {order.payment_status || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Transaction ID
                    </span>
                    <span className="max-w-[120px] truncate text-[10px] font-black uppercase text-slate-900">
                      {order.razorpay_payment_id || '---'}
                    </span>
                  </div>
                  {order.refund_request_type ? (
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Refund Type
                      </span>
                      <span className="text-[10px] font-black uppercase text-slate-900">
                        {order.refund_request_type}
                      </span>
                    </div>
                  ) : null}
                  {order.refund_reason ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Refund Reason
                      </span>
                      <span className="max-w-[180px] text-right text-[10px] font-black text-slate-900">
                        {order.refund_reason}
                      </span>
                    </div>
                  ) : null}
                  {order.refund_upi_id ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Refund UPI
                      </span>
                      <span className="max-w-[180px] text-right text-[10px] font-black text-slate-900">
                        {order.refund_upi_id}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
                <div className="flex items-center gap-2 text-red-500">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Verified Secure
                  </span>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Total Order Value
                    </p>
                    <p className="text-3xl font-black italic tracking-tighter">
                      {currency}
                      {Number(totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <Package size={32} className="opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              System Instance: 04-AA-X // Logistics Cloud
            </p>
            <button
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-widest text-slate-900 transition-colors hover:text-red-600"
            >
              Exit Manifest
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
