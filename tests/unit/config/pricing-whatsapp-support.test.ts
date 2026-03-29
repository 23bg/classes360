import { describe, expect, it } from "vitest";
import { PLAN_CONFIG } from "@/config/plans";
import messages from "@/messages/en.json";

describe("pricing copy for WhatsApp sender support", () => {
    it("keeps monthly WhatsApp limits aligned with plan config", () => {
        expect(PLAN_CONFIG.STARTER.whatsappMonthlyLimit).toBe(1000);
        expect(PLAN_CONFIG.GROWTH.whatsappMonthlyLimit).toBe(3000);
        expect(PLAN_CONFIG.SCALE.whatsappMonthlyLimit).toBe(10000);
    });

    it("exposes custom sender capability in pricing copy", () => {
        expect(messages.pricing.whatsAppSenderModesLine).toContain("Classes360 system number");
        expect(messages.pricing.whatsAppSenderModesLine).toContain("own WhatsApp Business number");
        expect(messages.pricing.tableCustomWhatsAppNumber).toBe("Custom WhatsApp Number");
    });
});
