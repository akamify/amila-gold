"use client";

import {
  Edit3,
  Trash2,
  Box,
  Tag,
  Layers,
  PackageCheck,
  IndianRupee,
  AlertCircle,
  SearchX,
} from "lucide-react";
import ResilientProductImage from "@/app/components/ResilientProductImage";
import {
  ProductItem,
  formatCurrency,
  getAdminProductImageSources,
  stripHtmlToPlainText,
} from "../utils/admin-products.utils";

type Props = {
  products: ProductItem[];
  loading: boolean;
  currency: string;
  onEdit: (product: ProductItem) => void;
  onDelete: (productId: number) => void;
};

function truncateDescription(text: string, wordLimit = 8) {
  const plainText = stripHtmlToPlainText(text || "");
  const words = plainText.trim().split(/\s+/).filter(Boolean);

  if (words.length <= wordLimit) return plainText;

  return `${words.slice(0, wordLimit).join(" ")}...`;
}

function getCategoryName(product: ProductItem) {
  if (typeof product.catagory_id === "object") {
    return product.catagory_id?.name || "Uncategorized";
  }

  return "General";
}

function getStatusClass(status: string) {
  if (status === "published") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      image: "bg-emerald-600 text-white",
    };
  }

  if (status === "archived" || status === "inactive") {
    return {
      badge: "border-slate-200 bg-slate-50 text-slate-500",
      dot: "bg-slate-400",
      image: "bg-slate-700 text-white",
    };
  }

  return {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    image: "bg-amber-500 text-black",
  };
}

function ProductTableSkeleton() {
  return (
    <section className="mt-6 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid gap-4 p-4 lg:grid-cols-12 lg:items-center">
            <div className="flex gap-3 lg:col-span-5">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-[10px] bg-slate-100" />

              <div className="grid flex-1 gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="hidden h-9 animate-pulse rounded bg-slate-100 lg:col-span-2 lg:block" />
            <div className="hidden h-9 animate-pulse rounded bg-slate-100 lg:col-span-2 lg:block" />
            <div className="hidden h-9 animate-pulse rounded bg-slate-100 lg:col-span-3 lg:block" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductTable({
  products,
  loading,
  currency,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return <ProductTableSkeleton />;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 lg:grid lg:grid-cols-12 lg:items-center">
        <div className="col-span-5">Product</div>
        <div className="col-span-2 text-center">Inventory</div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>

      {products.length === 0 ? (
        <div className="grid place-items-center px-5 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <SearchX size={26} strokeWidth={2.4} />
          </div>

          <p className="mt-4 text-sm font-black text-slate-700">
            No products found
          </p>

          <p className="mt-1 max-w-sm text-xs font-medium leading-5 text-slate-400">
            Product records will appear here after inventory is created or after
            changing current filters.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((product) => {
            const categoryName = getCategoryName(product);
            const imageSources = getAdminProductImageSources(product);
            const status = String(product.status || "draft").toLowerCase();
            const isPublished = status === "published";
            const statusStyle = getStatusClass(status);
            const stockCount = Number(product.quantity || 0);
            const variantCount = Array.isArray(product.variants)
              ? product.variants.length
              : 0;
            const price = product.selling_price ?? product.price;
            const isLowStock = stockCount <= 5;

            return (
              <article
                key={product.product_id}
                className="group bg-white px-4 py-4 transition hover:bg-slate-50/70"
              >
                <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
                  <div className="flex min-w-0 gap-3 lg:col-span-5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-100">
                      {imageSources.length ? (
                        <ResilientProductImage
                          sources={imageSources}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          fallbackClassName="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400"
                          compact
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <Box className="text-slate-400" size={22} />
                        </div>
                      )}

                      <div
                        className={`absolute bottom-0 left-0 right-0 z-10 py-0.5 text-center text-[7px] font-black uppercase tracking-[0.16em] ${statusStyle.image}`}
                      >
                        {status}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="min-w-0 truncate text-sm font-black tracking-[-0.02em] text-slate-950">
                          {product.name || "Untitled Product"}
                        </h3>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${statusStyle.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {isPublished ? "Live" : status}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs font-medium leading-5 text-slate-500">
                        {truncateDescription(product.description || "", 8) ||
                          "No description added"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                          <Tag size={11} strokeWidth={2.6} />
                          {categoryName}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                          SKU: {product.sku || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:col-span-2 lg:grid-cols-1">
                    <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3 py-2 lg:justify-center lg:gap-2">
                      <div className="flex items-center gap-2">
                        <Layers size={15} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 lg:hidden">
                          Stock
                        </span>
                      </div>

                      <span
                        className={`text-sm font-black ${
                          isLowStock ? "text-amber-700" : "text-slate-950"
                        }`}
                      >
                        {stockCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3 py-2 lg:justify-center lg:gap-2">
                      <div className="flex items-center gap-2">
                        <PackageCheck size={15} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 lg:hidden">
                          Variants
                        </span>
                      </div>

                      <span className="text-xs font-black text-slate-700">
                        {variantCount}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-2 lg:text-center">
                    <div className="inline-flex w-full items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 lg:w-auto lg:min-w-[140px] lg:justify-center lg:px-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 lg:hidden">
                        <IndianRupee size={13} />
                        Price
                      </span>

                      <span className="text-base font-black tracking-[-0.02em] text-slate-950">
                        {currency}
                        {formatCurrency(price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-3">
                    {isLowStock ? (
                      <span className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-amber-700 lg:mr-0">
                        <AlertCircle size={12} strokeWidth={2.8} />
                        Low Stock
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[9px] bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800 active:scale-[0.98] sm:flex-none"
                    >
                      <Edit3 size={14} strokeWidth={2.6} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(product.product_id)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[9px] border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-[0.98]"
                    >
                      <Trash2 size={14} strokeWidth={2.6} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}