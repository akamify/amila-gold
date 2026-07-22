"use client";
import SymbolIcon from "@/app/components/icons/SymbolIcon";
import React from "react";
import type { Product } from '@/app/data/products';

export default function NutritionFacts({ product }: { product?: Product | null }) {
  const description = product?.description ?? 'No description available.';
  const ingredients = Array.isArray(product?.ingredients) && product.ingredients.length > 0
    ? product.ingredients
    : (Array.isArray(product?.details) ? product.details : [])
      .map((item) => {
        const [key, ...rest] = String(item).split(':');
        return { key: String(key || 'Details').trim(), value: String(rest.join(':') || '—').trim() || '—' };
      })
      .filter((item) => item.key || item.value);
  const nutritions = Array.isArray(product?.nutritions) && product.nutritions.length > 0
    ? product.nutritions
    : (Array.isArray(product?.details) ? product.details : [])
      .map((item) => {
        const [key, ...rest] = String(item).split(':');
        return { key: String(key || 'Nutrient').trim(), value: String(rest.join(':') || '—').trim() || '—' };
      })
      .filter((item) => item.key || item.value);
  const safeIngredients = ingredients.length > 0 ? ingredients : [{ key: 'Ingredients', value: 'Not available' }];
  const safeNutritions = nutritions.length > 0 ? nutritions : [{ key: 'Nutrition', value: 'Not available' }];

  return (
    <section className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-8 border-b border-outline-variant/20">
      <div className="space-y-8">
        <h3 className="font-headline text-4xl font-bold text-primary">Ingredients & Purity</h3>
        <p className="text-on-surface leading-relaxed text-lg font-body">
          {description}
        </p>
        <div className="space-y-4">
          {safeIngredients.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-outline-variant/30">
              <span className="font-bold text-on-surface font-body">{d.key}</span>
              <span className="text-secondary font-headline italic font-bold">{d.value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="bg-primary/5 p-6 rounded-2xl border-l-[4px] border-primary flex items-start gap-4">
          <SymbolIcon name={"format_quote"} className="text-primary" />
          <span className="italic text-primary font-body text-sm leading-relaxed">
            "Our traditional clarification process uses gentle techniques to preserve the product's nutritional profile."
          </span>
        </div>
      </div>
      
      <div className="bg-surface-container-highest p-8 rounded-[2.5rem] shadow-sm">
        <h4 className="font-headline text-2xl font-bold text-primary mb-6">Nutrition Facts</h4>
        <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-4 font-bold">Per 100g Serving</div>
        <div className="space-y-4 font-label text-sm">
          {safeNutritions.slice(0, 5).map((d, idx) => (
            <div key={idx} className="flex justify-between border-b border-outline-variant/40 pb-3">
              <span className="font-bold text-on-surface">{d.key}</span>
              <span>{d.value || '—'}</span>
            </div>
          ))}
          <div className="mt-6 text-[10px] text-on-surface-variant italic font-body">
            *Daily Value (DV) based on a 2000 calorie diet.
          </div>
        </div>
      </div>
    </section>
  );
}
