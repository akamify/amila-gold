"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  subscribeNewsletter,
} from "@/app/lib/apiClient";




// ----------------------------------------------------------------------
// 1. The Slow Craft Section
// ----------------------------------------------------------------------
function SlowCraftSection() {
  const steps = [
    {
      num: "01",
      title: "Sustainable Harvest",
      desc: "We source exclusively from heirloom cane fields that use bio-dynamic farming practices, preserving the earth for tomorrow.",
    },
    {
      num: "02",
      title: "Gentle Reduction",
      desc: "Juices are reduced in traditional copper vats over a slow fire to preserve enzyme integrity and deep, complex flavor notes.",
    },
    {
      num: "03",
      title: "Sun-Setting",
      desc: "Natural cooling and setting processes ensure the unique, melt-in-your-mouth crystalline texture of Amila Gold.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-primary text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Enhanced Staggered Image Grid */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-3xl -z-10"></div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 items-center">
              <div className="space-y-4 md:space-y-6">
                <div className="h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeFZU1V0Q0g6matd53b4eGuvPJpsi51ntmAL8GqGhXx7gX1ONMZElOZIc9_CWVNe8lcV0YomSyncG5C5n85sQ22LoNmOwuMtT3MXF6uHWHr7T9Tek6v2xjFHa6ye6-GdV0oeeHGWEi1e2EEaNSP_yu3oVRdR0Gf_hHQlLkfZDaBYwM_dGyMn2FeWlDB9v0uPdZiV9cE66_p1RnDMQhy79E3TE3qnUtNOrDTW2-F7e7WkPcDfrBy-EJLQ1SXYvdQ59X8GDcHvySnSg"
                    alt="Artisan pressing sugarcane"
                    width={800}
                    height={1000}
                    loading="lazy"
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="h-48 md:h-56 rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-QCR-oUojk-vTpDynSAcSpNPVjQWJLDmmBqb7ILfJCSW_Moh6IXJB2W3k1XKBQ3q6JuSU8-saSR4Iep1LvmBDLB9fXwT_0pUKTJBhXjPKBbTqHI5K_Mn-27uhJzA4ACJbZmn9yyTRZZGXYoy539ejX35Annocovp-1rJEaoXhlwxQXleFv5fX7kxvo4zhoX19Sn6rSKeAOtfL-3J7COxVSrqZuFZHmLZbmE2-eHCi7cESeeJjaspD1Koi1VJLj_wd4N8Xkpe3xyo"
                    alt="Copper vats boiling cane juice"
                    width={800}
                    height={1000}
                    loading="lazy"
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="space-y-4 md:space-y-6 pt-16 md:pt-24">
                <div className="h-48 md:h-56 rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBregqSUMJ0lt-VYUYK2XGTS4MnzTwsTQU5hYFZaV7CbZEyXwMjZH_AyH3LcnOD7DVipoNKr0g-TLdQ2OeRUFjjmdrmJKH6E2RzyVmIKndt4ad6bflv1MMX3nwCwhEUsMJDbM5_r2mVr_0TOrvDazmcD_BP8WhjX5dQ-vT0BnoioWC9BdfxxpkF09vYLwE9iys7QCvoSVVfLOriHCkiYSeD5RjAd8afFMfbYQs7zZhEu8EelS0kTSsw66ML8-io8Kp5kuqoQDGpz5c"
                    alt="Jaggery crystals drying"
                    width={800}
                    height={1000}
                    loading="lazy"
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-2z1dIigqEBYNJuzA_d5P4XiqmlBm3djIsa_mIZxua1FX5wTpi_-_qbCaM85WuFX_NHUr56w868SFwcrRuinbc8xFDx7vB70lXBFpimL4GcJ3Hr2O-GvfuaoDbXzQLU4CrjDAtartUEP19NKHCbYgguWYHs9Y30jspsFgnwvgPah3TisIMry62W8JoUZhTILGObXhlsgDMUQ-sc43-dogRjNw8fiItJnfyUIDrHEo-qJSp9IJbWcRX8vUQNfC28mO9gM9fslOEvo"
                    alt="Modern kitchen with jaggery"
                    width={800}
                    height={1000}
                    loading="lazy"
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Text Content */}
          <div className="order-1 lg:order-2">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-[1px] w-10 bg-secondary"></span>
              <span className="font-sans text-secondary uppercase tracking-[0.2em] text-xs font-bold">
                Alchemy of the Soil
              </span>
            </div>

            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl mb-12 text-white leading-tight">
              The <span className="italic text-secondary">Slow</span> Craft
            </h2>

            <div className="space-y-10 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[1.15rem] top-4 bottom-4 w-[2px] bg-white/20 -z-10 hidden md:block"></div>

              {steps.map((step) => (
                <div key={step.num} className="flex gap-6 md:gap-8 group">
                  <div className="bg-primary mt-1">
                    <span className="font-headline text-3xl md:text-4xl text-secondary/40 group-hover:text-secondary transition-colors duration-300 font-bold block bg-primary">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {step.title}
                    </h4>
                    <p className="text-white/80 leading-relaxed font-light text-lg">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------
// 2. Testimonials Section
// ----------------------------------------------------------------------

  
// ----------------------------------------------------------------------
// 3. Newsletter CTA Section
// ----------------------------------------------------------------------
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setStatusType("error");
      setStatusMessage("Please enter your email.");
      return;
    }
    try {
      setIsSubmitting(true);
      setStatusMessage("");
      setStatusType("");
      await subscribeNewsletter(normalizedEmail, "homepage");
      setStatusType("success");
      setStatusMessage("Welcome to the circle. Check your inbox.");
      setEmail("");
    } catch (subscribeError) {
      setStatusType("error");
      setStatusMessage(
        subscribeError instanceof Error
          ? subscribeError.message
          : "Could not subscribe right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 lg:py-24 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-secondary-container rounded-[2.5rem] px-6 py-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Glowing Orbs adapted to theme */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-on-secondary-container mb-6 leading-tight">
              Join the <span className="italic">Harvest</span> Circle
            </h2>
            <p className="text-on-secondary-container/80 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto">
              Receive seasonal updates on our harvest schedules, exclusive
              early-batch releases, and stories straight from the soil.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-surface-container-lowest border border-primary/10 rounded-full px-8 py-4 focus:ring-2 focus:ring-primary text-primary placeholder:text-on-surface-variant outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-60 shadow-lg"
              >
                {isSubmitting ? "Joining..." : "Subscribe"}
              </button>
            </form>

            {statusMessage && (
              <div
                className={`mt-6 inline-block px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold backdrop-blur-md ${
                  statusType === "error"
                    ? "bg-error/10 text-error border border-error/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { SlowCraftSection, NewsletterSection };
