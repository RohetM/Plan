import { GoogleGenerativeAI } from "@google/generative-ai";
import { EventIntake, FullPlan } from "../validation/schemas";
import {
  PLAN_SYSTEM_PROMPT,
  buildPlanUserPrompt,
} from "../../prompts/planPrompt";
import { generateDeterministicPlan } from "./fallbackTemplates";
import { normalizeBudget } from "../budget/budgetEngine";
import { hashPayload } from "./hash";

// In-memory cache for plan responses
const planCache = new Map<string, FullPlan>();

/**
 * Generates an event plan using Gemini Flash with structured JSON output,
 * retrying once on JSON syntax error and falling back gracefully to the
 * deterministic engine if no API key is present or on any network failure.
 */
export async function generateEventPlan(
  intake: EventIntake
): Promise<FullPlan> {
  const cacheKey = hashPayload(intake);
  if (planCache.has(cacheKey)) {
    return planCache.get(cacheKey)!;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    // Graceful fallback to deterministic template
    const plan = generateDeterministicPlan(intake);
    planCache.set(cacheKey, plan);
    return plan;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.35,
      },
      systemInstruction: PLAN_SYSTEM_PROMPT,
    });

    const userPrompt = buildPlanUserPrompt(intake);
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

interface LLMPlanItem {
  phase?: string;
  timeOffsetDays?: number;
  time?: string;
  durationMin?: number;
  label?: string;
  description?: string;
  category?: string;
  isFixed?: boolean;
  fixedCutoffTime?: string;
  dependsOn?: string[];
}

interface LLMVendorItem {
  category?: string;
  roleTitle?: string;
  questions?: string[];
  redFlags?: string[];
  backupNeeded?: boolean;
  backupOption?: string;
  notes?: string;
}

interface LLMPlanResponse {
  summary?: string;
  ideas?: {
    theme?: string;
    decorIdeas?: string[];
    menuHighlights?: string[];
    activitySuggestions?: string[];
    inclusiveNotes?: string[];
  };
  customTimelineItems?: LLMPlanItem[];
  customVendors?: LLMVendorItem[];
}

    let parsed: LLMPlanResponse;
    try {
      parsed = JSON.parse(text) as LLMPlanResponse;
    } catch {
      // Retry once with strict JSON repair prompt
      const retryResult = await model.generateContent(
        `Your previous response was not valid JSON. Return the exact valid JSON object now with no markdown formatting.\n${userPrompt}`
      );
      parsed = JSON.parse(retryResult.response.text()) as LLMPlanResponse;
    }

    // Blend deterministic budget with LLM qualitative content
    const baselineBudget = normalizeBudget([], intake.budget);

    // Validate and sanitize custom items from LLM
    const customTimeline =
      Array.isArray(parsed.customTimelineItems) &&
      parsed.customTimelineItems.length > 0
        ? parsed.customTimelineItems.map((item: LLMPlanItem, idx: number) => ({
            id: `ai-item-${idx + 1}`,
            phase: item.phase === "prep" ? ("prep" as const) : ("day-of" as const),
            timeOffsetDays:
              typeof item.timeOffsetDays === "number"
                ? item.timeOffsetDays
                : undefined,
            time: typeof item.time === "string" ? item.time : "14:00",
            durationMin:
              typeof item.durationMin === "number" ? item.durationMin : 60,
            label:
              typeof item.label === "string" ? item.label : "Event Activity",
            description:
              typeof item.description === "string" ? item.description : "",
            category:
              typeof item.category === "string" ? item.category : "General",
            isFixed: Boolean(item.isFixed),
            fixedCutoffTime:
              typeof item.fixedCutoffTime === "string"
                ? item.fixedCutoffTime
                : undefined,
            dependsOn: Array.isArray(item.dependsOn) ? item.dependsOn : [],
            completed: false,
          }))
        : generateDeterministicPlan(intake).timeline;

    const customVendors =
      Array.isArray(parsed.customVendors) && parsed.customVendors.length > 0
        ? parsed.customVendors.map((v: LLMVendorItem, idx: number) => ({
            id: `ai-vendor-${idx + 1}`,
            category:
              typeof v.category === "string" ? v.category : "General Services",
            roleTitle:
              typeof v.roleTitle === "string" ? v.roleTitle : "Lead Vendor",
            status: "to-contact" as const,
            estimatedCost: Math.round(intake.budget * 0.15),
            questions: Array.isArray(v.questions)
              ? v.questions
              : ["Can you share contract terms?"],
            redFlags: Array.isArray(v.redFlags)
              ? v.redFlags
              : ["Refusal to share insurance documentation"],
            backupNeeded: Boolean(v.backupNeeded),
            backupOption:
              typeof v.backupOption === "string"
                ? v.backupOption
                : "Backup on retainer",
            notes: typeof v.notes === "string" ? v.notes : "",
          }))
        : generateDeterministicPlan(intake).vendors;

    const fullPlan: FullPlan = {
      id: `plan-${Date.now()}`,
      intake,
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : `Plan-B strategic resilience plan for ${intake.title}.`,
      budget: baselineBudget,
      timeline: customTimeline,
      vendors: customVendors,
      ideas: {
        theme: parsed.ideas?.theme || `${intake.title} Experience`,
        decorIdeas: Array.isArray(parsed.ideas?.decorIdeas)
          ? parsed.ideas.decorIdeas
          : [],
        menuHighlights: Array.isArray(parsed.ideas?.menuHighlights)
          ? parsed.ideas.menuHighlights
          : [],
        activitySuggestions: Array.isArray(parsed.ideas?.activitySuggestions)
          ? parsed.ideas.activitySuggestions
          : [],
        inclusiveNotes: Array.isArray(parsed.ideas?.inclusiveNotes)
          ? parsed.ideas.inclusiveNotes
          : [],
      },
      createdAt: new Date().toISOString(),
      isFallback: false,
    };

    planCache.set(cacheKey, fullPlan);
    return fullPlan;
  } catch (error) {
    // If Gemini API fails (network, quota, invalid key), seamlessly fallback
    console.warn(
      "LLM API encountered error, activating deterministic fallback:",
      error
    );
    const fallbackPlan = generateDeterministicPlan(intake);
    planCache.set(cacheKey, fallbackPlan);
    return fallbackPlan;
  }
}
