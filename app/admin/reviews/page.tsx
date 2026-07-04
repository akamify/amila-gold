"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  Mail,
  MessageSquare,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  deleteAdminReview,
  fetchAdminReviews,
  type AdminReview,
} from "@/app/lib/apiClient";
import { createProductHref } from "@/app/data/products";

const formatDateTime = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function getLooseValue(source: unknown, keys: string[]) {
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record?.[key];

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
}

function getRatingColor(rating: number) {
  if (rating >= 4) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (rating >= 3) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

function getCustomerInfo(review: AdminReview) {
  return {
    name: review.user_name || "Anonymous Customer",
    email: getLooseValue(review, ["user_email", "email", "customer_email"]),
    phone: getLooseValue(review, ["user_phone", "phone", "customer_phone"]),
    id: getLooseValue(review, ["user_id", "customer_id", "userId", "customerId"]),
  };
}

function getReviewImages(review: AdminReview) {
  return Array.isArray(review.review_images) ? review.review_images : [];
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {icon}
        {label}
      </span>

      <span className="min-w-0 text-right text-xs font-bold text-slate-700">
        {value || "Not available"}
      </span>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[14px] border border-slate-200 bg-white p-4"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px_190px] lg:items-center">
            <div className="flex gap-3">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="grid flex-1 gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="hidden h-10 animate-pulse rounded bg-slate-100 lg:block" />
            <div className="hidden h-10 animate-pulse rounded bg-slate-100 lg:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: "default" | "blue" | "green" | "red" | "amber";
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : tone === "green"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : tone === "red"
          ? "border-red-200 bg-red-50 text-red-700"
          : tone === "amber"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-white text-slate-700";

  const displayValue =
    typeof value === "number" ? value.toLocaleString("en-IN") : value;

  return (
    <div
      className={`rounded-[14px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {displayValue}
          </p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/70 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminReview | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminReviews();

      setReviews(data.reviews);
      setStats(data.stats);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load reviews.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!viewTarget && !deleteTarget) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (deletingId) return;

      setViewTarget(null);
      setDeleteTarget(null);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewTarget, deleteTarget, deletingId]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reviews;

    return reviews.filter((review) => {
      const productName = review.product?.product_name || "";
      const productCode = review.product?.product_code || "";
      const customer = getCustomerInfo(review);

      return [
        customer.name,
        customer.email,
        customer.phone,
        review.review_text,
        review.review_title,
        productName,
        productCode,
        String(review.product_id || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [reviews, search]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.review_rate || 0),
      0,
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const confirmDeleteReview = async () => {
    if (!deleteTarget || deletingId) return;

    try {
      setDeletingId(deleteTarget.id);
      setMessage("");
      setError("");

      await deleteAdminReview(deleteTarget.id);

      setReviews((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setStats((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
      }));

      setMessage("Review deleted successfully.");
      setDeleteTarget(null);
      setViewTarget((current) =>
        current?.id === deleteTarget.id ? null : current,
      );

      window.setTimeout(() => setMessage(""), 3000);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete review.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const hasSearch = Boolean(search.trim());

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 text-slate-900 md:p-6">
      <header className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-600">
                Management Console
              </p>
            </div>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">
              Reviews Feed
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Monitor customer feedback, view customer details, inspect review
              attachments and manage product-level contribution history.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.1em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              strokeWidth={2.6}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews}
          icon={<MessageSquare size={20} strokeWidth={2.5} />}
          tone="red"
        />

        <StatCard
          label="Unique Users"
          value={stats.totalUsers}
          icon={<Users size={20} strokeWidth={2.5} />}
          tone="blue"
        />

        <StatCard
          label="Reviewed Products"
          value={stats.totalProducts}
          icon={<PackageCheck size={20} strokeWidth={2.5} />}
          tone="green"
        />

        <StatCard
          label="Average Rating"
          value={averageRating}
          icon={<Star size={20} fill="currentColor" />}
          tone="amber"
        />
      </div>

      {(error || message) && (
        <div className="grid gap-3">
          {error ? (
            <div className="flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {message ? (
            <div className="flex items-start gap-3 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          ) : null}
        </div>
      )}

      <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-950">
                Reviews List
              </h3>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-red-700">
                {filteredReviews.length} entries
              </span>
            </div>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Compact list view with customer, product, rating and quick actions.
            </p>
          </div>

          <div className="flex w-full gap-2 md:w-[430px]">
            <label className="relative flex-1">
              <Search
                size={16}
                strokeWidth={2.6}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, product or review..."
                className="h-11 w-full rounded-[12px] border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5"
              />
            </label>

            {hasSearch ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.96]"
                aria-label="Clear search"
              >
                <X size={17} strokeWidth={2.6} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-4 md:p-5">
          {loading ? (
            <ReviewSkeleton />
          ) : filteredReviews.length === 0 ? (
            <div className="grid place-items-center rounded-[14px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                <MessageSquare size={26} strokeWidth={2.4} />
              </div>

              <p className="mt-4 text-sm font-black text-slate-700">
                No matching reviews found
              </p>

              <p className="mt-1 max-w-sm text-xs font-medium leading-5 text-slate-400">
                Try changing the search keyword or refresh the reviews feed.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredReviews.map((review) => {
                const images = getReviewImages(review);
                const rating = Number(review.review_rate || 0);
                const productName =
                  review.product?.product_name ||
                  `Product ID: ${review.product_id}`;
                const productCode =
                  review.product?.product_code || `PID-${review.product_id}`;
                const customer = getCustomerInfo(review);
                const totalUserReviews = review.user_stats?.totalReviews || 0;

                return (
                  <article
                    key={review.id}
                    className="group rounded-[14px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_210px] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
                            {(customer.name || "A").slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-sm font-black text-slate-950">
                                {customer.name}
                              </h4>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${getRatingColor(
                                  rating,
                                )}`}
                              >
                                <Star size={11} fill="currentColor" />
                                {rating}/5
                              </span>

                              {images.length > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                                  <ImageIcon size={11} />
                                  {images.length}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 truncate text-xs font-bold text-slate-500">
                              {productName}
                            </p>

                            <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                              {review.review_title ? (
                                <span className="font-black text-slate-800">
                                  {review.review_title}:{" "}
                                </span>
                              ) : null}
                              {review.review_text || "No description provided."}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                {formatDateTime(review.createdAt)}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>{productCode}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                        <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                            User Reviews
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-950">
                            {totalUserReviews}
                          </p>
                        </div>

                        <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Product ID
                          </p>
                          <p className="mt-1 truncate text-sm font-black text-slate-950">
                            {review.product_id}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewTarget(review)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white active:scale-[0.98] sm:flex-none"
                        >
                          <Eye size={14} strokeWidth={2.6} />
                          View
                        </button>

                        <Link
                          href={createProductHref({
                            id: review.product_id,
                            publicId: review.product?.product_code || undefined,
                            name:
                              review.product?.product_name ||
                              `Product ${review.product_id}`,
                          })}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white active:scale-[0.98] sm:flex-none"
                        >
                          Product
                          <ExternalLink size={13} strokeWidth={2.6} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(review)}
                          disabled={deletingId === review.id}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                          {deletingId === review.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} strokeWidth={2.6} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {viewTarget ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={() => setViewTarget(null)}
        >
          <div
            className="modal-card w-full max-w-5xl overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {(() => {
              const customer = getCustomerInfo(viewTarget);
              const images = getReviewImages(viewTarget);
              const rating = Number(viewTarget.review_rate || 0);
              const productName =
                viewTarget.product?.product_name ||
                `Product ID: ${viewTarget.product_id}`;
              const productCode =
                viewTarget.product?.product_code ||
                `PID-${viewTarget.product_id}`;
              const reviewedProducts =
                viewTarget.user_stats?.reviewedProducts || [];
              const totalUserReviews = viewTarget.user_stats?.totalReviews || 0;

              return (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Review Details
                      </p>

                      <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
                        {customer.name}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewTarget(null)}
                      className="grid h-9 w-9 place-items-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 active:scale-[0.96]"
                      aria-label="Close review details"
                    >
                      <X size={18} strokeWidth={2.6} />
                    </button>
                  </div>

                  <div className="review-modal-scroll grid max-h-[75vh] gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="grid gap-4">
                      <section className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${getRatingColor(
                              rating,
                            )}`}
                          >
                            <Star size={12} fill="currentColor" />
                            {rating}/5 Rating
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                            <CalendarDays size={12} />
                            {formatDateTime(viewTarget.createdAt)}
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-black text-slate-950">
                          {viewTarget.review_title || "Customer Review"}
                        </h3>

                        <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
                          {viewTarget.review_text || "No description provided."}
                        </p>
                      </section>

                      <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                              Product Info
                            </p>
                            <h3 className="mt-1 text-base font-black text-slate-950">
                              {productName}
                            </h3>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                              {productCode}
                            </p>
                          </div>

                          <Link
                            href={createProductHref({
                              id: viewTarget.product_id,
                              publicId:
                                viewTarget.product?.product_code || undefined,
                              name:
                                viewTarget.product?.product_name ||
                                `Product ${viewTarget.product_id}`,
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white active:scale-[0.98]"
                          >
                            Open Product
                            <ExternalLink size={13} strokeWidth={2.6} />
                          </Link>
                        </div>

                        <InfoRow
                          label="Product ID"
                          value={String(viewTarget.product_id || "N/A")}
                        />
                      </section>

                      <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <ImageIcon size={15} className="text-slate-400" />
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Attachments
                          </p>
                        </div>

                        {images.length > 0 ? (
                          <div className="review-image-scroll flex gap-3 overflow-x-auto pb-1">
                            {images.map((src, index) => (
                              <div
                                key={`${viewTarget.id}-modal-${index}`}
                                className="relative h-40 min-w-[220px] overflow-hidden rounded-[14px] border border-slate-200 bg-slate-100"
                              >
                                <Image
                                  src={src}
                                  alt="Review attachment"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[12px] border border-dashed border-slate-200 py-10 text-center text-xs font-bold text-slate-400">
                            No attachments available.
                          </div>
                        )}
                      </section>
                    </div>

                    <aside className="grid gap-4 self-start">
                      <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <UserRound size={15} className="text-red-600" />
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Customer Info
                          </p>
                        </div>

                        <InfoRow label="Name" value={customer.name} />
                        <InfoRow
                          label="Email"
                          value={
                            customer.email ? (
                              <a
                                href={`mailto:${customer.email}`}
                                className="break-all text-slate-700 hover:text-red-600"
                              >
                                {customer.email}
                              </a>
                            ) : (
                              "Not available"
                            )
                          }
                          icon={<Mail size={12} />}
                        />
                        <InfoRow
                          label="Phone"
                          value={
                            customer.phone ? (
                              <a
                                href={`tel:${customer.phone}`}
                                className="text-slate-700 hover:text-red-600"
                              >
                                {customer.phone}
                              </a>
                            ) : (
                              "Not available"
                            )
                          }
                          icon={<Phone size={12} />}
                        />
                        <InfoRow
                          label="Customer ID"
                          value={customer.id || "Not available"}
                        />
                      </section>

                      <section className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                              User History
                            </p>

                            <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                              {totalUserReviews}
                            </p>
                          </div>

                          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white text-red-600 shadow-sm">
                            <BarChart3 size={19} strokeWidth={2.6} />
                          </div>
                        </div>

                        <p className="mt-2 text-xs font-medium text-slate-500">
                          Lifetime reviews contributed
                        </p>
                      </section>

                      <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Other Reviewed Products
                        </p>

                        {reviewedProducts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {reviewedProducts.map((product) => (
                              <Link
                                key={`${viewTarget.id}-${product.product_id}`}
                                href={createProductHref({
                                  id: product.product_id,
                                  publicId: product.product_code || undefined,
                                  name:
                                    product.product_name ||
                                    `Product ${product.product_id}`,
                                })}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <span className="truncate">
                                  {product.product_name || "Item"}
                                </span>
                                <ExternalLink
                                  size={11}
                                  strokeWidth={2.6}
                                  className="shrink-0"
                                />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-slate-400">
                            No other reviewed products.
                          </p>
                        )}
                      </section>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(viewTarget);
                          setViewTarget(null);
                        }}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-red-200 bg-red-50 text-xs font-black uppercase tracking-[0.12em] text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-[0.98]"
                      >
                        <Trash2 size={16} strokeWidth={2.6} />
                        Delete Review
                      </button>
                    </aside>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={() => {
            if (!deletingId) setDeleteTarget(null);
          }}
        >
          <div
            className="modal-card w-full max-w-md rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={18} strokeWidth={2.6} />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Delete review?
                </h2>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  This will permanently remove review by{" "}
                  <b className="text-slate-800">
                    {getCustomerInfo(deleteTarget).name || "this customer"}
                  </b>
                  . This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteReview}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} strokeWidth={2.6} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .review-image-scroll,
        .review-modal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior: contain;
        }

        .review-image-scroll::-webkit-scrollbar,
        .review-modal-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .modal-card {
          animation: modalIn 180ms ease-out;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-card,
          .modal-card * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}