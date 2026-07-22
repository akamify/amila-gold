'use client';
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import Image from 'next/image';
import type { ReviewViewerState } from '../types';

interface ReviewImageViewerModalProps {
    reviewViewer: ReviewViewerState | null;
    onClose: () => void;
    onMove: (direction: 'prev' | 'next') => void;
}

export default function ReviewImageViewerModal({ reviewViewer, onClose, onMove }: ReviewImageViewerModalProps) {
    if (!reviewViewer || !reviewViewer.slides[reviewViewer.index]) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 md:p-8">
            <button
                type="button"
                className="absolute inset-0"
                aria-label="Close review image viewer"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#111] border border-white/15 overflow-hidden">
                <Image
                    src={reviewViewer.slides[reviewViewer.index].src}
                    alt={`Review image ${reviewViewer.index + 1}`}
                    width={1800}
                    height={1300}
                    unoptimized
                    className="w-full max-h-[70vh] md:max-h-[76vh] object-contain bg-white"
                />

                <div className="p-4 md:p-6 border-t border-white/15 bg-white text-black flex flex-col gap-2 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <p className="min-w-0 flex-1 font-headline text-[11px] md:text-xs uppercase tracking-widest opacity-80 break-words [overflow-wrap:anywhere]">
                            {reviewViewer.slides[reviewViewer.index].author}
                        </p>
                        <p className="w-full sm:w-auto font-headline text-[10px] md:text-xs uppercase tracking-widest opacity-60 text-left sm:text-right break-words [overflow-wrap:anywhere]">
                            {reviewViewer.slides[reviewViewer.index].dateTime}
                        </p>
                    </div>
                    <p className="font-headline text-[11px] md:text-sm uppercase tracking-widest opacity-95 leading-relaxed whitespace-normal break-words [overflow-wrap:anywhere]">
                        {reviewViewer.slides[reviewViewer.index].text}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => onMove('prev')}
                    aria-label="Previous review image"
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 border border-white/30 bg-black/50 text-white hover:bg-black/75 flex items-center justify-center"
                >
                    <SymbolIcon name={"chevron_left"} className="text-xl md:text-2xl" />
                </button>

                <button
                    type="button"
                    onClick={() => onMove('next')}
                    aria-label="Next review image"
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 border border-white/30 bg-black/50 text-white hover:bg-black/75 flex items-center justify-center"
                >
                    <SymbolIcon name={"chevron_right"} className="text-xl md:text-2xl" />
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close review image viewer"
                    className="absolute top-2 right-2 md:top-4 md:right-4 h-10 w-10 md:h-11 md:w-11 border border-white/30 bg-black/50 text-white hover:bg-black/75 flex items-center justify-center"
                >
                    <SymbolIcon name={"close"} className="text-lg md:text-xl" />
                </button>
            </div>
        </div>
    );
}
