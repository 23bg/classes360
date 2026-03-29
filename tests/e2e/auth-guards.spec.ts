import { expect, test } from "@playwright/test";

test("unauthenticated protected route redirects to login with next", async ({ page }) => {
    await page.goto("/students");
    await expect(page).toHaveURL(/\/login\?next=%2Fstudents/);
});

test("unauthenticated onboarding route redirects to login", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login$/);
});
