'use client';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';

export default function ShippingPage() {
  const { settings } = useSiteSettings();
  const supportEmail = settings.companyEmail || 'support@example.com';
  const supportPhone = settings.companyPhone || '+91 00000 00000';
  return (
    <div data-scroll-section className="pt-20 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <header className="border-b border-[#1c1b1b]/10 pb-6">
          <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-[#b90c1b]">Shipping</p>
          <h1 className="font-brand text-5xl md:text-7xl uppercase tracking-tight mt-2">Shipping Policy</h1>
          <p className="font-headline text-xs uppercase tracking-[0.12em] text-[#1c1b1b]/50 mt-3">Last updated: April 05, 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Delivery Regions & Carriers</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            We ship across India using trusted logistics partners. Carrier selection depends on destination and service availability.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Shipping Costs</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Shipping is calculated at checkout and shown clearly before payment. Some promotional orders may qualify for free shipping.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Estimated Delivery Times</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Standard deliveries usually arrive within 3-7 business days. Remote regions may take longer due to carrier schedules.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Order Tracking</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            After shipping, you'll receive a tracking number by email or SMS. Use the tracking link sent by carrier to follow your shipment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Damages and Missing Items</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Please inspect your package upon delivery. Report missing or damaged items within 48 hours at <a className="text-primary font-bold" href={`mailto:${supportEmail}`}>{supportEmail}</a> or <a className="text-primary font-bold" href={`tel:${supportPhone.replace(/\s+/g, '')}`}>{supportPhone}</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Cancellations and Returns</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Orders can be cancelled as per our cancellation terms. Delivered products are non-returnable.
          </p>
        </section>
      </div>
    </div>
  );
}
