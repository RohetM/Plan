# Plan-B: Event Stress-Tester

> **PromptWars Challenge 5: Celebration & Event Planner** | _Version 1.0_

[![Test Suite](https://img.shields.io/badge/tests-35%20passed-emerald?style=flat-square)](tests/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA-purple?style=flat-square)](docs/ARCHITECTURE.md)

---

## 1. Overview & Problem Statement

Most event planners produce a **happy-path plan**—assuming sun shines, vendors arrive on time, guests RSVP accurately, and budgets hold. Real events fail on the **unhappy path**.

**Plan-B** is a GenAI-assisted, deterministic-first event planner that builds your budget, prep countdown, run-of-show timeline, and vendor checklists, then **stress-tests the plan against rain, critical vendor cancellations, guest count surges, and budget cuts**.

Every plan ships with:

- **Per-item quantitative risk scoring** ($0-100$ and Low/Medium/High bands)
- **Mandatory contingency buffer line** ($\ge 8\%$) summing strictly to 100%
- **Pre-engineered backup actions** with estimated extra recovery costs
- **1,000-trial Monte Carlo variance modeling** providing P50 and P90 cost thresholds
- **Day-of "Running 25 min late" mode** with deterministic timeline reflow and instant emergency SMS/email vendor drafts.

---

## 2. Core Architecture: The LLM Generates, Deterministic Code Decides

To maximize reviewability, reliability, and security during judging:

- **LLM Layer (Google Gemini Flash):** Synthesizes creative themes, personalized menus honoring complex dietary restrictions (Vegan, Gluten-Free, Halal, Kosher), accessibility provisions, and piercing vendor interview questions.
- **Deterministic Layer (Tested TypeScript Engines):** All calculations—budget percentages, contingency buffer floor enforcement, quantitative risk scoring, Monte Carlo triangular distributions, and day-of timeline reflow—run in plain, unit-tested code.
- **Offline / Zero-Key Fallback:** If `GEMINI_API_KEY` is absent or the API times out, the app immediately falls back to a deterministic template planner with pre-seeded personas.

```mermaid
flowchart TD
    User([User / Event Host]) --> Intake[Event Intake Form]
    Intake --> API_Plan[POST /api/plan]

    subgraph Deterministic Core
      Zod[Zod Schema Validation & Sanitizer]
      LLM[Gemini Flash / Retry / Fallback]
      Budget[Budget Engine: Mandatory Floor >= 8%]
      Risk[Risk Engine: Exposure x Severity x Mitigation]
      MonteCarlo[Monte Carlo 1,000 Seeded Trials]
      Reflow[Timeline Reflow Engine]
    end

    API_Plan --> Zod --> LLM --> Budget

    User --> StressView[Crisis Stress-Test Hub]
    StressView --> API_Stress[POST /api/stress]
    API_Stress --> Risk
    API_Stress --> MonteCarlo

    User --> DayOfMode[Day-of Late Mode]
    DayOfMode --> API_Reflow[POST /api/reflow]
    API_Reflow --> Reflow
```

---

## 3. Four Challenge Pillars + The Differentiator

| Pillar                                   | Implementation in Plan-B                                                                                                                                                                                                                     |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Budget Planner**                    | Categorized breakdown (Venue, Catering, Decor, AV, Photography, Misc, Buffer). Mandatory contingency buffer floor ($\ge 8\%$) guaranteed. Includes **What-If live reallocation sliders** and **1,000-trial Monte Carlo P50/P90 simulation**. |
| **2. Interactive Timeline**              | Dual-phase schedule: **Prep Countdown** (e.g. -60d, -30d, -14d) and **Day-Of Run-of-Show** (14:00, 15:30, 16:30...). Tracks task completion, flags hard curfews, and supports deterministic day-of delay reflow.                             |
| **3. Vendor Checklist**                  | Per-category checklists with interactive status toggles (`to-contact`, `quoted`, `booked`), penetrating audit questions, contract red flags, and backup vendor recommendations.                                                              |
| **4. Personalized Ideas**                | Bespoke themes, decor styling, beverage and meal selections honoring entered dietary restrictions, activities accommodating accessibility needs, and sensory accommodations.                                                                 |
| **★ Differentiator: Crisis Stress-Test** | One-click simulation of 4 disasters: **Sudden Downpour**, **Vendor No-Show**, **+30% Guest Count Surge**, and **15% Budget Cut**. Outputs per-item risk scores, contingency cost estimates, and **Cross-Cutting Vulnerability Heatmap**.     |

---

## 4. Quantitative Risk Scoring Formula

$$\text{RiskScore} = \text{exposure} \times \text{scenarioSeverity} \times (1 - \text{mitigation}) \times 100$$

- **Exposure ($0.10 - 1.00$):** Derived from outdoor vs. indoor location attributes, budget concentration ($>25\%$), and lack of confirmed backups.
- **Scenario Severity ($0.05 - 1.00$):** Derived from typed constant rules tables multiplied by location modifiers (e.g. Outdoor Rain severity: Venue 0.90, AV 0.90; Indoor Rain severity: 0.15).
- **Mitigation ($0.00 - 0.85$):** Credits confirmed backup vendors ($+0.35$), formal bookings ($+0.15$), and dedicated contingency reserves ($+0.15$).
- **Risk Bands:**
  - `0 - 33`: **Low Risk**
  - `34 - 66`: **Medium Risk**
  - `67 - 100`: **High Risk**

Full details and mathematical tables available in [docs/RISK_MODEL.md](docs/RISK_MODEL.md).

---

## 5. Monte Carlo Budget Simulation

Runs 1,000 independent trials using Inverse Transform Sampling on a triangular distribution:

- **Min ($0.95\times$):** Reflects negotiated vendor discounts.
- **Mode ($1.00\times$):** Estimated baseline quote.
- **Max ($1.00 + \text{volatility}$):** Catering $+25\%$, Decor $+20\%$, Misc $+30\%$, Venue $+10\%$.
- **Seed Reproducibility:** Uses a seeded Mulberry32 pseudo-random generator (Seed `#1337`) for 100% deterministic test reproducibility.
- **Outputs:** P10, P50 (expected cost), P90 (stress threshold), and required buffer percentage.

---

## 6. Day-Of Mode: Running Late Recalibration

When an event runs behind schedule:

1. Tap **"Day-Of Mode"** and select a delay (e.g. `+25 minutes`).
2. Downstream tasks shift forward deterministically.
3. Hard cutoff constraints (e.g. Venue 23:00 curfew) are checked, and critical violations are flagged.
4. Generates copy-paste ready, professional emergency SMS and email notices for Caterers, AV/DJ, Venue Managers, and Photographers.

---

## 7. Accessibility (WCAG 2.2 AA Target)

- **Semantic Landmarks:** `<header>`, `<main id="main-content">`, `<nav>`, `<section>`, `<footer>`.
- **Skip Link:** "Skip to main content" link for keyboard users.
- **Form Association:** All form inputs paired with explicit `<label htmlFor="...">` and ARIA attributes.
- **Visible Focus:** High-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-blue-500`).
- **Screen Reader Announcements:** ARIA live region (`aria-live="polite"`, `role="status"`) announces preset selections, plan generation, and reflow recalculations.
- **Heatmap Alternative:** Toggleable **Accessible Table Alternative** with `<caption>`, `<th scope="col">`, and `<th scope="row">` so risk is never conveyed by color alone.
- **Contrast Ratio:** All foreground/background color combinations exceed $4.5:1$.

---

## 8. Security & Input Sanitization

- **Zero Secrets in Repository:** `GEMINI_API_KEY` stored exclusively in environment variables. `.env` is git-ignored; `.env.example` provided.
- **Prompt Injection Defense:** Neutralizes system delimiters (`[SYSTEM]`, `[INSTRUCTION]`, backticks) and limits string lengths. User data enclosed in `<EVENT_DATA>` tags.
- **XSS Prevention:** HTML characters are escaped prior to output rendering.
- **Rate Limiting:** In-memory token bucket limits API calls to 60 requests per minute per IP.
- **Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict cache control.

---

## 9. Quickstart & Installation

### Prerequisites

- Node.js 18+ (tested on Node.js v24)
- npm 9+

### Setup

```bash
# 1. Clone repository
git clone https://github.com/RohetM/Plan.git
cd Plan

# 2. Install dependencies
npm install

# 3. Configure environment variables (Optional: app functions fully offline via fallback)
cp .env.example .env.local
# Add your GEMINI_API_KEY if desired

# 4. Run tests
npm test

# 5. Run development server
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

---

## 10. Test Suite Coverage

Run the complete test suite:

```bash
npm test
```

**Results: 35 passing unit & integration tests:**

- `tests/budget.test.ts`: Allocations sum to 100%, buffer floor enforced ($\ge 8\%$), what-if reallocation rebalancing.
- `tests/risk.test.ts`: Boundary values (33/34, 66/67), outdoor exposure elevation, mitigation math, buffer adequacy.
- `tests/monteCarlo.test.ts`: Seeded RNG reproducibility, triangular bounds, P90 $\ge$ P50, category volatility.
- `tests/timeline.test.ts`: Time conversions, downstream task shifting, curfew violations, SMS/email vendor draft generation.
- `tests/validation.test.ts`: Zod schema validation, XSS escaping, prompt injection neutralization, IP rate limiting.
- `tests/llmFallback.test.ts`: Offline deterministic generation, dietary/accessibility reflection, preset persona validation.

---

## 11. 3-Minute Demo Walkthrough Script

1. **0:00 - 0:20 (The Hook):** "Most event planners only design for the happy path. But on the day, events fail on the unhappy path. Plan-B is an event stress-tester that builds your plan, then stress-tests it against disasters."
2. **0:20 - 1:00 (The Baseline):** Click **"🌸 Priya (Wedding)"** preset. Walk through the 4 views:
   - _Budget:_ Show the 10% contingency buffer floor and visual allocation.
   - _Timeline:_ Show prep countdown items and day-of run-of-show.
   - _Vendors:_ Show interview questions, red flags, and backup options.
   - _Ideas:_ Show gluten-free/nut-free menu and wheelchair access provisions.
3. **1:00 - 2:00 (The Differentiator - Stress Test):**
   - Click **"Sudden Downpour"**. Watch the Risk Score and Buffer Adequacy gauge update in real-time.
   - Show the **Disaster Vulnerability Heatmap** and toggle to the **Accessible Table View**.
4. **2:00 - 2:30 (Monte Carlo Range):**
   - Scroll to the **Monte Carlo Variance Card**: "Running 1,000 trials shows a P90 worst-case cost 12% above estimate, proving why our 10% buffer is mandatory."
5. **2:30 - 2:50 (Day-Of Mode):**
   - Click **"Day-Of Mode"** &rarr; select **"+25 min late"**.
   - Show downstream schedule shift, fixed cutoff alert, and copy emergency SMS for the caterer.
6. **2:50 - 3:00 (Close):**
   - Click **"Export"** &rarr; "Full Markdown and PDF-ready summary with zero external data leaks, WCAG 2.2 AA accessibility, and 35 automated tests."

---

## 12. Verification & Submission Checklist

- [x] **Challenge Pillars Covered:** Budget, Timeline, Vendor Checklist, Personalized Ideas.
- [x] **Differentiator:** Multi-scenario stress simulation, quantitative risk scoring, contingency costs, and disaster heatmap.
- [x] **Deterministic Core:** Deterministic mathematical engines with unit tests; LLM used for generative enrichment.
- [x] **Graceful Fallback:** 100% functional without an API key or when offline.
- [x] **WCAG 2.2 AA Accessible:** Semantic landmarks, high contrast, ARIA live regions, table alternative for heatmap.
- [x] **Security Hardened:** Prompt injection sanitization, HTML escaping, rate limiting, no committed secrets.
- [x] **Automated Tests:** 35 passing tests (`npm test`).
- [x] **Repo Size:** Clean, under 10 MB (no heavy media or build bloat committed).
