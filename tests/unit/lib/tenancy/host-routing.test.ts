import { describe, expect, it, vi } from "vitest";

const makeResolver = async (envOverrides?: Record<string, string | undefined>) => {
    vi.resetModules();

    if (envOverrides) {
        for (const [key, value] of Object.entries(envOverrides)) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }

    return import("@/lib/tenancy/host-routing");
};

describe("host routing resolver", () => {
    it("resolves platform apex as marketing", async () => {
        const { resolveHost } = await makeResolver({
            APP_ROOT_DOMAIN: "classes360.online",
            CUSTOM_DOMAIN_MAPPINGS: undefined,
        });

        expect(resolveHost("classes360.online")).toEqual({
            surface: "marketing",
            hostname: "classes360.online",
        });
    });

    it("resolves portal and student reserved subdomains", async () => {
        const { resolveHost } = await makeResolver({
            APP_ROOT_DOMAIN: "classes360.online",
            APP_PORTAL_SUBDOMAIN: "portal",
            APP_STUDENT_SUBDOMAIN: "student",
            CUSTOM_DOMAIN_MAPPINGS: undefined,
        });

        expect(resolveHost("portal.classes360.online")).toEqual({
            surface: "portal",
            hostname: "portal.classes360.online",
        });

        expect(resolveHost("student.classes360.online")).toEqual({
            surface: "student",
            hostname: "student.classes360.online",
        });
    });

    it("resolves wildcard institute subdomain", async () => {
        const { resolveHost } = await makeResolver({
            APP_ROOT_DOMAIN: "classes360.online",
            CUSTOM_DOMAIN_MAPPINGS: undefined,
        });

        expect(resolveHost("abcacademy.classes360.online")).toEqual({
            surface: "institutePublic",
            hostname: "abcacademy.classes360.online",
            instituteSlug: "abcacademy",
        });
    });

    it("does not treat reserved names as tenant wildcard", async () => {
        const { resolveHost } = await makeResolver({
            APP_ROOT_DOMAIN: "classes360.online",
            APP_PORTAL_SUBDOMAIN: "portal",
            APP_STUDENT_SUBDOMAIN: "student",
            CUSTOM_DOMAIN_MAPPINGS: undefined,
        });

        expect(resolveHost("api.classes360.online")).toEqual({
            surface: "marketing",
            hostname: "api.classes360.online",
        });
    });

    it("resolves custom white-label domains from mapping", async () => {
        const { resolveHost } = await makeResolver({
            APP_ROOT_DOMAIN: "classes360.online",
            CUSTOM_DOMAIN_MAPPINGS: JSON.stringify([
                { host: "portal.abcacademy.com", surface: "portal", instituteSlug: "abcacademy" },
                { host: "crm.xyzacademy.com", surface: "portal", instituteSlug: "xyzacademy" },
            ]),
        });

        expect(resolveHost("portal.abcacademy.com")).toEqual({
            surface: "portal",
            hostname: "portal.abcacademy.com",
            instituteSlug: "abcacademy",
        });

        expect(resolveHost("crm.xyzacademy.com")).toEqual({
            surface: "portal",
            hostname: "crm.xyzacademy.com",
            instituteSlug: "xyzacademy",
        });
    });
});
