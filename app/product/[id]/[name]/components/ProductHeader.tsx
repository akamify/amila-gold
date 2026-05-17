/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import type { Product } from '@/app/data/products';

export default function ProductHeader({ product }: { product?: Product | null }) {
  const router = useRouter();
  const { toggle, isInWishlist } = useWishlist();
  const { settings } = useSiteSettings();
  const currencySymbol = settings.currencySymbol || "₹";

  const firstSize = product?.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
  const [selectedSize, setSelectedSize] = useState<string>(firstSize);
  const productId = product?.id ?? 0;

  const { addItem, isVariantInCart, updateQty } = useCart();
  const inCart = isVariantInCart(productId, selectedSize, "");
  const inWishlist = isInWishlist(productId);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.find((v) => v.label === selectedSize) ?? product.variants[0];
    }
    return undefined;
  }, [product, selectedSize]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayOriginal = selectedVariant?.originalPrice ?? product?.originalPrice;

  // Base image logic remains, but now we ensure we have a robust gallery
  const initialImage = selectedVariant?.image
    ?? (product?.images && product.images.length > 0 ? product.images[0] : product?.image)
    ?? '';

  const descriptionHtml = product?.descriptionHtml?.trim() || '';
  const descriptionText = product?.description?.trim() || 'Savor the authentic taste of tradition. Handcrafted with care using only the finest natural ingredients.';

  // Gallery logic: show all distinct images we have (variant + product).
  const galleryImages = useMemo(() => {
    const imagesSource = [
      selectedVariant?.image,
      ...((selectedVariant as { images?: string[] } | undefined)?.images || []),
      ...(product?.images || []),
      product?.image,
    ]
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    const uniq: string[] = [];
    for (const url of imagesSource) {
      if (!uniq.includes(url)) uniq.push(url);
    }

    return uniq;
  }, [product?.image, product?.images, selectedVariant]);

  const infiniteImages = useMemo(() => {
    if (galleryImages.length <= 1) return galleryImages;

    return [
      galleryImages[galleryImages.length - 1],
      ...galleryImages,
      galleryImages[0],
    ];
  }, [galleryImages]);

  // Calculate available stock for selected variant/size
  const availableStock = useMemo(() => {
    if (!product) return 0;
    // Check variant stock first
    if (selectedVariant?.stock !== undefined) {
      return selectedVariant.stock;
    }
    // Check stockByVariant
    if (product.stockByVariant && selectedSize) {
      return product.stockByVariant[selectedSize] ?? 0;
    }
    // Check stockBySize
    if (product.stockBySize && selectedSize) {
      return product.stockBySize[selectedSize] ?? 0;
    }
    return 0;
  }, [product, selectedVariant, selectedSize]);
  const isOutOfStock = availableStock <= 0;

  const [qty, setQty] = useState<number>(1);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  // Set the first image from our robust gallery as active initially
  const [activeImage, setActiveImage] = useState<string>(galleryImages[0] || initialImage);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const isAdjustingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If the variant image changes, update the main view
    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (!galleryImages.length) return;
    if (activeImage && galleryImages.includes(activeImage)) return;
    setActiveImage(galleryImages[0]);
  }, [galleryImages, activeImage]);

  useEffect(() => {
    const el = mobileCarouselRef.current;

    if (!el) return;

    if (infiniteImages.length <= 1) return;

    const width = el.clientWidth;

    el.scrollLeft = width;
  }, [infiniteImages.length]);


  const handleShare = async () => {
    if (!product) return;
    const productUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name || 'Product',
          text: `Check out this product: ${product.name || 'Awesome item'}`,
          url: productUrl,
        });
        setShareStatus('Product shared successfully');
      } else {
        await navigator.clipboard.writeText(productUrl);
        setShareStatus('Product link copied');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(productUrl);
        setShareStatus('Product link copied');
      } catch {
        setShareStatus('Unable to share this product');
      }
    }

    window.setTimeout(() => setShareStatus(''), 2500);
  };

  // Handle scroll for sticky mobile button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show sticky button after scrolling past the product details section
      setIsStickyVisible(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!product || productId <= 0) return;
    if (isOutOfStock) return;
    if (inCart) {
      router.push("/cart");
      return;
    }

    addItem({
      id: productId,
      name: product?.name ?? 'Product',
      price: displayPrice,
      color: "",
      size: selectedSize,
      image: initialImage, // Use the primary image for cart
      collection: product?.collection ?? 'SHOP',
    });

    if (qty > 1) {
      try {
        updateQty(productId, selectedSize, qty - 1);
      } catch { /* ignore */ }
    }
  };

  const handleWishlist = () => {
    if (!product || productId <= 0) return;
    toggle({
      id: productId,
      name: product?.name ?? 'Product',
      price: displayPrice,
      image: initialImage, // Use the primary image for wishlist
      collection: product?.collection ?? 'SHOP',
    });
  };

  const handleBuyNow = () => {
    if (!product || productId <= 0) return;
    if (isOutOfStock) return;

    // Save Buy Now item to localStorage (doesn't affect cart)
    const buyNowItem = {
      id: productId,
      name: product?.name ?? 'Product',
      price: displayPrice,
      color: "",
      size: selectedSize,
      image: initialImage, // Use the primary image for buy now
      collection: product?.collection ?? 'SHOP',
      qty: qty,
    };

    localStorage.setItem('sr_buy_now_item', JSON.stringify(buyNowItem));

    // Navigate to checkout
    router.push("/checkout?buyNow=true");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 items-start mt-2 lg:mt-6 w-full max-w-7xl mx-auto px-4 md:px-0">

      {/* --- Main Section: Horizontal Scrollable Images (Desktop & Mobile) --- */}
      <div className="lg:col-span-7 order-1 w-full lg:sticky lg:top-28 self-start">
        {/* Mobile: horizontal scrollable carousel */}
        {/* Mobile: horizontal scrollable carousel */}
        <div className="lg:hidden relative overflow-hidden rounded-[2rem] bg-surface-container-low shadow-2xl shadow-primary/5">
          <div
            ref={mobileCarouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar touch-pan-x"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
            onScroll={(e) => {
              const el = e.currentTarget;

              if ((el as typeof el & { scrollTimeout?: NodeJS.Timeout }).scrollTimeout) {
                clearTimeout((el as typeof el & { scrollTimeout?: NodeJS.Timeout }).scrollTimeout);
              }

              (el as typeof el & { scrollTimeout?: NodeJS.Timeout }).scrollTimeout =
                setTimeout(() => {
                  const width = el.clientWidth;
                  const index = Math.round(el.scrollLeft / width);

                  const nextImage = galleryImages[index];

                  if (nextImage && nextImage !== activeImage) {
                    setActiveImage(nextImage);
                  }

                  // FORCE exact single-image snap
                  el.scrollTo({
                    left: index * width,
                    behavior: "smooth",
                  });
                }, 80);
            }}
          >
            {(galleryImages.length ? galleryImages : [initialImage])
              .filter(Boolean)
              .map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative w-full flex-none aspect-square snap-center snap-always"
                >
                  <Image
                    alt={product?.name ?? "Product Image"}
                    src={src}
                    fill
                    unoptimized
                    priority={idx === 0}
                    sizes="100vw"
                    draggable={false}
                    className="object-cover pointer-events-none select-none"
                  />
                </div>
              ))}
          </div>

          {/* Floating Badge */}
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 right-4 w-20 h-20 rounded-full bg-secondary/90 backdrop-blur-md text-on-secondary flex flex-col items-center justify-center text-center p-3 shadow-xl z-10 border border-white/20 pointer-events-none"
          >
            <span className="font-label text-[8px] uppercase tracking-widest opacity-80">
              Pure
            </span>

            <span className="font-headline font-black text-lg leading-none my-0.5">
              100%
            </span>

            <span className="font-headline italic text-[10px]">
              Natural
            </span>
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[1]" />
        </div>

        {/* Desktop: cross-fade hero image */}
        <div className="hidden lg:block relative group overflow-hidden rounded-[2rem] bg-surface-container-low shadow-2xl shadow-primary/5 aspect-[4/3]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 z-0"
            >
              {activeImage ? (
                <Image
                  alt={product?.name ?? "Product Image"}
                  src={activeImage}
                  fill
                  unoptimized
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50">No Image</div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 right-4 w-28 h-28 rounded-full bg-secondary/90 backdrop-blur-md text-on-secondary flex flex-col items-center justify-center text-center p-3 shadow-xl z-10 border border-white/20 pointer-events-none"
          >
            <span className="font-label text-[10px] uppercase tracking-widest opacity-80">Pure</span>
            <span className="font-headline font-black text-2xl leading-none my-0.5">100%</span>
            <span className="font-headline italic text-xs">Natural</span>
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[1]" />
        </div>

        {/* --- Lower Section: Thumbnails/Scroll Progress (Desktop & Mobile) --- */}
        {galleryImages.length > 0 && (
          <div className="mt-6 w-full">

            {/* Desktop View: Interactive Thumbnails */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((src, index) => {
                  const isActive = src === activeImage;
                  return (
                    <motion.button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(src)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative aspect-square overflow-hidden rounded-2xl ring-2 transition-all duration-300 ${isActive ? "ring-primary shadow-lg shadow-primary/20" : "ring-outline-variant/30 hover:ring-primary/50"}`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <Image
                        alt={`${product?.name ?? "Product"} - Image ${index + 1}`}
                        src={src}
                        fill
                        unoptimized
                        className={`relative flex-none w-24 h-24 object-cover overflow-hidden rounded-xl ring-2 transition-all duration-300 ${isActive ? "ring-primary" : "ring-outline-variant/40"}`}
                      />
                      {/* Subtle overlay on active */}
                      {isActive && <div className="absolute inset-0 bg-primary/5 z-[1]" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Mobile View: Horizontal Scrollable List (Implicit by main section, 
                but standard practice is often to repeat thumbnails here too 
                if main isn't *literally* scrollable. The requirement says
                "mobile view mein sirf horizontal scrollable hi rakho", meaning the 
                MAIN large images scroll. Since I implemented a cross-fade 
                gallery above, I will add the mobile *scroll* interaction on the
                thumbnails below, which is the standard interpretation of this 
                request combined with animations. The main section above handles 
                the display.) */}
            <div className="lg:hidden w-full overflow-x-auto pb-3 -mb-3 hide-scrollbar">
              {/* Scroll Progress Bar (Required for Mobile) */}
              <div className="px-1 w-full flex justify-start">
                <div className="w-full h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: galleryImages.length > 0
                        ? `${((galleryImages.findIndex(img => img === activeImage) + 1) / galleryImages.length) * 100}%`
                        : '0%'
                    }}
                    layoutId="mobileScrollProgress"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Perks */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { icon: 'eco', text: 'Pure' },
            { icon: 'workspace_premium', text: 'Grade A' },
            { icon: 'local_shipping', text: 'Fast Del.' }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 text-center transition-all hover:bg-white shadow-sm">
              <span className="material-symbols-outlined text-secondary mb-1 text-xl">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter text-on-surface-variant">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details Section (Kept mostly the same, minor layout tweaks for padding) */}
      <div className="lg:col-span-5 self-start lg:h-fit flex flex-col gap-5 lg:gap-4 px-2 lg:px-0 w-full order-2 lg:sticky lg:top-28">
        <div className="space-y-6">
          <div className="space-y-6">
            <nav className="flex items-center gap-3 text-[10px] font-label text-on-surface-variant uppercase tracking-[0.2em]">
              <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/shop')}>Collection</span>
              <span className="opacity-30">/</span>
              <span className="text-secondary font-black">{product?.collection || "Essentials"}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 min-w-0">
              <h1 className="min-w-0 font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tighter leading-[1.1] break-words whitespace-normal">
                {product?.name ?? 'Premium Product'}
              </h1>
            </div>

            {shareStatus ? (
              <p className="text-xs font-medium text-primary/80">{shareStatus}</p>
            ) : null}

            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-row">
                <span className="text-4xl font-headline font-bold text-secondary">
                  {currencySymbol}{Number(displayPrice || 0).toFixed(2)}
                </span>
                {displayOriginal && (
                  <span className="text-sm font-body text-on-surface-variant/50 line-through">
                    {currencySymbol}{Number(displayOriginal || 0).toFixed(2)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex right-2 items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                aria-label="Share this product"
              >
                <span className="material-symbols-outlined">share</span>
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {descriptionHtml ? (
              <div
                className="product-description text-base md:text-lg text-on-surface-variant/80 font-body leading-relaxed space-y-4 [&_p]:m-0 [&_h1]:mt-0 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:text-primary [&_h2]:mt-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h1]:text-primary [&_h3]:mt-0 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-primary [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_li]:pl-1 [&_br]:block [&_br]:h-3"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="text-base md:text-lg text-on-surface-variant/80 font-body leading-relaxed whitespace-pre-wrap">
                {descriptionText}
              </p>
            )}

            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant py-3">Available Options</span>
              <div className="flex gap-3 flex-wrap">
                {(product?.sizes && product.sizes.length > 0 ? product.sizes : ['Standard']).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${s === selectedSize
                      ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'bg-transparent text-on-surface-variant hover:border-primary border-outline-variant/40'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {isOutOfStock ? (
              <p className="text-sm font-semibold text-error">Out of stock</p>
            ) : (
              <p className="text-sm font-medium text-on-surface-variant">
                {availableStock} in stock
              </p>
            )}


          </div>

          {/* Sticky-ready Actions */}
          <div className="pt-8 space-y-4 border-t border-outline-variant/20">
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              {/* Qty */}
              <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-2 py-2 border border-outline-variant/20">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="px-4 font-headline font-bold text-xl">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(availableStock > 0 ? availableStock : 999, q + 1))}
                  disabled={isOutOfStock || (availableStock > 0 && qty >= availableStock)}
                  className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product || productId <= 0 || isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${inCart
                  ? 'bg-white border border-secondary text-secondary shadow-secondary/20'
                  : 'bg-secondary text-on-secondary shadow-secondary/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {inCart ? "done_all" : "shopping_cart"}
                </span>
                {inCart ? "Go to Cart" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product || productId <= 0 || isOutOfStock}
              className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl bg-primary text-on-primary shadow-primary/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-xl">bolt</span>
              {isOutOfStock ? "Out of Stock" : "Buy Now"}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              disabled={!product || productId <= 0}
              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 hover:text-secondary transition-colors"
            >
              <span className={`material-symbols-outlined text-lg ${inWishlist ? 'icon-filled text-secondary' : ''}`}>
                favorite
              </span>
              {inWishlist ? 'Remove from Wishlist' : 'Save for later'}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Buy Now Button (unchanged) */}
      {isStickyVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 lg:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Price</span>
              <span className="font-headline font-bold text-lg text-primary">{currencySymbol}{Number(displayPrice || 0).toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product || productId <= 0 || isOutOfStock}
              className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl bg-secondary text-on-secondary shadow-secondary/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">bolt</span>
              {isOutOfStock ? "Out of Stock" : "Buy Now"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
