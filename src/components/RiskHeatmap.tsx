"use client";

import React, { useState } from "react";
import { Table, LayoutGrid } from "lucide-react";

interface HeatmapEntry {
  category: string;
  scenarios: Record<
    string,
    {
      score: number;
      band: string;
      extraCost: number;
    }
  >;
}

interface RiskHeatmapProps {
  heatmapData: HeatmapEntry[];
  currency: string;
  onSelectScenario: (scenarioId: string) => void;
  activeScenario: string;
}

const SCENARIOS = [
  { id: "rain", label: "🌧️ Rain / Storm" },
  { id: "vendor_noshow", label: "🚫 Vendor No-Show" },
  { id: "guest_surge", label: "👥 +30% Guest Surge" },
  { id: "budget_cut", label: "✂️ 15% Budget Cut" },
];

export function RiskHeatmap({
  heatmapData,
  currency,
  onSelectScenario,
  activeScenario,
}: RiskHeatmapProps) {
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  const getCellBadgeClass = (score: number) => {
    if (score <= 33) {
      return "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100 border-emerald-400";
    }
    if (score <= 66) {
      return "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100 border-amber-400";
    }
    return "bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-100 border-rose-400";
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Disaster Vulnerability Heatmap</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Category &times; Crisis Matrix
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Multi-factor stress test: exposure &times; severity &times; (1 -
            mitigation). Click any column to drill in.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
              viewMode === "visual"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Heatmap Grid</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Accessible Table</span>
          </button>
        </div>
      </div>

      {/* Visual Grid View */}
      {viewMode === "visual" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th
                  scope="col"
                  className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300"
                >
                  Category
                </th>
                {SCENARIOS.map((sc) => (
                  <th
                    key={sc.id}
                    scope="col"
                    onClick={() => onSelectScenario(sc.id)}
                    className={`py-2.5 px-3 font-bold text-center cursor-pointer transition rounded-t-lg ${
                      activeScenario === sc.id
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-b-2 border-blue-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {sc.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {heatmapData.map((row) => (
                <tr
                  key={row.category}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {row.category}
                  </td>
                  {SCENARIOS.map((sc) => {
                    const cell = row.scenarios[sc.id] || {
                      score: 0,
                      band: "Low",
                      extraCost: 0,
                    };
                    return (
                      <td
                        key={sc.id}
                        onClick={() => onSelectScenario(sc.id)}
                        className={`py-3 px-3 text-center cursor-pointer ${
                          activeScenario === sc.id
                            ? "bg-blue-50/30 dark:bg-blue-950/20"
                            : ""
                        }`}
                      >
                        <div
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getCellBadgeClass(
                            cell.score
                          )}`}
                        >
                          <span>{cell.band}</span>
                          <span className="font-semibold">({cell.score})</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Accessible Table Alternative (WCAG 2.2 AA) */
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-xs"
            aria-label="Risk Heatmap Data Alternative"
          >
            <caption className="text-left text-slate-500 mb-2 italic">
              Quantitative risk breakdown across scenarios and budget categories
              with calculated extra contingency costs.
            </caption>
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="py-2.5 px-3">
                  Budget Category
                </th>
                <th scope="col" className="py-2.5 px-3">
                  Scenario
                </th>
                <th scope="col" className="py-2.5 px-3 text-center">
                  Risk Score (0-100)
                </th>
                <th scope="col" className="py-2.5 px-3 text-center">
                  Risk Band
                </th>
                <th scope="col" className="py-2.5 px-3 text-right">
                  Estimated Extra Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {heatmapData.flatMap((row) =>
                SCENARIOS.map((sc) => {
                  const cell = row.scenarios[sc.id] || {
                    score: 0,
                    band: "Low",
                    extraCost: 0,
                  };
                  return (
                    <tr key={`${row.category}-${sc.id}`}>
                      <th
                        scope="row"
                        className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 text-left"
                      >
                        {row.category}
                      </th>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {sc.label}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {cell.score}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getCellBadgeClass(cell.score)}`}
                        >
                          {cell.band}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {cell.extraCost > 0
                          ? `${currency} ${cell.extraCost.toLocaleString()}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
