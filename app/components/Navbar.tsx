"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { getWholesaleWhatsAppUrl } from "@/app/lib/whatsapp";

type NavLink = {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
};

const WHOLESALE_WHATSAPP_URL = getWholesaleWhatsAppUrl();

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/shop", label: "Shop", icon: "storefront" },
  { href: "/user/orders", label: "My Orders", icon: "inventory_2" },
  { href: "/user/wishlist", label: "Wishlist", icon: "favorite" },
  {
    href: WHOLESALE_WHATSAPP_URL,
    label: "Wholesale",
    icon: "local_shipping",
    external: true,
  },
];

const DESKTOP_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/shop", label: "Shop", icon: "storefront" },
  { href: "/user/orders", label: "Orders", icon: "inventory_2" },
  { href: "/user/wishlist", label: "Wishlist", icon: "favorite" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { itemCount, isHydrating } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const { settings } = useSiteSettings();

  const stableCartCount = isHydrating ? 0 : itemCount;
  const brandName = settings?.navbarTitle || settings?.siteName || "Amila Gold";
  const brandLogo = settings?.logoUrl || "/logo.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-[100] border-b font-sans transition-all duration-300 ${
          scrolled
            ? "h-16 border-stone-200 bg-white/95 shadow-md backdrop-blur-xl md:h-20"
            : "h-16 border-transparent bg-white/85 backdrop-blur-xl md:h-20"
        }`}
      >
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Left: Mobile menu only, Desktop menu + brand */}
          <div className="relative z-20 flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 active:scale-95 sm:h-11 sm:w-11"
            >
              <span className="relative block h-4 w-5">
                <span className="absolute left-0 top-0 block h-[2px] w-5 rounded-full bg-current transition-all duration-300 group-hover:w-4 group-hover:text-emerald-800" />
                <span className="absolute left-0 top-[7px] block h-[2px] w-3.5 rounded-full bg-current transition-all duration-300 group-hover:w-5 group-hover:text-emerald-800" />
                <span className="absolute bottom-0 left-0 block h-[2px] w-5 rounded-full bg-current transition-all duration-300 group-hover:w-4 group-hover:text-emerald-800" />
              </span>
            </button>

            {/* Desktop brand only */}
            <Link
              href="/"
              aria-label={`${brandName} home`}
              className="group hidden min-w-0 items-center gap-2 lg:flex"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-stone-200 transition-all duration-300 group-hover:ring-emerald-200">
                <Image
                  src={brandLogo}
                  alt={`${brandName} logo`}
                  width={44}
                  height={44}
                  className="h-9 w-9 object-contain"
                  unoptimized
                  priority
                />
              </span>

              <span className="block max-w-[190px] truncate text-xl font-bold tracking-[-0.03em] text-black transition-all duration-300 group-hover:text-emerald-800">
                {brandName}
              </span>
            </Link>
          </div>

          {/* Mobile/Tablet centered logo + brand */}
          <Link
            href="/"
            aria-label={`${brandName} home`}
            className="absolute left-1/2 top-1/2 z-10 flex max-w-[52vw] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 text-center lg:hidden"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-stone-200 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <Image
                src={brandLogo}
                alt={`${brandName} logo`}
                width={40}
                height={40}
                className="h-6.5 w-6.5 object-contain sm:h-7 sm:w-7 md:h-8 md:w-8"
                unoptimized
                priority
              />
            </span>

            <span className="block min-w-0 truncate text-base font-bold tracking-[-0.04em] text-black transition-colors duration-300 hover:text-emerald-800 sm:text-lg md:text-xl">
              {brandName}
            </span>
          </Link>

          {/* Center: Desktop Links */}
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <div className="pointer-events-auto flex items-center rounded-full border border-stone-200 bg-white/90 p-1.5 shadow-sm backdrop-blur-xl">
              {DESKTOP_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium tracking-[-0.01em] transition-all duration-300 ${
                      active
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="relative z-20 flex items-center justify-end gap-1 sm:gap-2">
            <a
              href={WHOLESALE_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold tracking-[-0.01em] text-amber-900 ring-1 ring-amber-200 transition-all duration-300 hover:bg-amber-100 hover:ring-amber-300 xl:flex"
            >
              <span className="material-symbols-outlined text-[18px]">
                local_shipping
              </span>
              Wholesale
            </a>

            <Link
              href="/search"
              aria-label="Search products"
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-900 transition-all duration-300 hover:bg-stone-100 hover:text-emerald-800 active:scale-95 sm:h-11 sm:w-11"
            >
              <span className="material-symbols-outlined text-[24px]">
                search
              </span>
            </Link>

            <Link
              href="/cart"
              aria-label={
                stableCartCount > 0
                  ? `Cart, ${stableCartCount} items`
                  : "Cart"
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-900 transition-all duration-300 hover:bg-stone-100 hover:text-emerald-800 active:scale-95 sm:h-11 sm:w-11"
              data-cart-target
            >
              <span className="material-symbols-outlined text-[24px]">
                shopping_bag
              </span>

              {stableCartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black leading-none text-stone-950 shadow-sm ring-2 ring-white">
                  {stableCartCount > 99 ? "99+" : stableCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-[200] font-sans transition-all duration-500 ${
          sidebarOpen ? "visible" : "invisible"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-stone-950/45 backdrop-blur-md transition-opacity duration-500 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          data-lenis-prevent
          className={`absolute left-0 top-0 flex h-full w-[88vw] max-w-[410px] flex-col overflow-hidden rounded-r-[2rem] bg-[#FFFCF6] shadow-2xl transition-transform duration-500 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-br from-white via-amber-50 to-emerald-50 px-6 py-7">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-200/35 blur-2xl" />
            <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-amber-100">
                  <Image
                    src={brandLogo}
                    alt={`${brandName} logo`}
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                    unoptimized
                  />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-xl font-bold tracking-[-0.03em] text-black">
                    {brandName}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
                    Pure & Authentic
                  </span>
                </span>
              </Link>

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-stone-500 shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:text-stone-950 active:scale-95"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/75 px-2 py-3 text-center shadow-sm ring-1 ring-white/80">
                <span className="material-symbols-outlined text-[20px] text-emerald-800">
                  eco
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-stone-600">
                  Natural
                </span>
              </div>

              <div className="rounded-2xl bg-white/75 px-2 py-3 text-center shadow-sm ring-1 ring-white/80">
                <span className="material-symbols-outlined text-[20px] text-emerald-800">
                  verified
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-stone-600">
                  Trusted
                </span>
              </div>

              <div className="rounded-2xl bg-white/75 px-2 py-3 text-center shadow-sm ring-1 ring-white/80">
                <span className="material-symbols-outlined text-[20px] text-emerald-800">
                  local_shipping
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-stone-600">
                  Wholesale
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Links */}
          <nav
            className="flex-1 overflow-y-auto px-4 py-5"
            data-lenis-prevent
            aria-label="Main navigation"
          >
            <div className="space-y-1.5">
              {NAV_LINKS.map((link) => {
                const active =
                  !link.external && isActivePath(pathname, link.href);

                const itemClass = `group flex items-center gap-4 rounded-3xl px-3 py-3 transition-all duration-300 ${
                  active
                    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100"
                    : "text-stone-700 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-stone-100"
                }`;

                const content = (
                  <>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                        active
                          ? "bg-emerald-700 text-white"
                          : "bg-white text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {link.icon}
                      </span>
                    </span>

                    <span className="text-[17px] font-semibold tracking-[-0.01em]">
                      {link.label}
                    </span>

                    <span className="material-symbols-outlined ml-auto text-stone-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-amber-600">
                      {link.external ? "open_in_new" : "chevron_right"}
                    </span>
                  </>
                );

                if (link.external) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSidebarOpen(false)}
                      className={itemClass}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={itemClass}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

            <Link
              href={isAuthenticated ? "/user/profile" : "/user/auth"}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-4 rounded-3xl bg-stone-950 px-4 py-4 text-white shadow-lg shadow-stone-950/10 transition-all duration-300 hover:bg-emerald-900"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <span className="material-symbols-outlined text-amber-300">
                  {isAuthenticated ? "person" : "login"}
                </span>
              </span>

              <span className="min-w-0">
                <span className="block text-base font-semibold tracking-[-0.01em]">
                  {isAuthenticated ? "Account Settings" : "Sign In / Register"}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-white/60">
                  {isAuthenticated
                    ? "Manage profile and orders"
                    : "Login to track your orders"}
                </span>
              </span>

              <span className="material-symbols-outlined ml-auto text-white/50">
                chevron_right
              </span>
            </Link>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-4 rounded-3xl px-4 py-3 text-left font-semibold text-stone-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-stone-100 bg-white/65 px-6 py-5">
            <a
              href={WHOLESALE_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSidebarOpen(false)}
              className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-stone-950 shadow-sm transition-all duration-300 hover:bg-amber-400 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">
                support_agent
              </span>
              Bulk Order on WhatsApp
            </a>

            <p className="text-center text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-stone-400">
              Crafted with Excellence
              <br />
              <span className="text-emerald-700/70">
                © {brandName} {new Date().getFullYear()}
              </span>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}