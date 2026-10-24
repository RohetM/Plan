"use client";

import React, { useState } from "react";
import { TimelineItem } from "@/lib/validation/schemas";
import { Clock, Calendar, CheckSquare, Square, AlertOctagon, FastForward } from "lucide-react";

interface TimelineViewProps {
  timeline: TimelineItem[];
  onToggleComplete: (itemId: string) => void;
  onOpenDayOfModal: () => void;
}

export function TimelineView({
  timeline,
  onToggleComplete,
  onOpenDayOfModal,
}: TimelineViewProps) {
  const [activePhase, setActivePhase] = useState<"day-of" | "prep">("day-of");

  const filteredItems = timeline.filter((item) => item.phase === activePhase);
  const completedCount = filteredItems.filter((i) => i.completed).length;

  return (
    <div className="space-y-6">
      {/* Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setActivePhase("day-of")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                activePhase === "day-of"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Day-Of Run-of-Show</span>
            </button>

            <button
              onClick={() => setActivePhase("prep")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                activePhase === "prep"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Prep Countdown</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden md:inline">
            Completed: {completedCount}/{filteredItems.length}
          </span>
        </div>

        {/* Action Button */}
        {activePhase === "day-of" && (
          <button
            onClick={onOpenDayOfModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
          >
            <FastForward className="w-4 h-4" />
            <span>Simulate Running Late (+25m)</span>
          </button>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`relative p-4 rounded-xl border transition ${
              item.completed
                ? "border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-75"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300"
            }`}
          >
            {/* Dot marker */}
            <div
              className={`absolute -left-[1.85rem] sm:-left-[2.35rem] top-4 w-4 h-4 rounded-full border-2 transition ${
                item.completed
                  ? "bg-emerald-500 border-white dark:border-slate-900 ring-2 ring-emerald-300"
                  : item.isFixed
                  ? "bg-rose-500 border-white dark:border-slate-900 ring-2 ring-rose-300"
                  : "bg-blue-600 border-white dark:border-slate-900"
              }`}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                    {item.phase === "day-of"
                      ? item.time || "TBD"
                      : `${item.timeOffsetDays} Days Prior`}
                  </span>

                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                    {item.category}
                  </span>

                  <span className="text-xs text-slate-400 font-medium">
                    ({item.durationMin} mins)
                  </span>

                  {item.isFixed && (
                    <span className="flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                      <AlertOctagon className="w-3 h-3" />
                      <span>Hard Cutoff {item.fixedCutoffTime ? `(${item.fixedCutoffTime})` : ""}</span>
                    </span>
                  )}
                </div>

                <h4
                  className={`text-base font-bold text-slate-900 dark:text-white ${
                    item.completed ? "line-through text-slate-500" : ""
                  }`}
                >
                  {item.label}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>

              {/* Complete Toggle */}
              <button
                onClick={() => onToggleComplete(item.id)}
                className="p-1 rounded text-slate-400 hover:text-emerald-600 transition"
                aria-label={`Mark "${item.label}" as ${item.completed ? "incomplete" : "complete"}`}
              >
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
