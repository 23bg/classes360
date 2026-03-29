import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/pricing", "/features", "/about", "/contact", "/privacy", "/terms", "/demo-institute"];

for (const route of publicRoutes) {
    test(`public route ${route} is reachable`, async ({ request }) => {
        const response = await request.get(route);
        expect(response.ok()).toBeTruthy();
    });
}
