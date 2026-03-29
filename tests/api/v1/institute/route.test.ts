import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, PUT } from "@/app/api/v1/institute/route";

const { mockReadSessionFromCookie, mockInstituteService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockInstituteService: {
        getInstitute: vi.fn(),
        updateProfile: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/institute/services/institute.service", () => ({
    instituteService: mockInstituteService,
}));

describe("/api/v1/institute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("GET returns institute profile", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ userId: "u1" });
        mockInstituteService.getInstitute.mockResolvedValue({ id: "inst1" });

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockInstituteService.getInstitute).toHaveBeenCalledWith("u1");
    });

    it("PUT returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/institute", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Acme" }),
        });

        const response = await PUT(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockInstituteService.updateProfile).not.toHaveBeenCalled();
    });

    it("PUT updates institute profile for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockInstituteService.updateProfile.mockResolvedValue({ id: "inst1", name: "Acme" });

        const request = new Request("http://localhost/api/v1/institute", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: "Acme",
                address: {
                    addressLine1: "Main road",
                    city: "Pune",
                    state: "MH",
                    country: "India",
                },
            }),
        });

        const response = await PUT(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockInstituteService.updateProfile).toHaveBeenCalledWith("inst1", {
            name: "Acme",
            address: {
                addressLine1: "Main road",
                city: "Pune",
                state: "MH",
                country: "India",
            },
        });
    });

    it("PUT forwards service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockInstituteService.updateProfile.mockRejectedValue(new AppError("Slug exists", 409, "SLUG_ALREADY_EXISTS"));

        const request = new Request("http://localhost/api/v1/institute", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Acme" }),
        });

        const response = await PUT(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("SLUG_ALREADY_EXISTS");
    });
});
