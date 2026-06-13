"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useRequireAuth } from "@/app/context/AuthContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  useRequireAuth('/user/auth');
  const isAuthPage = pathname?.startsWith('/user/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-headline italic">Loading...</div>
      </main>
    );
  }

  const links = [
    { href: "/user/profile", label: "Personal Info", shortLabel: "Profile", icon: "person" },
    { href: "/user/shipping", label: "Shipping Addresses", shortLabel: "Shipping", icon: "local_shipping" },
    { href: "/user/orders", label: "Order History", shortLabel: "Orders", icon: "history" },
    { href: "/user/wishlist", label: "My Wishlist", shortLabel: "Wishlist", icon: "loyalty" },
  ];

  return (
    <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-15 flex flex-col md:flex-row gap-8 md:gap-12 pb-5 md:pb-15 min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 md:space-y-12">
        <div className="md:sticky top-32">
          {/* <div className="mb-4 md:mb-8">
            <h1 className="font-headline text-3xl lg:text-4xl font-bold italic tracking-tight text-primary mb-2">
              Welcome, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-on-surface-variant text-xs lg:text-sm font-label uppercase tracking-wider">{user?.email}</p>
          </div> */}
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-col gap-6">
            {links.map((link) => {
              const active = pathname?.includes(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 transition-all pl-5 border-l-4 ${
                    active
                      ? "text-primary font-semibold border-secondary"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  <span
                    className="material-symbols-outlined scale-90"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {link.icon}
                  </span>
                  <span className="font-label text-xs lg:text-sm uppercase tracking-[0.15em]">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block pt-8 mt-4 border-t border-outline-variant/30">
            <button
              onClick={logout}
              className="flex items-center gap-3 text-error font-label text-xs uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity pl-5"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 w-full">
        {children}
      </section>

      {/* Mobile Bottom Navigation Tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <nav className="flex items-center justify-around px-2 py-2">
          {links.map((link) => {
            const active = pathname?.includes(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex p-2 rounded-[2px] transition-all flex-1 ${
                  active ? "text-primary" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <div className={`relative px-4 py-1 rounded-[3px] overflow-hidden transition-colors ${active ? 'bg-secondary' : 'bg-transparent'}`}>
                  <span
                    className={`material-symbols-outlined text-[20px] relative z-10 transition-colors ${active ? 'text-primary' : ''}`}
                    style={active ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                  >
                    {link.icon}
                  </span>
                </div>
                {/* <span className={`text-[10px] font-label uppercase tracking-widest transition-all ${active ? "font-bold text-primary" : "font-medium"}`}>
                  {link.shortLabel}
                </span> */}
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
