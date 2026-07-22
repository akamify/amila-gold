'use client';
import SymbolIcon from "@/app/components/icons/SymbolIcon";

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface AddressModalProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
}

export default function AddressModal({ title, children, onClose }: AddressModalProps) {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[140] bg-black/55 p-4 md:p-6 overflow-y-auto overscroll-contain"
            data-lenis-prevent="true"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
        >
            <div className="min-h-full flex items-center justify-center">
                <div
                    className="w-full max-w-3xl max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto overscroll-contain bg-white rounded-2xl shadow-2xl border border-black/5"
                    data-lenis-prevent="true"
                    onWheel={(event) => event.stopPropagation()}
                    onTouchMove={(event) => event.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-black/10">
                        <h3 className="font-headline text-lg md:text-xl font-bold text-primary">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            aria-label="Close address form"
                        >
                            <SymbolIcon name={"close"} />
                        </button>
                    </div>
                    <div className="p-5 md:p-6">{children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
}
