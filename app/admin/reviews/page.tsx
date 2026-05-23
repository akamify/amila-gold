'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { deleteAdminReview, fetchAdminReviews, type AdminReview } from '@/app/lib/apiClient';
import { createProductHref } from '@/app/data/products';

const formatDateTime = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ totalReviews: 0, totalUsers: 0, totalProducts: 0 });

    const load = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await fetchAdminReviews();
            setReviews(data.reviews);
            setStats(data.stats);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Could not load reviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filteredReviews = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return reviews;
        return reviews.filter((review) => {
            const productName = review.product?.product_name || '';
            const productCode = review.product?.product_code || '';
            return [
                review.user_name,
                review.review_text,
                review.review_title,
                productName,
                productCode,
                String(review.product_id || ''),
            ]
                .join(' ')
                .toLowerCase()
                .includes(query);
        });
    }, [reviews, search]);

    const onDeleteReview = async (reviewId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this review? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            setDeletingId(reviewId);
            setMessage('');
            setError('');
            await deleteAdminReview(reviewId);
            setReviews((prev) => prev.filter((item) => item.id !== reviewId));
            setStats((prev) => ({ ...prev, totalReviews: Math.max(0, prev.totalReviews - 1) }));
            setMessage('Review deleted successfully.');
            setTimeout(() => setMessage(''), 3000);
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete review.');
        } finally {
            setDeletingId('');
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200">
            {/* Header Section */}
            <header className="relative py-6">
                <div className="flex flex-col gap-2 relative z-10">
                    <span className="flex items-center gap-2 font-headline text-[10px] md:text-xs tracking-[0.3em] text-red-700 font-bold uppercase">
                        <span className="w-8 h-[1px] bg-red-700/50"></span>
                        Management Console
                    </span>
                    <h2 className="font-brand text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-white/40 bg-clip-text text-transparent">
                        Reviews Feed
                    </h2>
                    <p className="max-w-2xl text-sm md:text-base text-slate-400 font-light leading-relaxed">
                        Monitor community feedback, track user contributions, and maintain quality control across your product catalog.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-700/5 blur-[120px] rounded-full -z-0" />
            </header>

            {/* Notifications */}
            <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-3 max-w-sm">
                {error && (
                    <div className="flex items-center gap-3 bg-red-950/40 backdrop-blur-xl border border-red-500/30 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <p className="text-xs font-medium text-red-200">{error}</p>
                    </div>
                )}
                {message && (
                    <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right">
                        <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                        <p className="text-xs font-medium text-emerald-200">{message}</p>
                    </div>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Reviews', value: stats.totalReviews, icon: 'reviews', color: 'text-red-700' },
                    { label: 'Unique Users', value: stats.totalUsers, icon: 'group', color: 'text-blue-400' },
                    { label: 'Reviewed Products', value: stats.totalProducts, icon: 'inventory_2', color: 'text-emerald-400' },
                ].map((stat, idx) => (
                    <div key={idx} className="group relative bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 p-6 rounded-2xl hover:border-red-700/30 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <p className="font-headline text-[11px] tracking-widest text-slate-500 uppercase font-bold">{stat.label}</p>
                            <span className={`material-symbols-outlined ${stat.color} opacity-80 group-hover:scale-110 transition-transform`}>{stat.icon}</span>
                        </div>
                        <p className="font-brand text-5xl mt-4 font-black">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <section className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-slate-100/80 dark:bg-white/[0.02]">
                    <div className="flex items-center flex-row gap-4">
                        <h3 className="font-brand text-2xl font-bold tracking-tight">Active Reviews</h3>
                        <span className="flex items-center flex-col px-3 py-1 rounded-full bg-red-700/10 text-red-700 text-[10px] font-bold tracking-widest">
                            {filteredReviews.length} ENTRIES
                        </span>
                    </div>
                    <div className="relative w-full md:w-[400px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20">search</span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search user, product, or keywords..."
                            className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                        />
                    </div>
                </div>

                <div className="p-6 md:p-8 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                            <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
                            <p className="font-headline text-xs tracking-widest uppercase italic">Loading Reviews...</p>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-white/5 rounded-2xl opacity-50 dark:opacity-40">
                            <p className="font-headline text-sm tracking-widest uppercase">No matching records found</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {filteredReviews.map((review) => (
                                <article key={review.id} className="group relative bg-slate-50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl p-5 md:p-6 transition-all duration-300 grid grid-cols-1 xl:grid-cols-12 gap-8">
                                    
                                    <div className="xl:col-span-8 flex flex-col gap-5">
                                        {/* Review Meta */}
                                        <div className="flex flex-wrap gap-3 items-center">
                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/5">
                                                <span className="material-symbols-outlined text-red-700 text-sm">person</span>
                                                <span className="text-[11px] font-bold tracking-wide uppercase">{review.user_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/10">
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                <span className="text-[11px] font-black">{review.review_rate}/5</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 ml-2">
                                                <span className="material-symbols-outlined text-xs">calendar_today</span>
                                                <span className="text-[10px] font-medium uppercase tracking-tighter">{formatDateTime(review.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div>
                                            <h4 className="font-brand text-2xl font-bold group-hover:text-red-700 transition-colors duration-300">
                                                {review.product?.product_name || `Product ID: ${review.product_id}`}
                                            </h4>
                                            <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase font-bold mt-1">
                                                {review.product?.product_code || `PID-${review.product_id}`}
                                            </p>
                                        </div>

                                        {/* Review Content */}
                                        <div className="space-y-2">
                                            {review.review_title && (
                                                <p className="text-red-700 font-bold text-xs uppercase tracking-wider">{review.review_title}</p>
                                            )}
                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-light bg-slate-100 dark:bg-black/20 p-4 rounded-xl border border-slate-300 dark:border-white/5">
                                                {review.review_text || 'No description provided.'}
                                            </p>
                                        </div>

                                        {/* Images */}
                                        {review.review_images.length > 0 && (
                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                {review.review_images.map((src, index) => (
                                                    <div key={index} className="relative min-w-[140px] h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 hover:border-red-700/50 transition-colors">
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
                                        )}
                                    </div>

                                    {/* Sidebar Info & Actions */}
                                    <div className="xl:col-span-4 flex flex-col gap-4 justify-between border-l border-slate-200 dark:border-white/5 xl:pl-8">
                                        <div className="space-y-4">
                                            <div className="bg-slate-100 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-300 dark:border-white/5">
                                                <p className="text-[9px] tracking-widest text-slate-500 uppercase font-black mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs">analytics</span> User History
                                                </p>
                                                <p className="text-3xl font-brand font-black">{review.user_stats.totalReviews}</p>
                                                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tight font-medium">Lifetime Reviews Contributed</p>
                                            </div>

                                            <div className="p-2">
                                                <p className="text-[9px] tracking-widest text-slate-500 uppercase font-black mb-3">Other Reviews</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {review.user_stats.reviewedProducts.map((product) => (
                                                        <Link
                                                            key={`${review.id}-${product.product_id}`}
                                                            href={createProductHref({
                                                                id: product.product_id,
                                                                publicId: product.product_code || undefined,
                                                                name: product.product_name || `Product ${product.product_id}`,
                                                            })}
                                                            target="_blank"
                                                            className="text-[9px] font-bold uppercase tracking-tighter px-2.5 py-1.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-md hover:bg-red-700/20 hover:border-red-700/40 transition-all"
                                                        >
                                                            {product.product_name || 'Item'}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onDeleteReview(review.id)}
                                            disabled={deletingId === review.id}
                                            className="group/btn w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-xl border border-red-500/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform">
                                                {deletingId === review.id ? 'sync' : 'delete_forever'}
                                            </span>
                                            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                                                {deletingId === review.id ? 'Processing...' : 'Purge Review'}
                                            </span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
