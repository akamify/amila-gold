import type { AdminOrder } from '@/app/lib/apiClient';

export type { AdminOrder };

export type OrderTab = 'all' | 'active' | 'resolved';
export type OrderSortKey = 'time-desc' | 'time-asc' | 'price-desc' | 'price-asc';

export const activeStatuses = new Set([
  'pending',
  'processing',
  'verified',
  'in transit',
  'in_transit',
  'shipped',
]);

export const resolvedStatuses = new Set([
  'delivered',
  'cancelled',
  'returned',
  'refunded',
]);

export const normalizeStatus = (status: string) => status.trim().toLowerCase();

export const isResolvedStatus = (status: string) => {
  const normalized = normalizeStatus(status).replace(/_/g, ' ');
  if (!normalized) return false;
  if (resolvedStatuses.has(normalized)) return true;
  return ['deliver', 'cancel', 'return', 'refund', 'rto', 'reject'].some((token) =>
    normalized.includes(token)
  );
};

export const isActiveStatus = (status: string) => {
  const normalized = normalizeStatus(status).replace(/_/g, ' ');
  if (!normalized) return false;
  if (activeStatuses.has(normalized)) return true;
  return !isResolvedStatus(normalized);
};

export const formatStatusLabel = (status: string) => {
  const normalized = status.replace(/_/g, ' ').trim();
  if (!normalized) return 'Pending';
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getOrderKey = (order: AdminOrder) => {
  if (order.order_id) return String(order.order_id);
  if (order.order_code) return order.order_code;
  return order._id || '';
};

export const formatDate = (input?: string) => {
  if (!input) return 'N/A';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const getCustomerName = (order: AdminOrder) => {
  const name = String(order.FullName || '').trim();
  if (name) return name;

  const email = String(order.user_email || '').trim();
  if (!email) return 'Guest user';

  const fromEmail = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();

  return fromEmail || 'Guest user';
};

export const getOrderTotal = (order: AdminOrder) => {
  const explicit = Number(order.amount || 0);
  const itemsTotal = (order.items || []).reduce((sum, item) => {
    const price = Number(item.price || 0);
    const qty = Number(item.quantity || 0);
    return sum + (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 0);
  }, 0);

  if (Number.isFinite(explicit) && explicit > 0) {
    if (itemsTotal > 0 && explicit > itemsTotal * 5) return explicit / 100;
    if (itemsTotal <= 0 && explicit >= 100) return explicit / 100;
    return explicit;
  }

  return itemsTotal;
};

export const getOrderTimestamp = (order: AdminOrder) => {
  const value = order.createdAt ? new Date(order.createdAt).getTime() : 0;
  return Number.isFinite(value) ? value : 0;
};

export const getStatusIcon = (status: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'delivered') return 'check_circle';
  if (normalized === 'cancelled' || normalized === 'returned') return 'cancel';
  if (normalized === 'processing' || normalized === 'verified') return 'inventory_2';
  return 'local_shipping';
};

export const isPaidStatus = (order: AdminOrder) => {
  const payment = normalizeStatus(String(order.payment_status || ''));
  if (payment === 'paid') return true;
  const status = normalizeStatus(String(order.status || ''));
  return ['confirmed', 'processing', 'shipped', 'in transit', 'in_transit', 'delivered'].includes(status);
};

export const isRefundStatus = (order: AdminOrder) => {
  const payment = normalizeStatus(String(order.payment_status || ''));
  if (payment.includes('refund')) return true;
  const status = normalizeStatus(String(order.status || ''));
  return ['cancelled', 'returned', 'refunded', 'rto'].some((token) => status.includes(token));
};

export const formatAddress = (order: AdminOrder) => {
  const primary = [
    order.address?.address,
    order.address?.address_line1,
    order.address_line1,
    order.address?.address_line2,
    order.address_line2,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const region = [
    order.address?.city || order.city,
    order.address?.district || order.district,
    order.address?.state || order.state,
    order.address?.pinCode || order.pinCode,
    order.address?.country || order.country,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  return Array.from(new Set([...primary, ...region])).join(', ') || 'N/A';
};
