import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | STREETRIOT',
  description: 'Read how STREETRIOT collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div data-scroll-section className="pt-25 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <header className="border-b border-[#1c1b1b]/10 pb-6">
          <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-[#b90c1b]">Legal</p>
          <h1 className="font-brand text-5xl md:text-7xl uppercase tracking-tight mt-2">Privacy Policy</h1>
          <p className="font-headline text-xs uppercase tracking-[0.12em] text-[#1c1b1b]/50 mt-3">Last updated: April 05, 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Information We Collect</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            We collect account details, order information, shipping/billing data, and communication preferences when you interact with our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">How We Use Information</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Your information is used to process orders, fulfill shipments, provide customer support, improve product experience, and send transactional updates.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Data Sharing</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            We share only required data with trusted service providers such as payment processors, logistics partners, and infrastructure vendors.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Data Security</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            We maintain technical and organizational safeguards to protect your personal data against unauthorized access, misuse, or disclosure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Your Rights</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            You may request access, correction, or deletion of your personal data by contacting our support team via official channels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Order Cancellation and Returns</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            Orders may be cancelled according to our cancellation policy. Products are non-returnable once delivered.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand text-3xl uppercase tracking-wide">Contact</h2>
          <p className="font-headline text-sm leading-7 text-[#1c1b1b]/75">
            For privacy-related questions, please contact us through the contact page or registered company support email.
          </p>
        </section>
      </div>
    </div>
  );
}
