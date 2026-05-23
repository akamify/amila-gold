'use client';

import React from 'react';
import { Search, Plus, Database, CheckCircle, FileText, LayoutGrid } from 'lucide-react';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onNewProduct: () => void;
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
};

function SummaryCard({
  label,
  value,
  icon,
  colorClass = 'text-slate-900 dark:text-white',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f1115] p-6 transition-all hover:border-red-600/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</p>
          <p className={`mt-2 text-4xl font-black tracking-tighter ${colorClass}`}>{value}</p>
        </div>
        <div className="rounded-xl bg-slate-100 dark:bg-white/5 p-3 text-slate-500 dark:text-slate-400 group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors">
          {icon}
        </div>
      </div>
      {/* Decorative accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all group-hover:w-full" />
    </div>
  );
}

export default function ProductHeader({
  search,
  onSearchChange,
  onNewProduct,
  totalProducts,
  publishedProducts,
  draftProducts,
}: Props) {
  return (
    <header className="space-y-8">
      {/* Top Section: Title and Search */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-red-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
              Inventory Protocol
            </p>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase md:text-7xl">
            Stock <span className="text-red-600">Control</span>
          </h1>
          <p className="max-w-xl text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Systemized management and deployment of global inventory assets.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          {/* Slick Search Bar */}
          <div className="relative flex-1 lg:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH CATALOGUE..."
              className="w-full rounded-xl border border-slate-300 dark:border-white/5 bg-white dark:bg-[#0f1115] py-4 pl-12 pr-4 text-[10px] font-black tracking-widest text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20"
            />
          </div>

          {/* New Product Button */}
          <button
            onClick={onNewProduct}
            className="flex items-center justify-center gap-3 rounded-xl bg-red-600 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-1 hover:bg-red-500 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard 
          label="Database Total" 
          value={String(totalProducts)} 
          icon={<Database size={20} />} 
        />
        <SummaryCard 
          label="Active Release" 
          value={String(publishedProducts)} 
          colorClass="text-emerald-500" 
          icon={<CheckCircle size={20} />} 
        />
        <SummaryCard 
          label="Pending Drafts" 
          value={String(draftProducts)} 
          colorClass="text-amber-500" 
          icon={<FileText size={20} />} 
        />
      </div>

      {/* Subtle Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent" />
    </header>
  );
}
