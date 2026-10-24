import { test, expect } from "@playwright/test";
 
test.use({
  viewport: { width: 1280, height: 720 },
  video: {
    mode: "on",
    size: { width: 1280, height: 720 },
  },
});

test.describe("Record Plan-B Product Demo Video", () => {

  test("full end-to-end product demo walkthrough (~2:35)", async ({ page }) => {
    test.setTimeout(240000); // 4 min timeout for paced demonstration

    // Helper for smooth delays
    const pause = (ms: number) => page.waitForTimeout(ms);

    // ==========================================
    // 1. Visit App & Preset Intake (0:00 - 0:30)
    // ==========================================
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await pause(3000);

    // Open Intake Form modal
    const openIntakeBtn = page.getByRole("button", {
      name: /Edit event intake details|New \/ Edit Plan/i,
    });
    await openIntakeBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await pause(2000);

    // Populate with 120-guest outdoor wedding preset details
    await page.fill("#event-title", "Priya & Marcus's Sunset Garden Wedding");
    await pause(1000);
    await page.selectOption("#event-type", "wedding");
    await pause(1000);
    await page.selectOption("#event-location", "outdoor");
    await pause(1000);
    await page.fill("#event-guests", "120");
    await pause(1000);
    await page.fill("#event-budget", "35000");
    await pause(2000);

    // Submit and generate resilient plan
    const submitBtn = page.getByRole("button", {
      name: /Generate Resilient Plan/i,
    });
    await submitBtn.click();

    // Modal closes upon synthesis completion
    await expect(dialog).not.toBeVisible({ timeout: 60000 });
    await pause(3000);

    // ==========================================
    // 2. Explore 4 Core Views (0:30 - 1:15)
    // ==========================================
    // --- Pillar 1: Budget View ---
    const budgetTab = page.getByRole("tab", { name: /Budget & Buffer/i });
    await budgetTab.click();
    await pause(2000);

    // Scroll down to examine buffer and Monte Carlo simulation
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await pause(4000);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await pause(4000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(2000);

    // --- Pillar 2: Timeline View ---
    const timelineTab = page.getByRole("tab", { name: /Timeline & Run-of-Show/i });
    await timelineTab.click();
    await pause(2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await pause(4000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(2000);

    // --- Pillar 3: Vendor Checklist View ---
    const vendorTab = page.getByRole("tab", { name: /Vendor Checklist/i });
    await vendorTab.click();
    await pause(2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await pause(4000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(2000);

    // --- Pillar 4: Personalized Ideas View ---
    const ideasTab = page.getByRole("tab", { name: /Personalized Ideas/i });
    await ideasTab.click();
    await pause(2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await pause(4000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(2000);

    // ==========================================
    // 3. Crisis Stress-Test Engine (1:15 - 1:55)
    // ==========================================
    const stressTab = page.getByRole("tab", { name: /Crisis Stress-Test/i });
    await stressTab.click();
    await pause(3000);

    // Trigger Scenario 1: Sudden Downpour (Rain)
    const rainBtn = page.getByRole("button", { name: /Sudden Downpour/i });
    await rainBtn.click();
    await pause(3000);

    // Scroll to examine live weather banner, severity score, and buffer health
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
    await pause(4000);

    // Trigger Scenario 2: Vendor No-Show
    const vendorCancelBtn = page.getByRole("button", { name: /Vendor No-Show/i });
    await vendorCancelBtn.click();
    await pause(4000);

    // Scroll to examine Disaster Vulnerability Heatmap
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await pause(4000);

    // Toggle Accessible Data Table alternative
    const tableToggleBtn = page.getByRole("button", {
      name: /Switch to accessible data table view|Accessible Table/i,
    });
    await tableToggleBtn.click();
    await pause(5000);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(2000);

    // ==========================================
    // 4. Day-Of Mode: Running Late (1:55 - 2:20)
    // ==========================================
    const dayOfBtn = page.getByRole("button", { name: /Day-Of Mode/i }).first();
    await dayOfBtn.click();

    const dayOfModal = page.getByRole("dialog");
    await expect(dayOfModal).toBeVisible();
    await pause(3000);

    // Select +25 min delay preset
    const delay25Btn = dayOfModal.getByRole("button", { name: "+25m" });
    if (await delay25Btn.isVisible()) {
      await delay25Btn.click();
    }
    await pause(3000);

    // Show adjusted run-of-show and emergency drafts
    await page.evaluate(() => {
      const modalScroll = document.querySelector('[role="dialog"] .overflow-y-auto');
      if (modalScroll) modalScroll.scrollBy({ top: 200, behavior: "smooth" });
    });
    await pause(4000);

    // Apply reflow to day-of board
    const applyReflowBtn = dayOfModal.getByRole("button", {
      name: /Apply Adjusted Timeline to Day-Of Board|Apply Reflow/i,
    });
    await applyReflowBtn.click();
    await expect(dayOfModal).not.toBeVisible();
    await pause(3000);

    // ==========================================
    // 5. Keyboard Navigation & Footer (2:20 - 2:40)
    // ==========================================
    // Demonstrate accessible keyboard focus traversal
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      await pause(800);
    }
    await pause(2000);

    // Scroll to footer displaying verified status
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
    await pause(5000);
  });
});
