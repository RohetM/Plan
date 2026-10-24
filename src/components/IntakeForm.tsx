"use client";

import React, { useState } from "react";
import { EventIntake } from "@/lib/validation/schemas";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { useModalFocus } from "@/lib/a11y/useModalFocus";

interface IntakeFormProps {
  initialValues: EventIntake;
  onSubmit: (data: EventIntake) => void;
  onClose: () => void;
  isLoading: boolean;
}

const COMMON_DIETARY = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Nut-Free",
  "Halal",
  "Kosher",
  "Dairy-Free",
];

const COMMON_A11Y = [
  "Wheelchair Ramp Access",
  "Step-Free Restrooms",
  "ASL Interpreter",
  "Quiet Sensory Chill Zone",
  "Reserved Front-Row Seating",
  "Wide Pathway Navigation",
];

const COMMON_VIBES = [
  "Romantic",
  "Botanical",
  "High-Energy",
  "Intimate",
  "Rustic",
  "Modern Luxe",
  "Community-Driven",
  "Bohemian",
];

export function IntakeForm({
  initialValues,
  onSubmit,
  onClose,
  isLoading,
}: IntakeFormProps) {
  const modalRef = useModalFocus(true, onClose);
  const [formData, setFormData] = useState<EventIntake>({ ...initialValues });
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    guestCount?: string;
    budget?: string;
  }>({});
  const [customDiet, setCustomDiet] = useState("");
  const [customA11y, setCustomA11y] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; guestCount?: string; budget?: string } = {};
    if (!formData.title.trim()) {
      errors.title = "Event title is required.";
    }
    if (formData.guestCount < 1 || formData.guestCount > 50000) {
      errors.guestCount = "Guest count must be between 1 and 50,000.";
    }
    if (formData.budget < 50) {
      errors.budget = `Minimum budget is 50 ${formData.currency}.`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    onSubmit(formData);
  };

  const toggleArrayItem = (
    field: "dietary" | "accessibilityNeeds" | "vibe",
    item: string
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      const exists = current.includes(item);
      return {
        ...prev,
        [field]: exists
          ? current.filter((x) => x !== item)
          : [...current, item],
      };
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-form-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="intake-form-title"
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2"
            >
              <span>Event Intake & Parameters</span>
              <Sparkles className="w-5 h-5 text-blue-500" aria-hidden="true" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Input your event specs. Plan-B builds the baseline and runs
              multi-scenario stress tests.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto pr-2 space-y-6 pt-4 flex-1"
        >
          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="event-title"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Event Title *
              </label>
              <input
                id="event-title"
                type="text"
                required
                maxLength={100}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                aria-invalid={!!formErrors.title}
                aria-describedby={formErrors.title ? "title-error" : undefined}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  formErrors.title
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2`}
                placeholder="e.g. Maya & Julian's Outdoor Wedding"
              />
              {formErrors.title && (
                <p
                  id="title-error"
                  className="text-xs text-rose-500 mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.title}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="event-type"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Event Type
              </label>
              <select
                id="event-type"
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eventType: e.target.value as EventIntake["eventType"],
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Party</option>
                <option value="festival">Festival / Concert</option>
                <option value="community">Community Gathering</option>
                <option value="corporate">Corporate Gala</option>
                <option value="anniversary">Anniversary</option>
                <option value="dinner_party">Dinner Party</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Date, Location, Guest Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="event-date"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Event Date *
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="event-location"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Location Architecture *
              </label>
              <select
                id="event-location"
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    locationType: e.target.value as EventIntake["locationType"],
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="outdoor">
                  Outdoor (High Weather Sensitivity)
                </option>
                <option value="hybrid">
                  Hybrid (Indoor + Outdoor Pavillion)
                </option>
                <option value="indoor">Indoor (Protected)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="event-guests"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Expected Guests *
              </label>
              <input
                id="event-guests"
                type="number"
                min={1}
                max={50000}
                required
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guestCount: parseInt(e.target.value, 10) || 1,
                  })
                }
                aria-invalid={!!formErrors.guestCount}
                aria-describedby={
                  formErrors.guestCount ? "guests-error" : undefined
                }
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  formErrors.guestCount
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              />
              {formErrors.guestCount && (
                <p
                  id="guests-error"
                  className="text-xs text-rose-500 mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.guestCount}
                </p>
              )}
            </div>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="event-budget"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Total Budget Allocation *
              </label>
              <div className="relative">
                <input
                  id="event-budget"
                  type="number"
                  min={50}
                  max={10000000}
                  required
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: parseFloat(e.target.value) || 50,
                    })
                  }
                  aria-invalid={!!formErrors.budget}
                  aria-describedby={
                    formErrors.budget ? "budget-error" : "budget-desc"
                  }
                  className={`w-full pl-3 pr-16 py-2 text-sm rounded-lg border ${
                    formErrors.budget
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  {formData.currency}
                </span>
              </div>
              <p id="budget-desc" className="text-[11px] text-slate-400 mt-1">
                Plan-B automatically provisions an enforced mandatory &ge;8%
                contingency buffer.
              </p>
              {formErrors.budget && (
                <p
                  id="budget-error"
                  className="text-xs text-rose-500 mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.budget}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-currency"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Currency
              </label>
              <select
                id="event-currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          {/* Dietary Requirements */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Dietary Inclusivity Needs
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DIETARY.map((diet) => {
                const isSelected = formData.dietary.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleArrayItem("dietary", diet)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 font-semibold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility Requirements */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Universal Accessibility & Mobility Requirements
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_A11Y.map((a11y) => {
                const isSelected = formData.accessibilityNeeds.includes(a11y);
                return (
                  <button
                    key={a11y}
                    type="button"
                    onClick={() => toggleArrayItem("accessibilityNeeds", a11y)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                    }`}
                  >
                    {a11y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe / Theme Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Vibe & Aesthetic Keywords
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_VIBES.map((vibe) => {
                const isSelected = formData.vibe.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => toggleArrayItem("vibe", vibe)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 font-semibold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400"
                    }`}
                  >
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="event-notes"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Host Notes & Constraints (optional)
            </label>
            <textarea
              id="event-notes"
              rows={2}
              maxLength={500}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. Venue has a 10 PM sound curfew. Need space for a 4-piece live band."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Resilient Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
