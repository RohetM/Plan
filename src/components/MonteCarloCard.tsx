"use client";

import React, { useState } from "react";
import { MonteCarloResult } from "@/lib/simulation/monteCarlo";
import { TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface MonteCarloCardProps {
  monteCarlo: MonteCarloResult;
  currency: string;
}

export function MonteCarloCard({ monteCarlo, currency }: MonteCarloCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const bufferDiff = Math.round(
    (monteCarlo.currentBufferAmount - monteCarlo.recommendedBufferAmount) * 100
  ) / 100;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Monte Carlo Budget Variance Engine</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                1,000 Seeded Trials
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates real-world vendor overrun probabilities using triangular volatility distributions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showDetails ? "Hide Assumptions" : "View Modeling Assumptions"}</span>
        </button>
      </div>

      {/* Assumptions Box */}
      {showDetails && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-slate-200 dark:border-slate-700">
          <p>
            <strong>Stochastic Distribution:</strong> Each category samples from a triangular distribution:
            <code className="mx-1 px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Min 0.95x</code> (minor negotiated vendor discount),
            <code className="mx-1 px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Mode 1.00x</code> (contracted estimate), and
            <code className="mx-1 px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Max 1.0 + Volatility</code> (catering +25%, decor +20%, venue +10%).
          </p>
          <p>
            <strong>Reproducibility:</strong> Runs with seeded pseudo-random generator (Seed #{monteCarlo.seed}) for verified deterministic audits.
          </p>
        </div>
      )}

      {/* Primary Percentile Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* P10 / Optimistic */}
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-xs text-slate-500 block">P10 (Best-Case / Frugal)</span>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
            {currency} {monteCarlo.p10.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">10% probability of costing less</span>
        </div>

        {/* P50 / Expected Median */}
        <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 block">
            P50 (Median Expected Total)
          </span>
          <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
            {currency} {monteCarlo.p50.toLocaleString()}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400">Most realistic operational baseline</span>
        </div>

        {/* P90 / Stress Threshold */}
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
            P90 (90th Percentile Stress Cost)
          </span>
          <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
            {currency} {monteCarlo.p90.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300">
            90% of simulations finish below this cost
          </span>
        </div>
      </div>

      {/* Recommended Buffer vs Current Buffer Adequacy */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        monteCarlo.bufferIsAdequateForP90
          ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20"
      }`}>
        <div className="flex items-start space-x-3">
          {monteCarlo.bufferIsAdequateForP90 ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {monteCarlo.bufferIsAdequateForP90
                ? "Contingency Buffer is ADEQUATE for P90 Stress Cost"
                : "Buffer DEFICIT Detected for 90th Percentile Overruns"}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Simulation recommends a minimum buffer of{" "}
              <strong>{monteCarlo.recommendedBufferPercent}%</strong> ({currency}{" "}
              {monteCarlo.recommendedBufferAmount.toLocaleString()}) to absorb 90% of volatile overruns.
              Your current buffer is {currency} {monteCarlo.currentBufferAmount.toLocaleString()} ({bufferDiff >= 0 ? `+${currency} ${bufferDiff} surplus` : `${currency} ${Math.abs(bufferDiff)} deficit`}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
