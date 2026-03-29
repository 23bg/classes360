import { describe, expect, it } from "vitest";
import { DEFAULT_PLAN_TYPE, isPlanType, PLAN_CONFIG } from "@/config/plans";

describe("plans config", () => {
    it("has expected default plan", () => {
        expect(DEFAULT_PLAN_TYPE).toBe("STARTER");
    });

    it("has valid pricing and user limits", () => {
        expect(PLAN_CONFIG.STARTER.priceMonthly).toBe(999);
        expect(PLAN_CONFIG.STARTER.userLimit).toBe(1);
        expect(PLAN_CONFIG.GROWTH.priceMonthly).toBe(1999);
        expect(PLAN_CONFIG.GROWTH.userLimit).toBe(10);
        expect(PLAN_CONFIG.SCALE.priceMonthly).toBe(4999);
        expect(PLAN_CONFIG.SCALE.userLimit).toBe(50);
    });

    it("validates plan type inputs", () => {
        expect(isPlanType("STARTER")).toBe(true);
        expect(isPlanType("GROWTH")).toBe(true);
        expect(isPlanType("SCALE")).toBe(true);
        expect(isPlanType("ENTERPRISE")).toBe(false);
    });
});
