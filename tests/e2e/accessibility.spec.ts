import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("WCAG 2.2 AA Accessibility Audits", () => {
  test("main page passes axe scan with zero serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const scanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const seriousOrCritical = scanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    if (seriousOrCritical.length > 0) {
      console.error(
        "Axe violations on main page:",
        JSON.stringify(seriousOrCritical, null, 2)
      );
    }

    expect(seriousOrCritical).toEqual([]);
  });

  test("stress test view passes axe scan with zero serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Ensure Stress Test view is active
    const stressTab = page.getByRole("tab", { name: /Crisis Stress-Test/i });
    await stressTab.click();
    await page.waitForTimeout(500);

    const scanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const seriousOrCritical = scanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    if (seriousOrCritical.length > 0) {
      console.error(
        "Axe violations on stress test view:",
        JSON.stringify(seriousOrCritical, null, 2)
      );
    }

    expect(seriousOrCritical).toEqual([]);
  });
});
