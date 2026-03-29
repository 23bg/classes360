import { describe, expect, it } from "vitest";
import { buildImraboPrompt } from "@/modules/ai/server/imrabo-prompt";

describe("imrabo prompt", () => {
    it("includes strict non-hallucination instructions", () => {
        const prompt = buildImraboPrompt({
            userMessage: "How to create a course?",
            documentationContext: "Slug: create-course",
            history: [],
        });

        expect(prompt.systemInstruction).toContain("using only the provided documentation context");
        expect(prompt.systemInstruction).toContain("Do not invent");
    });

    it("includes user question and docs", () => {
        const prompt = buildImraboPrompt({
            userMessage: "Billing help",
            documentationContext: "Slug: billing",
            history: [{ role: "user", text: "Need billing steps" }],
        });

        expect(prompt.userPrompt).toContain("Documentation context");
        expect(prompt.userPrompt).toContain("Billing help");
    });
});
