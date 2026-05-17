"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";
import type { Product } from "@/app/data/products";
import { fetchBackendProducts } from "@/app/lib/backendProducts";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

export default function ShopPageClient() {
  const { addItem, isVariantInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [checkedCategories, setCheckedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("featured");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const PRODUCTS_PER_PAGE = 9;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBackendProducts();
        setProducts(data);
        const uniqueCategories = [...new Set(data.map(p => p.category).filter((category): category is string => Boolean(category)))];
        if (uniqueCategories.length > 0) {
          setCheckedCategories([uniqueCategories[0]]);
        }
        if (data.length > 0) {
          const maxPriceVal = Math.ceil(Math.max(...data.map(p => p.price)));
          setMaxPrice(maxPriceVal);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const CATEGORIES = useMemo(
    () => [...new Set(products.map(p => p.category).filter((category): category is string => Boolean(category)))],
    [products]
  );

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);
  const activeFilterCount = checkedCategories.length + selectedWeights.length + (maxPrice < priceRange.max ? 1 : 0);

  const AVAILABLE_WEIGHTS = useMemo(() => ["100g", "250g", "500g", "1kg", "2kg", "5kg"], []);

  const handleAddToCart = (product: Product) => {
    const inStock = Number(product.quantity || 0) > 0 || Object.values(product.stockByVariant || {}).some((qty) => Number(qty || 0) > 0);
    if (!inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      color: "",
      size: selectedWeights[0] || "1kg",
      image: product.image,
      collection: product.collection || "SHOP COLLECTION",
    });
  };

  const toggleWeight = (w: string) => {
    setSelectedWeights((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
  };

  const clearAllFilters = () => {
    setCheckedCategories([]);
    setMaxPrice(priceRange.max);
    setSelectedWeights([]);
  };

  const toggleCat = (c: string) =>
    setCheckedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const filteredProducts = useMemo(() => {
    let results = products;
    if (checkedCategories.length > 0) results = results.filter(p => checkedCategories.includes(String(p.category || "")));
    results = results.filter(p => p.price <= maxPrice);
    if (selectedWeights.length > 0) {
      results = results.filter(p =>
        selectedWeights.some(weight =>
          p.name.toLowerCase().includes(weight.toLowerCase()) ||
          String(p.description || "").toLowerCase().includes(weight.toLowerCase())
        )
      );
    }
    return results;
  }, [products, checkedCategories, maxPrice, selectedWeights]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [checkedCategories, maxPrice, selectedWeights]);

  const getSortedProducts = () => {
    const sorted = [...filteredProducts];
    switch (sortOption) {
      case "price-asc": return sorted.sort((a, b) => a.price - b.price);
      case "price-desc": return sorted.sort((a, b) => b.price - a.price);
      case "name-asc": return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc": return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default: return sorted;
    }
  };

  const closeMobileFilter = () => {
    setShowMobileFilter(false);
  };

  return (
    <main className="pt-25 pb-2 px-6 lg:px-12 max-w-[1440px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="mb-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="text-secondary font-bold tracking-[0.3em] uppercase text-xs mb-4 block animate-bounce">Pure Heritage</span>
            <h1 className="font-headline text-6xl lg:text-8xl text-primary tracking-tighter leading-[0.9] mb-4">
              The Golden <br /> Harvest
            </h1>
            <div className="h-1 w-24 bg-secondary rounded-full" />
          </div>
        </div>
      </header>

      {/* Control Bar (Mobile Filters) */}
      <div className="lg:hidden mb-10 flex items-center gap-4">
        <button
          onClick={() => setShowMobileFilter(true)}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm border border-outline-variant hover:border-secondary transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">tune</span>
          <span className="font-bold text-sm uppercase tracking-widest">Filter & Sort</span>
          {activeFilterCount > 0 && (
            <span className="min-w-7 h-7 px-2 rounded-full bg-secondary text-white text-[11px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-32 space-y-12">
            <section className="bg-surface-container-low/50 p-8 rounded-[1rem] border border-outline-variant/30 backdrop-blur-md">
              <h3 className="font-headline text-2xl font-bold text-primary mb-8 tracking-tight">Filters</h3>

              <div className="space-y-10">
                {/* Category Filter */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black mb-6">By Category</h4>
                  <div className="space-y-4">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-4 group cursor-pointer">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${checkedCategories.includes(cat) ? 'bg-secondary border-secondary' : 'border-outline-variant group-hover:border-secondary'}`}>
                          {checkedCategories.includes(cat) && <span className="material-symbols-outlined text-white text-lg">check</span>}
                        </div>
                        <input type="checkbox" className="hidden" checked={checkedCategories.includes(cat)} onChange={() => toggleCat(cat)} readOnly />
                        <span className={`font-medium transition-colors ${checkedCategories.includes(cat) ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black mb-6">Price Range</h4>
                  <input type="range" className="w-full accent-secondary h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer" min={priceRange.min} max={priceRange.max} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
                  <div className="flex justify-between mt-4 text-sm font-bold text-primary">
                    <span>₹{priceRange.min}</span>
                    <span className="bg-secondary/10 px-3 py-1 rounded-md text-secondary">Up to ₹{maxPrice}</span>
                  </div>
                </div>

                {/* Weight Filter */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black mb-6">Weight</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_WEIGHTS.map((w) => (
                      <button key={w} onClick={() => toggleWeight(w)} className={`px-4 py-3 text-xs font-bold rounded-xl border transition-all ${selectedWeights.includes(w) ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-outline-variant hover:border-secondary"}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={clearAllFilters} className="w-full text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all underline-offset-8">Reset All</button>
              </div>
            </section>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Desktop Sort Row */}
          <div className="hidden lg:flex items-center justify-between mb-12 bg-white p-2 rounded-2xl border border-outline-variant/30">
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortOption(option.value)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${sortOption === option.value ? "bg-primary text-white shadow-xl" : "text-on-surface-variant hover:bg-surface-variant/20"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">{filteredProducts.length} Results</p>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
              <span className="material-symbols-outlined text-9xl text-outline-variant mb-6">eco</span>
              <h3 className="text-3xl font-bold text-primary tracking-tight">No harvest found</h3>
              <button onClick={clearAllFilters} className="mt-8 text-secondary font-bold uppercase tracking-widest border-b-2 border-secondary">Reset Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
                {getSortedProducts().slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map((p) => {
                  const inStock = Number(p.quantity || 0) > 0 || Object.values(p.stockByVariant || {}).some((qty) => Number(qty || 0) > 0);
                  const inCart = isVariantInCart(p.id, selectedWeights[0] || "1kg", "");
                  return (
                    <div
                      key={p.id}
                      className="group relative animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both"
                    >
                      <div className="flex flex-row-reverse sm:block gap-4 sm:gap-0 items-center">

                        {/* LEFT CONTENT */}
                        <div className="flex-1 order-1 sm:order-none">
                          <Link
                            href={`/product/${p.id}/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block"
                          >
                            <div className="flex flex-col gap-2 px-1 sm:px-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-headline text-base sm:text-2xl text-primary font-bold truncate max-w-[180px] sm:max-w-none group-hover:text-secondary transition-colors duration-300">
                                  {p.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xl sm:text-2xl font-black text-primary">
                                  ₹{p.price}
                                </span>

                                {p.originalPrice && (
                                  <span className="text-xs sm:text-sm text-on-surface-variant/50 line-through font-bold">
                                    ₹{p.originalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>

                          {/* CART BUTTON */}
                          <div className="mt-4 px-1 sm:px-2">
                            {inCart ? (
                              <Link
                                href="/cart"
                                className="w-full py-3 sm:py-5 rounded-2xl bg-secondary text-white font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-secondary/30 hover:scale-[1.02] active:scale-95 transition-all"
                              >
                                <span className="material-symbols-outlined text-base sm:text-lg">
                                  shopping_cart_checkout
                                </span>

                                Go to Cart
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToCart(p)}
                                disabled={!inStock}
                                className="w-full py-2 sm:py-5 rounded-2xl bg-white border-2 border-primary text-primary font-bold text-[9px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-primary"
                              >
                                <span className="material-symbols-outlined text-sm sm:text-lg">
                                  add_shopping_cart
                                </span>

                                {inStock ? "Add to Cart" : "Out of Stock"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <Link
                          href={`/product/${p.id}/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block order-2 sm:order-none"
                        >
                          <div className="relative overflow-hidden rounded-[1rem] bg-surface-container-high w-28 h-30 sm:w-auto sm:h-auto sm:aspect-square sm:mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-32 flex items-center justify-center gap-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-16 h-16 rounded-full border-2 border-outline-variant flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all disabled:opacity-20 group">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">west</span>
                  </button>
                  <div className="flex gap-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => setCurrentPage(n)} className={`w-16 h-16 rounded-full font-black text-lg transition-all ${currentPage === n ? "bg-primary text-white shadow-2xl scale-110" : "text-primary/40 hover:text-primary"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-16 h-16 rounded-full border-2 border-outline-variant flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all disabled:opacity-20 group">
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Slide-out (Enhanced) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-500 lg:hidden ${showMobileFilter ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={closeMobileFilter} />
        <div className={`absolute bottom-0 left-0 right-0 h-[85vh] bg-surface rounded-t-[2rem] p-5 transform transition-transform duration-500 ease-out ${showMobileFilter ? "translate-y-0" : "translate-y-full"}`}>
          <div className="w-12 h-1.5 bg-outline-variant/50 rounded-[2rem] mx-auto mb-10" />
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-bold text-primary tracking-tighter">Refine Selection</h3>
            <button onClick={closeMobileFilter} className="w-12 h-12 bg-surface-variant/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div
            className="overflow-y-auto overscroll-contain touch-pan-y h-[calc(100%-140px)] space-y-8 pb-28 pr-1"
            data-lenis-prevent="true"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <section className="bg-surface-container-low/50 border border-outline-variant/20 rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant font-black mb-2">Sort By</p>
                  <h4 className="text-xl font-bold text-primary">Choose your flow</h4>
                </div>
                <span className="material-symbols-outlined text-secondary">swap_vert</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                    }}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all ${sortOption === option.value
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white border border-outline-variant text-primary"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-low/50 border border-outline-variant/20 rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant font-black mb-2">By Category</p>
                  <h4 className="text-xl font-bold text-primary">Pick your favorites</h4>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
                  {checkedCategories.length} selected
                </span>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-4 group cursor-pointer rounded-2xl border border-outline-variant/20 bg-white px-4 py-4">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${checkedCategories.includes(cat) ? 'bg-secondary border-secondary' : 'border-outline-variant group-hover:border-secondary'}`}>
                      {checkedCategories.includes(cat) && <span className="material-symbols-outlined text-white text-lg">check</span>}
                    </div>
                    <input type="checkbox" className="hidden" checked={checkedCategories.includes(cat)} onChange={() => toggleCat(cat)} readOnly />
                    <span className={`font-medium transition-colors ${checkedCategories.includes(cat) ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>{cat}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-low/50 border border-outline-variant/20 rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant font-black mb-2">Price Range</p>
                  <h4 className="text-xl font-bold text-primary">Set your ceiling</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black">
                  Up to Rs {maxPrice}
                </span>
              </div>
              <input type="range" className="w-full accent-secondary h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer" min={priceRange.min} max={priceRange.max} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
              <div className="flex justify-between mt-4 text-sm font-bold text-primary">
                <span>Rs {priceRange.min}</span>
                <span>Rs {priceRange.max}</span>
              </div>
            </section>

            <section className="bg-surface-container-low/50 border border-outline-variant/20 rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant font-black mb-2">Weight</p>
                  <h4 className="text-xl font-bold text-primary">Choose pack size</h4>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
                  {selectedWeights.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_WEIGHTS.map((w) => (
                  <button key={w} onClick={() => toggleWeight(w)} className={`px-4 py-3 text-xs font-bold rounded-xl border transition-all ${selectedWeights.includes(w) ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-outline-variant hover:border-secondary"}`}>
                    {w}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-surface via-surface to-transparent">
            <div className="flex items-center gap-3">
              <button onClick={clearAllFilters} className="flex-1 rounded-2xl border border-outline-variant px-4 py-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Reset All
              </button>
              <button onClick={closeMobileFilter} className="flex-1 rounded-2xl bg-primary px-4 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-xl shadow-primary/20">
                View {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
