"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { getWholesaleWhatsAppUrl } from "@/app/lib/whatsapp";

const WHOLESALE_WHATSAPP_URL = getWholesaleWhatsAppUrl();

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/shop", label: "Shop", icon: "storefront" },
  { href: "/user/orders", label: "My Orders", icon: "auto_stories" },
  { href: "/user/wishlist", label: "My Wishlist", icon: "favorite" },
  { href: WHOLESALE_WHATSAPP_URL, label: "Wholesale", icon: "local_shipping", external: true },
];

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { itemCount, isHydrating } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSiteSettings();
  const stableCartCount = isHydrating ? 0 : itemCount;
  const brandName = settings.navbarTitle || settings.siteName || "Amila Gold";
  const brandLogo = settings.logoUrl || "/logo.png";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
  }, [sidebarOpen]);

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 bg-white border-b ${scrolled ? "border-stone-200 shadow-md h-16 md:h-20" : "border-stone-100 h-16 md:h-20"}`}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 flex-col items-start justify-center gap-[6px] group">
            <span className="block h-[2px] rounded-full bg-stone-900 transition-all duration-300 w-6 group-hover:bg-amber-600 group-hover:w-7" />
            <span className="block h-[2px] rounded-full bg-stone-900 transition-all duration-300 w-4 group-hover:bg-amber-600" />
            <span className="block h-[2px] rounded-full bg-stone-900 transition-all duration-300 w-6 group-hover:bg-amber-600 group-hover:w-7" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            {brandLogo && <Image src={brandLogo} alt="Logo" width={36} height={36} className="h-8 w-8 md:h-10 md:w-10 object-contain" unoptimized />}
            <span className="font-headline text-xl md:text-2xl font-black text-stone-900 tracking-tight group-hover:text-amber-600 transition-colors">{brandName}</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6 text-stone-900">
            <Link href="/search" className="hover:text-amber-600 transition-colors"><span className="material-symbols-outlined text-[24px] md:text-[26px]">search</span></Link>
            <Link href="/cart" className="relative hover:text-amber-600 transition-colors" data-cart-target>
              <span className="material-symbols-outlined text-[24px] md:text-[26px]">shopping_bag</span>
              {stableCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">{stableCartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Sidebar Overlay ── */}
      <div className={`fixed inset-0 z-[200] ${sidebarOpen ? "visible" : "invisible"} transition-all duration-500`}>
        
        {/* Backdrop: Darker with more blur for high-end look */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-stone-900/40 backdrop-blur-md transition-opacity duration-700 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
        />

        {/* Sidebar Panel: Slick bounce-out effect */}
        <aside
          className={`absolute left-0 top-0 h-full w-[85vw] max-w-[380px] bg-white flex flex-col shadow-[25px_0_50px_-12px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          data-lenis-prevent
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Image src={brandLogo} alt="Logo" width={28} height={28} className="object-contain" unoptimized />
              </div>
              <span className="font-headline text-xl font-black text-stone-900">{brandName}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation with staggered animation */}
          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar" data-lenis-prevent>
            <div className="space-y-1.5">
              {NAV_LINKS.map((link, i) => {
                const isExternal = 'external' in link;
                const Content = (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-50 group-hover:bg-amber-100 transition-colors">
                      <span className="material-symbols-outlined text-[22px] text-stone-500 group-hover:text-amber-600">{link.icon}</span>
                    </div>
                    <span className="font-headline text-[17px] font-bold">{link.label}</span>
                    <span className="ml-auto material-symbols-outlined text-stone-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">chevron_right</span>
                  </>
                );

                return isExternal ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setSidebarOpen(false)}
                    style={{ transitionDelay: sidebarOpen ? `${i * 40 + 50}ms` : '0ms' }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-stone-700 hover:bg-stone-50 transition-all duration-500 group ${sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                  >
                    {Content}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    style={{ transitionDelay: sidebarOpen ? `${i * 40 + 50}ms` : '0ms' }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-stone-700 hover:bg-stone-50 transition-all duration-500 group ${sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                  >
                    {Content}
                  </Link>
                );
              })}
            </div>

            <div className="my-6 border-t border-stone-100 mx-4" />

            {/* Profile Section */}
            <Link
              href={isAuthenticated ? "/user/profile" : "/user/auth"}
              onClick={() => setSidebarOpen(false)}
              style={{ transitionDelay: sidebarOpen ? `${NAV_LINKS.length * 40 + 50}ms` : '0ms' }}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl bg-amber-50 text-amber-900 mb-2 transition-all duration-500 ${sidebarOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <span className="material-symbols-outlined text-amber-600">{isAuthenticated ? 'person' : 'login'}</span>
              <span className="font-headline font-bold">{isAuthenticated ? 'Account Settings' : 'Sign In / Register'}</span>
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => { logout(); setSidebarOpen(false); }}
                style={{ transitionDelay: sidebarOpen ? `${(NAV_LINKS.length + 1) * 40 + 50}ms` : '0ms' }}
                className={`flex items-center gap-4 px-4 py-3 w-full text-stone-500 hover:text-red-600 transition-all duration-500 ${sidebarOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-headline font-semibold">Logout</span>
              </button>
            )}
          </nav>

          {/* Footer */}
          <div className="p-8 bg-stone-50/50 mt-auto">
            <div className="flex justify-center gap-4 mb-4">
               {/* Add social icons here if needed */}
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold text-center leading-relaxed">
              Crafted with Excellence <br />
              <span className="text-amber-600/60">© {brandName} {new Date().getFullYear()}</span>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
