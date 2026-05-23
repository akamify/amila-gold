'use client';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';

export default function TermsOfServicePage() {
  const { settings } = useSiteSettings();
  const brandName = settings.siteName || 'STREETRIOT';
  const legalEmail = settings.companyEmail || 'support@example.com';

  return (
    <div data-scroll-section className="pt-25 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <header className="border-b border-[#1c1b1b]/10 pb-6">
          <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-[#b90c1b]">Legal</p>
          <h1 className="font-brand text-5xl md:text-7xl uppercase tracking-tight mt-2">Terms of Service</h1>
          <p className="font-headline text-xs uppercase tracking-[0.12em] text-[#1c1b1b]/50 mt-3">Last updated: April 05, 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Acceptance of Terms</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            By using this website, you agree to these terms and all applicable policies referenced by {brandName}.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Orders and Payments</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Orders are confirmed after successful payment authorization and are subject to product availability and verification checks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Shipping and Delivery</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Delivery timelines are estimated and can vary based on destination, carrier operations, and external logistics constraints.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Returns and Refunds</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Orders may be cancelled as allowed under the active cancellation policy. Products are non-returnable after delivery.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Intellectual Property</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            All content, branding, product assets, and design elements are owned by {brandName} and protected under applicable laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Contact</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            For legal concerns related to these terms, please contact us at <a className="text-primary font-bold" href={`mailto:${legalEmail}`}>{legalEmail}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
