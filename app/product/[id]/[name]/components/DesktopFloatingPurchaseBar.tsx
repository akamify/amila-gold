"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  visible: boolean;
  currencySymbol: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number | null;
  qty: number;
  inCart: boolean;
  isOutOfStock: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export default function DesktopFloatingPurchaseBar({
  visible,
  currencySymbol,
  name,
  imageUrl,
  price,
  originalPrice,
  qty,
  inCart,
  isOutOfStock,
  onAddToCart,
  onBuyNow,
}: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 56, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60]"
        >
          <div className="w-[min(860px,calc(100vw-1.5rem))] bg-white/92 backdrop-blur-xl border border-stone-200 shadow-[0_24px_80px_rgba(0,0,0,0.18)] rounded-[1.75rem] sm:rounded-[2rem] px-4 sm:px-5 py-3.5 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name || "Product"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                      data-floating-bar-image
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-headline font-black text-[15px] text-stone-900 truncate max-w-[360px]">
                      {name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="font-headline font-black text-[15px] text-stone-900">
                      {currencySymbol}
                      {Number(price || 0).toFixed(2)}
                    </p>
                    {typeof originalPrice === "number" && originalPrice > price && (
                      <p className="text-[12px] font-bold text-stone-400 line-through">
                        {currencySymbol}
                        {Number(originalPrice || 0).toFixed(2)}
                      </p>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                      Qty {qty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={isOutOfStock}
                  className={`h-12 px-5 sm:px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl flex-1 sm:flex-none flex items-center justify-center gap-2 ${
                    inCart
                      ? "bg-white border border-secondary text-secondary shadow-secondary/15 hover:bg-secondary/5"
                      : "bg-secondary text-on-secondary shadow-secondary/15 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {inCart ? "done_all" : "add_shopping_cart"}
                  </span>
                  {inCart ? "Go to Cart" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={onBuyNow}
                  disabled={isOutOfStock}
                  className="h-12 px-5 sm:px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl bg-primary text-on-primary shadow-primary/15 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
