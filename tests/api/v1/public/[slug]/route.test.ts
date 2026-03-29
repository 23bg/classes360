import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET } from "@/app/api/v1/public/[slug]/route";

const { mockInstituteService } = vi.hoisted(() => ({
    mockInstituteService: {
        getPublicPage: vi.fn(),
    },
}));

vi.mock("@/features/institute/services/institute.service", () => ({
    instituteService: mockInstituteService,
}));

describe("GET /api/v1/public/[slug]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns public page data", async () => {
        mockInstituteService.getPublicPage.mockResolvedValue({ id: "inst1", slug: "acme" });

        const response = await GET(new Request("http://localhost/api/v1/public/acme") as never, {
            params: Promise.resolve({ slug: "acme" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockInstituteService.getPublicPage).toHaveBeenCalledWith("acme");
    });

    it("maps service errors", async () => {
        mockInstituteService.getPublicPage.mockRejectedValue(new AppError("Not found", 404, "INSTITUTE_NOT_FOUND"));

        const response = await GET(new Request("http://localhost/api/v1/public/bad") as never, {
            params: Promise.resolve({ slug: "bad" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error.code).toBe("INSTITUTE_NOT_FOUND");
    });
});
