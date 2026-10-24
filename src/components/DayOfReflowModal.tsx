"use client";

import React, { useState } from "react";
import { TimelineItem, ReflowResponse } from "@/lib/validation/schemas";
import { reflowTimeline } from "@/lib/timeline/reflowEngine";
import {
  X,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  MessageSquare,
  Mail,
  AlertOctagon,
} from "lucide-react";

interface DayOfReflowModalProps {
  timeline: TimelineItem[];
  eventTitle: string;
  onClose: () => void;
  onApplyReflow: (updatedTimeline: TimelineItem[]) => void;
}

export function DayOfReflowModal({
  timeline,
  eventTitle,
  onClose,
  onApplyReflow,
}: DayOfReflowModalProps) {
  const [delayMinutes, setDelayMinutes] = useState<number>(25);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Find first uncompleted day-of item as trigger
  const triggerItem =
    timeline.find((item) => item.phase === "day-of" && !item.completed) ||
    timeline.find((item) => item.phase === "day-of");

  const delayedFromItemId = triggerItem?.id || timeline[0]?.id || "";

  // Deterministic reflow
  const reflowData: ReflowResponse = reflowTimeline(
    timeline,
    delayMinutes,
    delayedFromItemId,
    eventTitle
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApply = () => {
    onApplyReflow(reflowData.adjustedTimeline);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflow-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="reflow-modal-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Day-Of Timeline Reflow & Emergency Vendor Comms
              </h2>
              <p className="text-xs text-slate-500">
                Instantly recalibrate downstream schedule and copy emergency
                notices for vendors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto pr-2 space-y-6 pt-4 flex-1">
          {/* Delay Selection Slider & Quick Pills */}
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Select Delay Offset:
              </span>
              <div className="flex items-center space-x-1.5">
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDelayMinutes(mins)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                      delayMinutes === mins
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">
                  Current Program Delay:
                </span>
                <span className="text-amber-600 dark:text-amber-400 text-sm font-extrabold">
                  Running +{delayMinutes} Minutes Late
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
                aria-label="Adjust delay minutes"
              />
            </div>
          </div>

          {/* Conflict Warnings (Curfew Breaches) */}
          {reflowData.conflicts.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>
                  Hard Cutoff Curfew Conflicts Detected (
                  {reflowData.conflicts.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {reflowData.conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-rose-700 dark:text-rose-300 font-medium"
                  >
                    {conflict.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adjusted Run of Show Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recalibrated Run-of-Show
            </h4>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {reflowData.adjustedTimeline
                .filter((item) => item.phase === "day-of")
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {item.time}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      ({item.durationMin}m)
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Emergency Vendor Communications Copy-Paste */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Ready-to-Transmit Vendor Crisis Communications
            </h4>

            <div className="space-y-3">
              {reflowData.vendorDraftMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {msg.vendorCategory} ({msg.recipient})
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {msg.urgency} Urgency
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopy(msg.draftSms, `sms-${idx}`)}
                        className="flex items-center space-x-1 px-2 py-1 rounded bg-white dark:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition"
                      >
                        {copiedKey === `sms-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                        )}
                        <span>
                          {copiedKey === `sms-${idx}`
                            ? "Copied SMS"
                            : "Copy SMS"}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          handleCopy(msg.draftEmail, `email-${idx}`)
                        }
                        className="flex items-center space-x-1 px-2 py-1 rounded bg-white dark:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition"
                      >
                        {copiedKey === `email-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Mail className="w-3 h-3 text-indigo-500" />
                        )}
                        <span>
                          {copiedKey === `email-${idx}`
                            ? "Copied Email"
                            : "Copy Email"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/60 dark:border-slate-700">
                    {msg.draftSms}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
          >
            Apply Adjusted Timeline to Day-Of Board
          </button>
        </div>
      </div>
    </div>
  );
}
