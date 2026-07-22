'use client';
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderFailedContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorMsg = searchParams.get('error');
    setError(errorMsg || 'Your payment could not be processed.');
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-surface">
      <div className="w-full max-w-md text-center">
        <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <SymbolIcon name={"error"} className="text-5xl text-error" />
        </div>
        
        <h1 className="font-headline text-4xl font-bold italic text-primary mb-4">
          Payment Failed
        </h1>
        
        <p className="text-on-surface-variant mb-6">
          {error}
        </p>

        <div className="bg-error/5 border border-error/20 rounded-xl p-4 mb-8">
          <p className="text-sm text-error">
            No money was deducted from your account. You can try again.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/cart"
            className="block w-full bg-primary text-on-primary py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-all"
          >
            Try Again
          </Link>
          
          <Link
            href="/shop"
            className="block w-full border-2 border-primary text-primary py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary/5 transition-all"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-8 text-xs text-on-surface-variant">
          Need help? Contact our support team.
        </p>
      </div>
    </main>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-surface">
          <p className="text-on-surface-variant text-sm">Loading...</p>
        </main>
      }
    >
      <OrderFailedContent />
    </Suspense>
  );
}
