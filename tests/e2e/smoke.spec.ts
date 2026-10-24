import { test, expect } from "@playwright/test";

test.describe("Plan-B Event Stress-Tester End-to-End Flow", () => {
  test("main user journey: intake, 4 views, stress test, and day-of late reflow", async ({
    page,
  }) => {
    test.setTimeout(180000);

    // 1. Visit App
    await page.goto("/");
    await expect(page).toHaveTitle(/Plan-B/i);

    // 2. Open Intake Form
    const openIntakeBtn = page.getByRole("button", {
      name: /Edit event intake details|New \/ Edit Plan/i,
    });
    await openIntakeBtn.click();

    // Verify modal is open with dialog role
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Fill intake form
    await page.fill("#event-title", "Priya's Sunset Garden Wedding");
    await page.selectOption("#event-type", "wedding");
    await page.selectOption("#event-location", "outdoor");
    await page.fill("#event-guests", "120");
    await page.fill("#event-budget", "35000");

    // Submit and generate plan
    const submitBtn = page.getByRole("button", {
      name: /Generate Resilient Plan/i,
    });
    await submitBtn.click();

    // Modal closes and plan is rendered (allow up to 120s for live LLM synthesis)
    await expect(dialog).not.toBeVisible({ timeout: 120000 });
    await expect(page.locator("h1")).toContainText("Priya's Sunset Garden Wedding");

    // 3. Visit Budget View
    const budgetTab = page.getByRole("tab", { name: /Budget & Buffer/i });
    await budgetTab.click();
    await expect(
      page.getByRole("heading", { name: /Resilient Budget Allocation/i })
    ).toBeVisible();
    await expect(page.getByText(/Contingency Buffer/i).first()).toBeVisible();
    await expect(page.getByText(/Allocation Distribution/i)).toBeVisible();

    // 4. Visit Timeline View
    const timelineTab = page.getByRole("tab", { name: /Timeline & Run-of-Show/i });
    await timelineTab.click();
    await expect(
      page.getByRole("heading", { name: /Timeline & Run-of-Show/i })
    ).toBeVisible();
    await expect(page.getByText(/Day-Of Run-of-Show/i)).toBeVisible();

    // 5. Visit Vendor Checklist View
    const vendorTab = page.getByRole("tab", { name: /Vendor Checklist/i });
    await vendorTab.click();
    await expect(page.getByText(/Procurement & Vendor Risk Checklist/i)).toBeVisible();

    // 6. Visit Ideas & Inclusivity View
    const ideasTab = page.getByRole("tab", { name: /Ideas/i });
    await ideasTab.click();
    await expect(page.getByText(/Curated Event Concept/i)).toBeVisible();
    await expect(page.getByText(/Decor & Ambient Styling/i)).toBeVisible();

    // 7. Open Crisis Stress-Test View
    const stressTab = page.getByRole("tab", { name: /Crisis Stress-Test/i });
    await stressTab.click();
    await expect(
      page.getByRole("heading", { name: /Disaster Stress-Testing Engine/i })
    ).toBeVisible();

    // Run Rain scenario
    const rainScenarioBtn = page.getByRole("button", { name: /Sudden Downpour/i });
    await rainScenarioBtn.click();
    await expect(page.getByText(/Disaster Vulnerability Heatmap/i)).toBeVisible();

    // Run Vendor No-Show scenario
    const vendorCancelBtn = page.getByRole("button", { name: /Vendor No-Show/i });
    await vendorCancelBtn.click();
    await expect(page.getByText(/Contingency Deployment Cost/i)).toBeVisible();

    // Toggle Accessible Table Alternative
    const tableToggleBtn = page.getByRole("button", {
      name: /Switch to accessible data table view|Accessible Table/i,
    });
    await tableToggleBtn.click();
    await expect(page.getByRole("table", { name: /Risk Heatmap Data Alternative/i })).toBeVisible();

    // 8. Open Day-Of Mode
    const dayOfBtn = page.getByRole("button", { name: /Day-Of Mode/i }).first();
    await dayOfBtn.click();

    const dayOfModal = page.getByRole("dialog");
    await expect(dayOfModal).toBeVisible();
    await expect(dayOfModal).toContainText("Day-Of Timeline Reflow");

    // Apply delay reflow
    const applyReflowBtn = dayOfModal.getByRole("button", {
      name: /Apply Adjusted Timeline to Day-Of Board|Apply Reflow/i,
    });
    await applyReflowBtn.click();
    await expect(dayOfModal).not.toBeVisible();
  });
});
