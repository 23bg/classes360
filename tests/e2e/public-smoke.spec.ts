import { expect, test } from "@playwright/test";

test("public home renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Start Free Trial" })).toBeVisible();
});

test("pricing page shows both plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Starter System")).toBeVisible();
    await expect(page.getByText("Growth System")).toBeVisible();
    const starterCard = page.locator('[data-slot="card"]').filter({ hasText: "Starter System" });
    const growthCard = page.locator('[data-slot="card"]').filter({ hasText: "Growth System" });
    await expect(starterCard.getByText("₹999", { exact: true })).toBeVisible();
    await expect(growthCard.getByText("₹1,999", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Solo Trial" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start (Team|Growth) Trial/ })).toBeVisible();
});
