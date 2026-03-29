import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { POST } from "@/app/api/v1/public/[slug]/lead/route";

const { mockLeadService, mockRateLimit } = vi.hoisted(() => ({
    mockLeadService: {
        createLeadBySlug: vi.fn(),
    },
    mockRateLimit: vi.fn(),
}));

vi.mock("@/server/services/leads.service", () => ({
    leadService: mockLeadService,
}));

vi.mock("@/lib/utils/rateLimit", () => ({
    enforceRateLimit: mockRateLimit,
}));

describe("POST /api/v1/public/[slug]/lead", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRateLimit.mockReturnValue({ ok: true, retryAfter: 0 });
    });

    it("creates lead for JSON submission", async () => {
        mockLeadService.createLeadBySlug.mockResolvedValue({ id: "l1", instituteId: "inst1" });

        const request = new Request("http://localhost/api/v1/public/acme/lead", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-forwarded-for": "1.2.3.4",
            },
            body: JSON.stringify({ name: "Rahul", phone: "9876543210", course: "JEE" }),
        });

        const response = await POST(request as never, { params: Promise.resolve({ slug: "acme" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockLeadService.createLeadBySlug).toHaveBeenCalledWith("acme", {
            name: "Rahul",
            phone: "9876543210",
            course: "JEE",
        });
    });

    it("returns duplicate lead error with details", async () => {
        mockLeadService.createLeadBySlug.mockRejectedValue(
            new AppError("Lead exists", 409, "DUPLICATE_LEAD", { existingLeadId: "l1" })
        );

        const request = new Request("http://localhost/api/v1/public/acme/lead", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Rahul", phone: "9876543210" }),
        });

        const response = await POST(request as never, { params: Promise.resolve({ slug: "acme" }) });
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error.code).toBe("DUPLICATE_LEAD");
        expect(body.error.details).toEqual({ existingLeadId: "l1" });
    });

    it("returns rate limited when throttle trips", async () => {
        mockRateLimit.mockReturnValue({ ok: false, retryAfter: 12 });

        const request = new Request("http://localhost/api/v1/public/acme/lead", {
            method: "POST",
            headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
            body: JSON.stringify({ name: "Rahul", phone: "9876543210" }),
        });

        const response = await POST(request as never, { params: Promise.resolve({ slug: "acme" }) });
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body.error.code).toBe("RATE_LIMITED");
    });
});
