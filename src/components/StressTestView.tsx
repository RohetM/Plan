"use client";

import React from "react";
import { StressTestResponse, ScenarioType } from "@/lib/validation/schemas";
import { WeatherForecast } from "@/lib/weather/weatherClient";
import {
  ShieldAlert,
  AlertTriangle,
  CloudRain,
  UserX,
  Users,
  Scissors,
  CheckCircle2,
  DollarSign,
  Clock,
  CloudSun,
} from "lucide-react";

interface StressTestViewProps {
  stressResult: StressTestResponse;
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  currency: string;
  weather?: WeatherForecast | null;
}

const SCENARIOS = [
  {
    id: "rain" as ScenarioType,
    label: "Sudden Downpour",
    icon: CloudRain,
    description: "Torrential rain & wind gusts threaten outdoor event",
  },
  {
    id: "vendor_noshow" as ScenarioType,
    label: "Vendor No-Show",
    icon: UserX,
    description: "Caterer or key vendor fails to show up day-of",
  },
  {
    id: "guest_surge" as ScenarioType,
    label: "+30% Guest Surge",
    icon: Users,
    description: "Unplanned +1s and late RSVPs exceed venue & food capacity",
  },
  {
    id: "budget_cut" as ScenarioType,
    label: "15% Budget Cut",
    icon: Scissors,
    description: "Emergency fund withdrawal requires surgical descope",
  },
];

export function StressTestView({
  stressResult,
  activeScenario,
  onSelectScenario,
  currency,
  weather,
}: StressTestViewProps) {
  const { overallRiskScore, overallRiskBand, summary, bufferAdequacy, itemRisks, totalExtraCost } =
    stressResult;

  const getScoreColor = (score: number) => {
    if (score <= 33) return "text-emerald-600 dark:text-emerald-400";
    if (score <= 66) return "text-amber-500 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getBandBadge = (band: string) => {
    if (band === "Low") {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
    }
    if (band === "Medium") {
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
    }
    return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isActive
                  ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {sc.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {sc.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Weather-Aware Live Mode Banner (when rain is selected) */}
      {activeScenario === "rain" && weather && (
        <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <CloudSun className="w-6 h-6 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center space-x-2">
                <span>Weather Intelligence Integration</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-semibold uppercase">
                  {weather.source === "live" ? "Live Forecast" : "Seasonal Model"}
                </span>
              </div>
              <p className="text-sky-700 dark:text-sky-300 mt-0.5">
                {weather.summary} Max Temp: {weather.temperatureC}°C | Precipitation: {weather.precipitationMm} mm
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-extrabold text-lg text-sky-700 dark:text-sky-300">
              {weather.rainProbabilityPercent}% Rain Risk
            </div>
          </div>
        </div>
      )}

      {/* Primary Disaster Gauge & Buffer Adequacy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Gauge */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Disaster Risk Severity
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBandBadge(
                overallRiskBand
              )}`}
            >
              {overallRiskBand} Risk
            </span>
          </div>

          <div className="my-3 flex items-baseline space-x-2">
            <span className={`text-4xl font-extrabold ${getScoreColor(overallRiskScore)}`}>
              {overallRiskScore}
            </span>
            <span className="text-sm text-slate-400 font-semibold">/ 100</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${overallRiskScore}%` }}
              className={`h-full transition-all duration-500 ${
                overallRiskScore <= 33
                  ? "bg-emerald-500"
                  : overallRiskScore <= 66
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
          </div>
        </div>

        {/* Total Cost to Recover */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Contingency Deployment Cost
          </span>
          <div className="my-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {currency} {totalExtraCost.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500">
            Required cash reserves to execute all scenario backups
          </span>
        </div>

        {/* Buffer Adequacy Card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            bufferAdequacy.isSufficient
              ? "border-emerald-200 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20"
              : "border-rose-200 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Reserve Buffer Health
            </span>
            {bufferAdequacy.isSufficient ? (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sufficient</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Deficit</span>
              </span>
            )}
          </div>

          <div className="my-3">
            <div
              className={`text-2xl font-extrabold ${
                bufferAdequacy.isSufficient
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {bufferAdequacy.isSufficient ? "+" : "-"} {currency}{" "}
              {Math.abs(bufferAdequacy.deficitOrSurplus).toLocaleString()}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {bufferAdequacy.isSufficient ? "Surplus remaining after contingencies" : "Shortfall needed from external funds"}
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Current buffer: {currency} {bufferAdequacy.currentBuffer.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Strategic Executive Summary */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-sm text-slate-700 dark:text-slate-300">
        <strong className="text-slate-900 dark:text-white">Stress Test Evaluation: </strong>
        {summary}
      </div>

      {/* Item-by-Item Breakdown */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Itemized Disaster Exposure & Contingency Protocols
        </h4>

        <div className="space-y-3">
          {itemRisks.map((item) => (
            <div
              key={item.itemId}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-slate-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.itemLabel}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getBandBadge(
                      item.band
                    )}`}
                  >
                    {item.band} ({item.score})
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                  {item.estimatedExtraCost > 0 && (
                    <span className="flex items-center space-x-1 text-slate-900 dark:text-white font-bold">
                      <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                      <span>+{currency} {item.estimatedExtraCost.toLocaleString()}</span>
                    </span>
                  )}
                  {item.timelineImpactMin > 0 && (
                    <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>+{item.timelineImpactMin}m shift</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Contingency Plan */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <strong className="text-blue-600 dark:text-blue-400">Pre-Built Backup: </strong>
                {item.contingency}
              </div>

              {/* Formula Factors */}
              <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4">
                <span>Exposure: {Math.round(item.exposure * 100)}%</span>
                <span>Severity: {Math.round(item.scenarioSeverity * 100)}%</span>
                <span>Mitigation: {Math.round(item.mitigation * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
