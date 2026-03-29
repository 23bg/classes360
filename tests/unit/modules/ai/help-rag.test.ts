import { describe, expect, it } from "vitest";
import { buildHelpContext, searchHelpDocs } from "@/modules/ai/server/help-rag";

describe("help-rag", () => {
    it("returns relevant docs for enquiry query", () => {
        const docs = searchHelpDocs("how to add enquiry", 3);
        expect(docs.length).toBeGreaterThan(0);
        expect(docs.some((doc) => doc.slug === "add-enquiry")).toBe(true);
    });

    it("builds compact context text", () => {
        const result = buildHelpContext("billing alerts", 2);
        expect(result.docs.length).toBeGreaterThan(0);
        expect(result.contextText.length).toBeGreaterThan(20);
    });
});
