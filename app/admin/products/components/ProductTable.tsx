'use client';

import React from 'react';
import { Edit3, Trash2, Box, Tag, Layers, ChevronRight } from 'lucide-react';
import {
  ProductItem,
  formatCurrency,
  stripHtmlToPlainText,
} from '../utils/admin-products.utils';

type Props = {
  products: ProductItem[];
  loading: boolean;
  currency: string;
  onEdit: (product: ProductItem) => void;
  onDelete: (productId: number) => void;
};

function getProductThumb(product: ProductItem): string {
  const fromProductImages = Array.isArray(product.product_image) ? product.product_image[0] : '';
  if (fromProductImages) return fromProductImages;

  const firstVariantImage =
    Array.isArray(product.variants) && product.variants.length > 0
      ? String(product.variants[0]?.image || '')
      : '';

  return firstVariantImage;
}

function truncateDescription(text: string, wordLimit = 7) {
  const plainText = stripHtmlToPlainText(text || '');
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  if (words.length <= wordLimit) return plainText;
  return `${words.slice(0, wordLimit).join(' ')}...`;
}

export default function ProductTable({
  products,
  loading,
  currency,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-16 shadow-sm">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          Syncing Inventory...
        </p>
      </div>
    );
  }

  return (
    <section className="mt-8 space-y-4">
      <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 lg:grid lg:grid-cols-12">
        <div className="col-span-5">Product Details</div>
        <div className="col-span-2 text-center">Metrics</div>
        <div className="col-span-2 text-center">Value</div>
        <div className="col-span-3 text-right">Operational Actions</div>
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
            No Records Found in Database
          </div>
        ) : (
          products.map((product) => {
            const categoryName =
              typeof product.catagory_id === 'object'
                ? product.catagory_id?.name || 'Uncategorized'
                : 'General';

            const thumb = getProductThumb(product);
            const status = String(product.status || 'draft').toLowerCase();
            const isPublished = status === 'published';
            const stockCount = Number(product.quantity || 0);
            const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;

            return (
              <article
                key={product.product_id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:p-5"
              >
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-slate-200/40 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex flex-col gap-5 lg:grid lg:grid-cols-12 lg:items-center">
                  <div className="flex items-start gap-4 lg:col-span-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <Box className="text-slate-400" size={24} />
                        </div>
                      )}

                      <div
                        className={`absolute bottom-0 left-0 right-0 py-1 text-center text-[8px] font-black uppercase tracking-[0.2em] ${
                          isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                        }`}
                      >
                        {status}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-slate-700">
                        {product.name}
                      </h3>

                      <p className="text-[11px] leading-relaxed text-slate-500">
                        {truncateDescription(product.description || '', 7)}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          <Tag size={10} className="text-slate-500" /> {categoryName}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          SKU: {product.sku || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:flex lg:flex-col lg:items-center lg:gap-2">
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 lg:w-full lg:justify-center">
                      <Layers size={14} className="text-slate-500" />
                      <div className="text-left lg:text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 lg:hidden">
                          Stock
                        </p>
                        <p className="text-sm font-black text-slate-900">{stockCount}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 lg:w-full lg:justify-center">
                      <Box size={14} className="text-slate-500" />
                      <div className="text-left lg:text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 lg:hidden">
                          Variants
                        </p>
                        <p className="text-xs font-bold text-slate-600">{variantCount} Types</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center lg:col-span-2">
                    <div className="inline-block rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-200 lg:ring-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 lg:mb-1">
                        Net Price
                      </p>
                      <p className="text-xl font-black tracking-tight text-slate-900">
                        {currency}
                        {formatCurrency(product.selling_price ?? product.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 lg:col-span-3">
                    <button
                      onClick={() => onEdit(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-800 lg:flex-none lg:px-5"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onDelete(product.product_id)}
                      className="flex items-center justify-center rounded-2xl bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="hidden text-slate-300 lg:block">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
