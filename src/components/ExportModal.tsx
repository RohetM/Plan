"use client";

import React, { useState } from "react";
import { FullPlan, StressTestResponse } from "@/lib/validation/schemas";
import { X, Download, Printer, Copy, Check, FileText } from "lucide-react";

interface ExportModalProps {
  plan: FullPlan;
  stressResult?: StressTestResponse | null;
  onClose: () => void;
}

export function ExportModal({ plan, stressResult, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    const { intake, budget, timeline, vendors, ideas, summary } = plan;

    let md = `# Plan-B Event Resilience Plan: ${intake.title}\n\n`;
    md += `> **Executive Summary:** ${summary}\n\n`;
    md += `*Generated on:* ${new Date(plan.createdAt).toLocaleDateString()} | *Architecture:* ${intake.locationType} | *Guest Count:* ${intake.guestCount}\n\n`;

    // Budget
    md += `## 1. Budget Breakdown (Total: ${intake.currency} ${intake.budget.toLocaleString()})\n\n`;
    md += `| Category | Share | Amount | Resilience Notes |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const b of budget) {
      md += `| ${b.category} | ${b.percent}% | ${intake.currency} ${b.amount.toLocaleString()} | ${b.notes} |\n`;
    }
    md += `\n`;

    // Timeline
    md += `## 2. Interactive Schedule & Run-of-Show\n\n`;
    md += `### Prep Countdown\n`;
    for (const item of timeline.filter((t) => t.phase === "prep")) {
      md += `- [${item.completed ? "x" : " "}] **T${item.timeOffsetDays} Days:** ${item.label} (${item.category}) — *${item.description}*\n`;
    }
    md += `\n### Day-Of Run-of-Show\n`;
    for (const item of timeline.filter((t) => t.phase === "day-of")) {
      md += `- [${item.completed ? "x" : " "}] **${item.time}** (${item.durationMin}m): ${item.label} ${item.isFixed ? "[Hard Cutoff]" : ""} — *${item.description}*\n`;
    }
    md += `\n`;

    // Vendors
    md += `## 3. Vendor Procurement & Audit Checklist\n\n`;
    for (const v of vendors) {
      md += `### ${v.category} — ${v.roleTitle} [Status: ${v.status.toUpperCase()}]\n`;
      md += `- **Estimated Allocation:** ${intake.currency} ${v.estimatedCost.toLocaleString()}\n`;
      md += `- **Audit Questions:**\n`;
      for (const q of v.questions) md += `  - ${q}\n`;
      md += `- **Contract Red Flags:**\n`;
      for (const rf of v.redFlags) md += `  - ⚠️ ${rf}\n`;
      if (v.backupOption) {
        md += `- **Backup Plan:** ${v.backupOption}\n`;
      }
      md += `\n`;
    }

    // Ideas
    md += `## 4. Personalized Theme, Menu & Universal Accessibility\n\n`;
    md += `**Theme:** ${ideas.theme}\n\n`;
    md += `### Decor Concepts\n`;
    for (const d of ideas.decorIdeas) md += `- ${d}\n`;
    md += `\n### Dietary Menu Highlights (${intake.dietary.join(", ") || "Standard"})\n`;
    for (const m of ideas.menuHighlights) md += `- ${m}\n`;
    md += `\n### Universal Accessibility Provisions\n`;
    for (const a of ideas.inclusiveNotes) md += `- ✓ ${a}\n`;
    md += `\n`;

    // Stress Test Simulation
    if (stressResult) {
      md += `## 5. Stress Test Crisis Simulation: ${stressResult.scenarioLabel}\n\n`;
      md += `- **Overall Risk Severity:** ${stressResult.overallRiskBand} (${stressResult.overallRiskScore}/100)\n`;
      md += `- **Contingency Deployment Cost:** ${intake.currency} ${stressResult.totalExtraCost.toLocaleString()}\n`;
      md += `- **Buffer Adequacy:** ${stressResult.bufferAdequacy.isSufficient ? "SUFFICIENT (Surplus: " + intake.currency + " " + stressResult.bufferAdequacy.deficitOrSurplus + ")" : "DEFICIT"}\n`;
      md += `- **Evaluation Summary:** ${stressResult.summary}\n\n`;
      md += `### Tactical Contingencies\n`;
      for (const item of stressResult.itemRisks) {
        if (item.contingency) {
          md += `- **[${item.itemLabel}]** (${item.band} Risk, +${intake.currency} ${item.estimatedExtraCost}): ${item.contingency}\n`;
        }
      }
    }

    return md;
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.intake.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_resilience_plan.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 id="export-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Export Resilience Blueprint
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="overflow-y-auto pr-2 space-y-4 pt-4 flex-1">
          <p className="text-xs text-slate-500">
            Export your complete event plan including budget allocations, timeline, vendor checklists, accessibility provisions, and simulated crisis contingencies.
          </p>

          <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-72">
            {generateMarkdown()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Print / Save PDF</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
