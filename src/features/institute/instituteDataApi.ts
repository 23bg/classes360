import { prisma } from "@/lib/db/prisma";

type UpdateInstituteInput = {
    name?: string;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    address?: {
        addressLine1?: string | null;
        addressLine2?: string | null;
        city?: string | null;
        state?: string | null;
        region?: string | null;
        postalCode?: string | null;
        country?: string | null;
        countryCode?: string | null;
    } | null;
    timings?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string | null;
    banner?: string | null;
    heroImage?: string | null;
    googleMapLink?: string | null;
    websiteUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
    isOnboarded?: boolean;
    whatsappOnboardingSent?: boolean;
    slug?: string;
    customDomain?: string | null;
    domainVerified?: boolean;
    domainStatus?: "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";
};

export const instituteRepository = {
    findById: async (id: string) => prisma.institute.findUnique({ where: { id } }),

    findBySlug: async (slug: string) => prisma.institute.findUnique({ where: { slug } }),

    findByCustomDomain: async (host: string) =>
        prisma.institute.findFirst({
            where: { customDomain: host.toLowerCase() },
        }),

    isSlugTaken: async (slug: string, excludeInstituteId?: string) => {
        const existing = await prisma.institute.findUnique({ where: { slug } });
        if (!existing) return false;
        if (!excludeInstituteId) return true;
        return existing.id !== excludeInstituteId;
    },

    create: async (input: { name?: string | null; slug?: string | null; isOnboarded?: boolean }) =>
        prisma.institute.create({
            data: {
                name: input.name ?? null,
                slug: input.slug ?? null,
                isOnboarded: input.isOnboarded ?? false,
            },
        }),

    updateById: async (id: string, input: UpdateInstituteInput) =>
        prisma.institute.update({
            where: { id },
            data: (() => {
                const { address, ...rest } = input;

                if (address === undefined) {
                    return rest;
                }

                if (address === null) {
                    return {
                        ...rest,
                        address: { unset: true },
                    };
                }

                return {
                    ...rest,
                    address: { set: address },
                };
            })(),
        }),

    upsertDomainRecord: async (input: {
        instituteId: string;
        host: string;
        surface: string;
        status?: "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";
        active?: boolean;
    }) =>
        prisma.instituteDomain.upsert({
            where: { host: input.host.toLowerCase() },
            create: {
                instituteId: input.instituteId,
                host: input.host.toLowerCase(),
                surface: input.surface,
                status: input.status ?? "PENDING",
                active: input.active ?? false,
            },
            update: {
                instituteId: input.instituteId,
                surface: input.surface,
                status: input.status,
                active: input.active,
                ...(input.status === "VERIFIED" || input.status === "ACTIVE"
                    ? { verifiedAt: new Date() }
                    : {}),
            },
        }),

    getDomainRecord: async (host: string) =>
        prisma.instituteDomain.findUnique({ where: { host: host.toLowerCase() } }),
};
