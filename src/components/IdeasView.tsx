"use client";

import React from "react";
import { PersonalizedIdeas } from "@/lib/validation/schemas";
import {
  Sparkles,
  Utensils,
  Palette,
  PartyPopper,
  HeartHandshake,
} from "lucide-react";

interface IdeasViewProps {
  ideas: PersonalizedIdeas;
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
}

export function IdeasView({
  ideas,
  dietaryRestrictions,
  accessibilityNeeds,
}: IdeasViewProps) {
  return (
    <div className="space-y-6">
      {/* Theme Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg space-y-2">
        <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Curated Event Concept</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {ideas.theme}
        </h3>
        <p className="text-sm text-blue-100 max-w-2xl">
          Personalized aesthetic, menu, and experiential blueprint tailored
          directly to your guest requirements and location.
        </p>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decor & Ambience */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-pink-600 dark:text-pink-400">
            <Palette className="w-5 h-5" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Decor & Ambient Styling
            </h4>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {ideas.decorIdeas.map((idea, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-pink-500 font-bold shrink-0">•</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu & Beverage */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <Utensils className="w-5 h-5" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Menu & Beverage Program
              </h4>
            </div>
            {dietaryRestrictions.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {dietaryRestrictions.join(", ")}
              </span>
            )}
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {ideas.menuHighlights.map((menu, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>{menu}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activities & Program */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
            <PartyPopper className="w-5 h-5" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Guest Activities & Entertainment
            </h4>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {ideas.activitySuggestions.map((act, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold shrink-0">•</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Inclusivity & Universal Design */}
        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
              <HeartHandshake className="w-5 h-5" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Universal Accessibility & Inclusivity
              </h4>
            </div>
            {accessibilityNeeds.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                {accessibilityNeeds.length} Accommodations
              </span>
            )}
          </div>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {ideas.inclusiveNotes.map((note, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
