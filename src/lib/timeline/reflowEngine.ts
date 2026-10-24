import {
  TimelineItem,
  ReflowConflict,
  VendorDraftMessage,
  ReflowResponse,
} from "../validation/schemas";

/**
 * Converts "HH:MM" 24h string into total minutes since midnight.
 */
export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts total minutes since midnight back into "HH:MM" 24h string.
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Deterministically reflows the timeline given a delay offset in minutes.
 * - Finds the trigger item (or starts from the first uncompleted day-of item).
 * - Shifts all subsequent and dependent items by `delayMinutes`.
 * - Checks against fixed cutoff times (e.g. Venue Curfew "23:00") and generates alerts.
 * - Formulates copy-paste ready emergency vendor notification drafts.
 */
export function reflowTimeline(
  timeline: TimelineItem[],
  delayMinutes: number,
  delayedFromItemId: string,
  eventTitle: string = "Event"
): ReflowResponse {
  const triggerIndex = timeline.findIndex((item) => item.id === delayedFromItemId);
  const startIndex = triggerIndex >= 0 ? triggerIndex : 0;

  const adjustedTimeline: TimelineItem[] = [];
  const conflicts: ReflowConflict[] = [];

  // Track items that get shifted
  const affectedCategories = new Set<string>();

  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];

    // If item is in prep phase or occurred before the delay trigger, keep unchanged
    if (item.phase === "prep" || i < startIndex || !item.time) {
      adjustedTimeline.push({ ...item });
      continue;
    }

    const originalMinutes = timeStringToMinutes(item.time);
    const projectedMinutes = originalMinutes + delayMinutes;
    const projectedTime = minutesToTimeString(projectedMinutes);

    affectedCategories.add(item.category);

    // Check fixed time constraints
    if (item.isFixed && item.fixedCutoffTime) {
      const cutoffMinutes = timeStringToMinutes(item.fixedCutoffTime);
      const itemEndMinutes = projectedMinutes + item.durationMin;

      if (itemEndMinutes > cutoffMinutes) {
        conflicts.push({
          itemId: item.id,
          label: item.label,
          originalTime: item.time,
          projectedTime,
          fixedCutoffTime: item.fixedCutoffTime,
          severity: "violation",
          message: `CRITICAL CONFLICT: "${item.label}" finishes at ${minutesToTimeString(itemEndMinutes)}, violating hard curfew of ${item.fixedCutoffTime} by ${itemEndMinutes - cutoffMinutes} minutes.`,
        });
      } else if (cutoffMinutes - itemEndMinutes < 15) {
        conflicts.push({
          itemId: item.id,
          label: item.label,
          originalTime: item.time,
          projectedTime,
          fixedCutoffTime: item.fixedCutoffTime,
          severity: "warning",
          message: `Tight Buffer: "${item.label}" completes only ${cutoffMinutes - itemEndMinutes} min before strict cutoff (${item.fixedCutoffTime}).`,
        });
      }
    }

    adjustedTimeline.push({
      ...item,
      time: projectedTime,
    });
  }

  // Generate Vendor Emergency Communications
  const urgency = delayMinutes >= 30 ? "high" : "medium";
  const vendorDraftMessages: VendorDraftMessage[] = [];

  const vendorRoles = [
    {
      category: "Catering & Bar",
      contact: "Catering Lead / Head Chef",
      action: `hold hot course plating and chill beverage service by ${delayMinutes} minutes`,
    },
    {
      category: "Entertainment & AV",
      contact: "DJ / Sound Engineer",
      action: `extend low-key acoustic/cocktail background loop by ${delayMinutes} minutes before main set`,
    },
    {
      category: "Photography & Media",
      contact: "Lead Photographer",
      action: `adjust golden hour and reception photo block timings (+${delayMinutes} min offset)`,
    },
    {
      category: "Venue",
      contact: "Venue Manager / Site Coordinator",
      action: `note the ${delayMinutes} min program slide; checking curfew flex availability`,
    },
  ];

  for (const role of vendorRoles) {
    if (affectedCategories.has(role.category) || affectedCategories.size === 0) {
      vendorDraftMessages.push({
        vendorCategory: role.category,
        urgency,
        recipient: role.contact,
        draftSms: `[URGENT: ${eventTitle} UPDATE] Hi! We are currently running approximately ${delayMinutes} minutes behind schedule. Please ${role.action}. We will update you in 15 mins. Thank you for your flexibility!`,
        draftEmail: `Subject: Schedule Adjustment Notice: ${eventTitle} (+${delayMinutes} mins)\n\nHi ${role.contact},\n\nWe wanted to proactively notify your team that the run-of-show for ${eventTitle} has shifted by ${delayMinutes} minutes due to an unforeseen day-of delay.\n\nKey request for your team: Please ${role.action}. All subsequent milestones have been recalibrated in our live dashboard.\n\nIf this causes any overtime conflict with your contracted departure, please reply immediately so we can prioritize.\n\nWarm regards,\nEvent Operations`,
      });
    }
  }

  return {
    delayMinutes,
    delayedFromItemId,
    adjustedTimeline,
    conflicts,
    vendorDraftMessages,
  };
}
