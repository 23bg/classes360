import { NextRequest } from "next/server";

export type AppSurface = "marketing" | "portal" | "student" | "institutePublic";

export type ResolvedHost = {
    surface: AppSurface;
    hostname: string;
    instituteSlug?: string;
};

type CustomDomainMapping = {
    host: string;
    surface: Exclude<AppSurface, "marketing">;
    instituteSlug?: string;
};

const ROOT_DOMAIN = (process.env.APP_ROOT_DOMAIN ?? "classes360.online").toLowerCase();
const PORTAL_SUBDOMAIN = (process.env.APP_PORTAL_SUBDOMAIN ?? "portal").toLowerCase();
const STUDENT_SUBDOMAIN = (process.env.APP_STUDENT_SUBDOMAIN ?? "student").toLowerCase();

const RESERVED_SUBDOMAINS = new Set([
    "www",
    "api",
    PORTAL_SUBDOMAIN,
    STUDENT_SUBDOMAIN,
]);

const safeParseCustomDomainMappings = (): CustomDomainMapping[] => {
    const raw = process.env.CUSTOM_DOMAIN_MAPPINGS;
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as Array<{
            host?: string;
            surface?: Exclude<AppSurface, "marketing">;
            instituteSlug?: string;
        }>;

        return parsed
            .filter((item) => Boolean(item.host) && Boolean(item.surface))
            .map((item) => ({
                host: String(item.host).toLowerCase(),
                surface: item.surface as Exclude<AppSurface, "marketing">,
                instituteSlug: item.instituteSlug,
            }))
            .filter((item) => item.surface !== "institutePublic" || Boolean(item.instituteSlug));
    } catch {
        return [];
    }
};

const CUSTOM_DOMAIN_MAPPINGS = safeParseCustomDomainMappings();

const stripPort = (host: string) => host.split(":")[0].toLowerCase();

export const getRequestHostname = (req: NextRequest): string => {
    const forwarded = req.headers.get("x-forwarded-host");
    const host = forwarded ?? req.headers.get("host") ?? "";
    return stripPort(host);
};

const getWildcardSlug = (hostname: string): string | null => {
    if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null;
    const suffix = `.${ROOT_DOMAIN}`;
    const sub = hostname.slice(0, -suffix.length);
    if (!sub || sub.includes(".")) return null;
    if (RESERVED_SUBDOMAINS.has(sub)) return null;
    return sub;
};

const resolveCustomDomain = (hostname: string): ResolvedHost | null => {
    const mapping = CUSTOM_DOMAIN_MAPPINGS.find((item) => item.host === hostname);
    if (!mapping) return null;

    return {
        surface: mapping.surface,
        hostname,
        instituteSlug: mapping.instituteSlug,
    };
};

export const resolveHost = (hostname: string): ResolvedHost => {
    const apexHosts = new Set([ROOT_DOMAIN, `www.${ROOT_DOMAIN}`, "localhost", "127.0.0.1"]);
    if (apexHosts.has(hostname) || hostname.endsWith(".vercel.app")) {
        return { surface: "marketing", hostname };
    }

    if (hostname === `${PORTAL_SUBDOMAIN}.${ROOT_DOMAIN}`) {
        return { surface: "portal", hostname };
    }

    if (hostname === `${STUDENT_SUBDOMAIN}.${ROOT_DOMAIN}`) {
        return { surface: "student", hostname };
    }

    const wildcardSlug = getWildcardSlug(hostname);
    if (wildcardSlug) {
        return {
            surface: "institutePublic",
            hostname,
            instituteSlug: wildcardSlug,
        };
    }

    const custom = resolveCustomDomain(hostname);
    if (custom) return custom;

    return { surface: "marketing", hostname };
};
