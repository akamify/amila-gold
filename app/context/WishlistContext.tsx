'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { addWishlistProduct, fetchWishlistProducts, removeWishlistProduct } from '@/app/lib/apiClient';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  collection: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  toggle: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);
const mapProductToWishlistItem = (product: Partial<WishlistItem> & Record<string, unknown>): WishlistItem => ({
  id: Number(product.id || product.product_id || 0),
  name: String(product.name || product.title || 'Product'),
  price: Number(product.price || 0),
  image: String(product.image || ''),
  collection: String(product.collection || ''),
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sr_wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch { }

    fetchWishlistProducts()
      .then((products) => {
        setItems(products.map((p) => mapProductToWishlistItem(p as unknown as Record<string, unknown>)));
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    localStorage.setItem('sr_wishlist', JSON.stringify(items));
  }, [items]);

  const addItem = (item: WishlistItem) => {
    setItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item]);
    addWishlistProduct(item.id)
      .then((data) => {
        const products = Array.isArray((data as Record<string, unknown>).products)
          ? ((data as Record<string, unknown>).products as Record<string, unknown>[])
          : [];
        setItems(products.map((p) => mapProductToWishlistItem(p)));
      })
      .catch(() => { });
  };

  const removeItem = (id: number) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Remove this item from your wishlist?');
      if (!confirmed) return;
    }

    setItems(prev => prev.filter(i => i.id !== id));
    removeWishlistProduct(id)
      .then((data) => {
        const products = Array.isArray((data as Record<string, unknown>).products)
          ? ((data as Record<string, unknown>).products as Record<string, unknown>[])
          : [];
        setItems(products.map((p) => mapProductToWishlistItem(p)));
      })
      .catch(() => { });
  };
  const isInWishlist = (id: number) => items.some(i => i.id === id);
  const toggle = (item: WishlistItem) => isInWishlist(item.id) ? removeItem(item.id) : addItem(item);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
