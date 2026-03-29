import { describe, expect, it } from "vitest";
import { NOTIFICATION_EVENTS, NOTIFICATION_EVENT_RULES } from "@/lib/notifications/event-catalog";

describe("notification event catalog", () => {
    it("contains a rule for every event", () => {
        for (const event of NOTIFICATION_EVENTS) {
            expect(NOTIFICATION_EVENT_RULES[event]).toBeDefined();
        }
    });

    it("defines at least one channel and one audience per event", () => {
        for (const event of NOTIFICATION_EVENTS) {
            const rule = NOTIFICATION_EVENT_RULES[event];
            expect(rule.channels.length).toBeGreaterThan(0);
            expect(rule.defaultAudiences.length).toBeGreaterThan(0);
        }
    });
});
