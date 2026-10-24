"use client";

import React from "react";
import { VendorItem, VendorStatus } from "@/lib/validation/schemas";
import {
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

interface VendorChecklistViewProps {
  vendors: VendorItem[];
  currency: string;
  onUpdateVendorStatus: (vendorId: string, newStatus: VendorStatus) => void;
}

export function VendorChecklistView({
  vendors,
  currency,
  onUpdateVendorStatus,
}: VendorChecklistViewProps) {
  const bookedCount = vendors.filter((v) => v.status === "booked").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Procurement & Vendor Risk Checklist</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {bookedCount}/{vendors.length} Booked
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Categorized contract checklists, critical audit interview questions,
            and non-negotiable red flags.
          </p>
        </div>
      </div>

      {/* Grid of Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header: Role & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {vendor.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {vendor.roleTitle || `${vendor.category} Specialist`}
                  </h4>
                  {vendor.estimatedCost > 0 && (
                    <span className="text-xs text-slate-500">
                      Target Budget:{" "}
                      <strong>
                        {currency} {vendor.estimatedCost.toLocaleString()}
                      </strong>
                    </span>
                  )}
                </div>

                {/* Status Switcher */}
                <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                  {(["to-contact", "quoted", "booked"] as VendorStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => onUpdateVendorStatus(vendor.id, status)}
                        className={`px-2 py-1 rounded-md capitalize transition ${
                          vendor.status === status
                            ? status === "booked"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : status === "quoted"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-amber-500 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        {status.replace("-", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Backup Needed Notice */}
              {vendor.backupNeeded && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">
                      Backup Contingency Recommended:{" "}
                    </span>
                    <span>
                      {vendor.backupOption ||
                        "Secure backup provider on standby"}
                    </span>
                  </div>
                </div>
              )}

              {/* Critical Questions to Ask */}
              {vendor.questions && vendor.questions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>Key Questions to Ask:</span>
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc">
                    {vendor.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags to Watch */}
              {vendor.redFlags && vendor.redFlags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Contract Red Flags:</span>
                  </span>
                  <ul className="text-xs text-rose-700 dark:text-rose-400 space-y-1 pl-4 list-disc">
                    {vendor.redFlags.map((rf, idx) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Notes if available */}
            {vendor.notes && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 italic">
                {vendor.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
