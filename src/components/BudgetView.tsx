"use client";

import React, { useState } from "react";
import { BudgetLine, BudgetCategory } from "@/lib/validation/schemas";
import { adjustCategoryPercent, generateBaselineBudget } from "@/lib/budget/budgetEngine";
import { ShieldCheck, Sliders, DollarSign, RotateCcw } from "lucide-react";

interface BudgetViewProps {
  budgetLines: BudgetLine[];
  totalBudget: number;
  currency: string;
  onUpdateBudget: (updated: BudgetLine[]) => void;
}

export function BudgetView({
  budgetLines,
  totalBudget,
  currency,
  onUpdateBudget,
}: BudgetViewProps) {
  const [sliderCategory, setSliderCategory] = useState<BudgetCategory>("Venue");
  const activeLine = budgetLines.find((l) => l.category === sliderCategory);
  const [sliderValue, setSliderValue] = useState<number>(activeLine?.percent ?? 25);

  const bufferLine = budgetLines.find((l) => l.isBuffer);
  const bufferPercent = bufferLine?.percent ?? 10;
  const bufferAmount = bufferLine?.amount ?? 0;

  const handleSliderChange = (newVal: number) => {
    setSliderValue(newVal);
    const updated = adjustCategoryPercent(budgetLines, sliderCategory, newVal, totalBudget);
    onUpdateBudget(updated);
  };

  const handleReset = () => {
    const baseline = generateBaselineBudget(totalBudget);
    onUpdateBudget(baseline);
    const venue = baseline.find((l) => l.category === sliderCategory);
    if (venue) setSliderValue(venue.percent);
  };

  // Color mapping for visual progress bar
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Venue":
        return "bg-blue-600";
      case "Catering & Bar":
        return "bg-amber-500";
      case "Decor & Rentals":
        return "bg-pink-500";
      case "Entertainment & AV":
        return "bg-purple-600";
      case "Photography & Media":
        return "bg-emerald-500";
      case "Miscellaneous & Permits":
        return "bg-slate-400";
      case "Contingency Buffer":
        return "bg-rose-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Event Budget
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {currency} {totalBudget.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Allocated 100% across 7 lines</span>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-rose-600" aria-hidden="true" />
              <span>Contingency Buffer</span>
            </span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
              {bufferPercent}% Mandatory Floor
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
            {currency} {bufferAmount.toLocaleString()}
          </div>
          <span className="text-xs text-rose-600 dark:text-rose-300 mt-1 block">
            Locked for weather shifts, guest surge, & vendor failovers
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Operational Spend
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {100 - bufferPercent}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {currency} {(totalBudget - bufferAmount).toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Base cost across venue, catering, decor & entertainment
          </span>
        </div>
      </div>

      {/* Visual Allocation Stacked Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Allocation Distribution
          </span>
          <span className="text-xs text-slate-400">Sum: 100%</span>
        </div>

        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          {budgetLines.map((line) => (
            <div
              key={line.id}
              style={{ width: `${line.percent}%` }}
              className={`${getCategoryColor(line.category)} transition-all duration-300`}
              title={`${line.category}: ${line.percent}% (${currency} ${line.amount.toLocaleString()})`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
          {budgetLines.map((line) => (
            <div key={line.id} className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(line.category)}`} />
              <span className="text-slate-600 dark:text-slate-400">
                {line.category}: <strong className="text-slate-900 dark:text-white">{line.percent}%</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What-If Live Reallocation Slider (P2 Stretch Feature) */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              What-If Reallocation Tool
            </h3>
            <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded font-medium">
              Live Balance
            </span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <label htmlFor="adjust-category-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Select Category to Adjust:
            </label>
            <select
              id="adjust-category-select"
              value={sliderCategory}
              onChange={(e) => {
                const cat = e.target.value as BudgetCategory;
                setSliderCategory(cat);
                const line = budgetLines.find((l) => l.category === cat);
                if (line) setSliderValue(line.percent);
              }}
              className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {budgetLines.map((l) => (
                <option key={l.category} value={l.category}>
                  {l.category} (currently {l.percent}%)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">{sliderCategory} Share:</span>
              <span className="text-blue-600 dark:text-blue-400">{sliderValue}% ({currency} {Math.round((sliderValue / 100) * totalBudget).toLocaleString()})</span>
            </div>
            <input
              type="range"
              min={sliderCategory === "Contingency Buffer" ? 8 : 1}
              max={sliderCategory === "Contingency Buffer" ? 50 : 70}
              step={1}
              value={sliderValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
              aria-label={`Adjust ${sliderCategory} percentage`}
            />
          </div>
        </div>
      </div>

      {/* Itemized Budget Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Itemized Event Budget Breakdown">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3 text-right">Share %</th>
              <th scope="col" className="px-4 py-3 text-right">Amount</th>
              <th scope="col" className="px-4 py-3">Resilience Notes & Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {budgetLines.map((line) => (
              <tr
                key={line.id}
                className={line.isBuffer ? "bg-rose-50/30 dark:bg-rose-950/10 font-semibold" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"}
              >
                <td className="px-4 py-3.5 flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(line.category)}`} />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {line.category}
                  </span>
                  {line.isBuffer && (
                    <span className="text-[10px] uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                  {line.percent}%
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                  {currency} {line.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  {line.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
