"use client";

import React from "react";
import Link from "next/link";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { getWholesaleWhatsAppUrl } from "@/app/lib/whatsapp";
import { Mail, Phone, MapPin, type LucideIcon } from "lucide-react";

const WHOLESALE_WHATSAPP_URL = getWholesaleWhatsAppUrl();

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type SocialItem = {
  label: string;
  href?: string | null;
  icon: "facebook" | "instagram" | "youtube";
};

const footerLinks: Record<string, FooterLinkItem[]> = {
  Links: [
    { label: "Our Products", href: "/shop" },
    { label: "My Orders", href: "/user/orders" },
    { label: "My Wishlist", href: "/user/wishlist" },
  ],
  Support: [
    { label: "Shipping", href: "/shipping" },
    { label: "Contact", href: "/contact" },
    { label: "Wholesale", href: WHOLESALE_WHATSAPP_URL, external: true },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
};

function SocialSvg({
  type,
  className,
}: {
  type: SocialItem["icon"];
  className?: string;
}) {
  const baseProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  if (type === "facebook") {
    return (
      <svg {...baseProps}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }

  if (type === "instagram") {
    return (
      <svg {...baseProps}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...baseProps}>
      <path d="M22 8.5s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1-3.1-.2-7.8-.2-7.8-.2h-.1s-4.7 0-7.8.2c-.4.1-1.3.1-2.1 1-.6.7-.8 2.3-.8 2.3S0 10.4 0 12v.1c0 1.6.2 3.5.2 3.5s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.6.2 7.6.2s4.7 0 7.8-.2c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.3.8-2.3s.2-1.9.2-3.5V12c0-1.6-.2-3.5-.2-3.5z" />
      <path d="M10 15.5V8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SocialLink({
  item,
}: {
  item: SocialItem;
}) {
  if (!item.href) return null;

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={item.label}
      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#F7F5F0]/60 hover:text-[#EBBB59] hover:border-[#EBBB59] transition-all duration-300"
    >
      <SocialSvg type={item.icon} />
    </a>
  );
}

export default function Footer() {
  const { settings } = useSiteSettings();
  const brandName = settings.footerTitle || settings.siteName || "Amila Gold";

  const socialLinks: SocialItem[] = [
    { icon: "facebook", href: settings.facebookUrl, label: "Facebook" },
    { icon: "instagram", href: settings.instagramUrl, label: "Instagram" },
    { icon: "youtube", href: settings.youtubeUrl, label: "YouTube" },
  ];

  return (
    <footer className="relative bg-[#153421] text-[#F7F5F0] rounded-t-[2.5rem] md:rounded-t-[4rem] mt-20 overflow-hidden font-sans" data-site-footer>
      <div
        data-footer-sentinel
        className="absolute left-0 top-0 h-px w-full pointer-events-none opacity-0"
        aria-hidden="true"
      />
      <div className="container mx-auto px-6 py-16 lg:px-12 lg:py-24 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4 flex flex-col items-start">
            <span className="font-serif text-3xl md:text-4xl text-[#EBBB59] italic mb-6">
              {brandName}
            </span>

            <p className="text-[#F7F5F0]/70 text-base leading-relaxed mb-8 max-w-sm">
              {settings.footerDescription ||
                "Forging the future of urban streetwear. Precision engineered, culturally driven, and globally distributed."}
            </p>

            <div className="flex gap-5 mb-8">
              {socialLinks.map((item) => (
                <SocialLink key={item.label} item={item} />
              ))}
            </div>

            <div className="space-y-3 mt-auto">
              {settings.companyEmail && (
                <div className="flex items-center gap-3 text-sm text-[#F7F5F0]/60 hover:text-[#F7F5F0] transition-colors">
                  <Mail size={14} className="text-[#EBBB59]" />
                  <span>{settings.companyEmail}</span>
                </div>
              )}

              {settings.companyPhone && (
                <div className="flex items-center gap-3 text-sm text-[#F7F5F0]/60 hover:text-[#F7F5F0] transition-colors">
                  <Phone size={14} className="text-[#EBBB59]" />
                  <span>{settings.companyPhone}</span>
                </div>
              )}

              {settings.companyAddress && (
                <div className="flex items-start gap-3 text-sm text-[#F7F5F0]/60">
                  <MapPin size={14} className="text-[#EBBB59] mt-1 shrink-0" />
                  <span className="leading-snug">{settings.companyAddress}</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-12 lg:pl-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-6">
                <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#EBBB59]/80">
                  {category}
                </span>

                <ul className="flex flex-col gap-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#F7F5F0]/60 hover:text-[#F7F5F0] hover:translate-x-1 inline-block transition-all duration-300 text-sm font-medium"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[#F7F5F0]/60 hover:text-[#F7F5F0] hover:translate-x-1 inline-block transition-all duration-300 text-sm font-medium"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/10">
        <div className="container mx-auto px-6 py-8 lg:px-12 flex flex-col lg:flex-row justify-between items-center gap-6 max-w-7xl">
          <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-[#F7F5F0]/40 text-center lg:text-left">
            © 2026 <span className="text-[#F7F5F0]/60">{brandName}</span>. The Modern Agrarian.
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#F7F5F0]/30 font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#EBBB59]/40" />
              Handmade in the valley of India
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#EBBB59]/40" />
              Ethically Sourced
            </span>
          </div>
          <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-[#F7F5F0]/40 text-center lg:text-left">
            Developed by <span className="text-[#F7F5F0]/60 font-bold">Akamify</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
