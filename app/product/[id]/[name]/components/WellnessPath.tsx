"use client";
import SymbolIcon from "@/app/components/icons/SymbolIcon";
import React from "react";

export default function WellnessPath() {
  return (
    <section className="mt-14 lg:mt-24 pb-8 border-b border-outline-variant/20">
      <h3 className="font-headline text-4xl font-bold text-primary mb-3 lg:mb-12 text-center">The Amila Wellness Path</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-surface-container-low p-4 lg:p-8 rounded-3xl space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all">
          <SymbolIcon name={"health_and_safety"} className="text-3xl text-secondary" />
          <h4 className="font-bold text-lg text-on-surface">Respiratory Detox</h4>
          <p className="text-on-surface-variant text-sm leading-relaxed font-body">
            Naturally clears bronchial tracts and lungs, acting as a traditional remedy against environmental pollutants.
          </p>
        </div>
        <div className="bg-surface-container-low p-4 lg:p-8 rounded-3xl space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all">
          <SymbolIcon name={"bolt"} className="text-3xl text-secondary" />
          <h4 className="font-bold text-lg text-on-surface">Sustained Vitality</h4>
          <p className="text-on-surface-variant text-sm leading-relaxed font-body">
            Complex molecular structure ensures a slow release of energy, preventing the dreaded "sugar crash."
          </p>
        </div>
        <div className="bg-surface-container-low p-4 lg:p-8 rounded-3xl space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all">
          <SymbolIcon name={"vital_signs"} className="text-3xl text-secondary" />
          <h4 className="font-bold text-lg text-on-surface">Mineral Dense</h4>
          <p className="text-on-surface-variant text-sm leading-relaxed font-body">
            Unlike white sugar, our jaggery retains iron, magnesium, and potassium vital for blood health.
          </p>
        </div>
        <div className="bg-surface-container-low p-4 lg:p-8 rounded-3xl space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all">
          <SymbolIcon name={"vital_signs"} className="text-3xl text-secondary" />
          <h4 className="font-bold text-lg text-on-surface">Digestive Aid</h4>
          <p className="text-on-surface-variant text-sm leading-relaxed font-body">
            Activates digestive enzymes in the body, making it the perfect post-meal ritual for gut health.
          </p>
        </div>
      </div>
    </section>
  );
}
