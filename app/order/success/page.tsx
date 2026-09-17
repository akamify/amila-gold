'use client';
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackMetaPixelOnce } from '@/app/lib/metaPixel';

const PENDING_PURCHASE_STORAGE_KEY = 'meta:pending-purchase';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const oid = searchParams.get('order_id');
    setOrderId(oid);
  }, [searchParams]);

  useEffect(() => {
    const oid = searchParams.get('order_id') || '';
    try {
      const raw = window.sessionStorage.getItem(PENDING_PURCHASE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        eventID?: string;
        orderRef?: string;
        payload?: Record<string, unknown>;
      };
      const eventID = String(parsed.eventID || parsed.orderRef || oid || '');
      const payload = parsed.payload && typeof parsed.payload === 'object' ? parsed.payload : null;
      if (!eventID || !payload) return;
      const payloadOrderId = String(payload.order_id || parsed.orderRef || '');
      if (oid && payloadOrderId && payloadOrderId !== oid) return;

      trackMetaPixelOnce(
        `meta:purchase-success:${eventID}`,
        'Purchase',
        payload as Parameters<typeof trackMetaPixelOnce>[2],
        'track',
        { eventID },
      );
      window.sessionStorage.removeItem(PENDING_PURCHASE_STORAGE_KEY);
    } catch {
      window.sessionStorage.removeItem(PENDING_PURCHASE_STORAGE_KEY);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-surface">
      <div className="w-full max-w-md text-center">
        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <SymbolIcon name={"check_circle"} className="text-5xl text-secondary" />
        </div>
        
        <h1 className="font-headline text-4xl font-bold italic text-primary mb-4">
          Order Confirmed!
        </h1>
        
        <p className="text-on-surface-variant mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {orderId && (
          <div className="bg-surface-container-low rounded-xl p-4 mb-8">
            <p className="text-sm text-on-surface-variant">Order ID</p>
            <p className="font-headline text-xl font-bold text-primary">#{orderId}</p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/user/orders"
            className="block w-full bg-primary text-on-primary py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-all"
          >
            View My Orders
          </Link>
          
          <Link
            href="/shop"
            className="block w-full border-2 border-primary text-primary py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary/5 transition-all"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-8 text-xs text-on-surface-variant">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-surface">
          <p className="text-on-surface-variant text-sm">Loading...</p>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
