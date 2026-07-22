'use client';
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import Image from 'next/image';
import type { Review, ReviewSlide } from '../types';

interface ReviewCardsProps {
    sortedReviews: Review[];
    reviewSlides: ReviewSlide[];
    onOpenSlide: (index: number) => void;
}

export default function ReviewCards({ sortedReviews, reviewSlides, onOpenSlide }: ReviewCardsProps) {
    return (
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-3 px-1 md:px-0 snap-x snap-mandatory x-rail x-rail-lux scroll-smooth">
            {sortedReviews.length === 0 && (
                <div className="min-w-full border border-[#1c1b1b]/10 bg-[#f6f3f2] p-8">
                    <p className="font-headline text-[11px] uppercase tracking-widest opacity-70">No reviews yet. Be the first to review this product.</p>
                </div>
            )}
            {sortedReviews.map((review) => {
                const hasImages = Boolean(review.images && review.images.length > 0);
                return (
                    <div key={review.id} className="w-[20%] md:w-[26%] snap-start flex flex-col gap-4 border-l-4 border-[#1c1b1b]/20 hover:border-red-600 pl-6 bg-white/70 p-5 md:p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex text-[#b90c1b]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <SymbolIcon key={star} name="grade" className="text-sm" filled={star <= review.rating} />
                                ))}
                            </div>
                            {!hasImages && (
                                <span className="font-headline text-[9px] uppercase tracking-widest opacity-50 flex items-center gap-1">
                                    <SymbolIcon name={"article"} className="text-xs" />
                                    Text Review
                                </span>
                            )}
                        </div>

                        <p className="font-headline text-[12px] md:text-[13px] normal-case tracking-wide leading-relaxed opacity-85 break-words whitespace-pre-wrap">&quot;{review.text}&quot;</p>

                        {hasImages ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory x-rail x-rail-lux scroll-smooth">
                                {review.images.map((src, idx) => (
                                    <button
                                        key={`${review.id}-${idx}`}
                                        type="button"
                                        onClick={() => {
                                            const key = `${review.id}-${idx}`;
                                            const slideIndex = reviewSlides.findIndex((slide) => slide.key === key);
                                            if (slideIndex >= 0) onOpenSlide(slideIndex);
                                        }}
                                        className="min-w-[130px] sm:min-w-[145px] md:min-w-[160px] max-w-[180px] snap-start shrink-0 overflow-hidden border border-[#1c1b1b]/15 transition-transform duration-300 hover:scale-[1.02]"
                                        aria-label={`Open review image ${idx + 1} from ${review.author}`}
                                    >
                                        <Image src={src} alt={`Review image ${idx + 1}`} width={240} height={180} unoptimized className="w-full aspect-[4/3] object-cover" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-[#1c1b1b]/20 bg-[#fcf8f8] px-3 py-2">
                                <p className="font-headline text-[10px] uppercase tracking-widest opacity-55">No images attached in this review</p>
                            </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3">
                            <span className="font-headline text-[10px] font-bold uppercase tracking-widest">— {review.author}</span>
                            <span className="font-headline text-[9px] uppercase tracking-widest opacity-40 text-right">{review.dateTime}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
