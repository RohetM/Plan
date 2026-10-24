"use client";

import React from "react";
import {
  ShieldAlert,
  Clock,
  Download,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface HeaderProps {
  onOpenIntake: () => void;
  onOpenDayOf: () => void;
  onOpenExport: () => void;
  onSelectPreset: (presetKey: string) => void;
  activeScenario?: string;
}

export function Header({
  onOpenIntake,
  onOpenDayOf,
  onOpenExport,
  onSelectPreset,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Plan-B
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Stress-Tester
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              GenAI Event Planner + Crisis Resilience Engine
            </p>
          </div>
        </div>

        {/* Quick Persona Presets */}
        <div className="hidden lg:flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium mr-1">Demo Presets:</span>
          <button
            onClick={() => onSelectPreset("priya_wedding")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
            title="Priya: Sister's 120-guest outdoor wedding"
          >
            🌸 Priya (Wedding)
          </button>
          <button
            onClick={() => onSelectPreset("marcus_festival")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
            title="Marcus: 450-guest community festival"
          >
            🎪 Marcus (Festival)
          </button>
          <button
            onClick={() => onSelectPreset("aisha_birthday")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
            title="Aisha: 40-guest milestone birthday party"
          >
            ✨ Aisha (40th Party)
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenIntake}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
            aria-label="Edit event intake details"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">New / Edit</span> Plan
          </button>

          <button
            onClick={onOpenDayOf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
            aria-label="Open Day-of Late Mode"
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>Day-Of Mode</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            aria-label="Export or Print Plan"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
