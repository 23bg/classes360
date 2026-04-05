import { z } from "zod";
import dns from "node:dns/promises";
import { instituteRepository } from "@/features/institute/instituteDataApi";
import { userRepository } from "@/features/auth/userDataApi";
import { AppError } from "@/lib/utils/error";
import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils/phone";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const phoneSchema = z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone must be a valid Indian mobile number")
    .optional()
    .or(z.literal(""));

const urlSchema = z.string().trim().max(2048, "URL is too long").url().optional().or(z.literal(""));
const colorSchema = z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, "Color must be a hex value like #00BF63").optional().or(z.literal(""));
const domainSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "Enter a valid domain name")
    .optional()
    .or(z.literal(""));

const instituteNameSchema = z.string().trim().min(2, "Institute name must be at least 2 characters").max(80, "Institute name cannot exceed 80 characters");
const slugInputSchema = z.string().trim().min(2, "Slug must be at least 2 characters").max(80, "Slug cannot exceed 80 characters");
const descriptionSchema = z.string().trim().max(1024, "Description cannot exceed 1024 characters").optional().or(z.literal(""));
const cityStateSchema = z.string().trim().min(2, "Must be at least 2 characters").max(60, "Cannot exceed 60 characters").optional().or(z.literal(""));
const addressLineSchema = z.string().trim().min(5, "Address line 1 must be at least 5 characters").max(240, "Address line 1 cannot exceed 240 characters").optional().or(z.literal(""));
const addressLine2Schema = z.string().trim().max(240, "Address line 2 cannot exceed 240 characters").optional().or(z.literal(""));
const regionSchema = z.string().trim().max(60, "Region cannot exceed 60 characters").optional().or(z.literal(""));
const postalCodeSchema = z.string().trim().min(4, "Postal code must be at least 4 characters").max(12, "Postal code cannot exceed 12 characters").optional().or(z.literal(""));
const countrySchema = z.string().trim().min(2, "Country must be at least 2 characters").max(60, "Country cannot exceed 60 characters").optional().or(z.literal(""));
const countryCodeSchema = z.string().trim().max(8, "Country code cannot exceed 8 characters").optional().or(z.literal(""));
const timingsSchema = z.string().trim().max(80, "Timings cannot exceed 80 characters").optional().or(z.literal(""));

type AddressInput = {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
};

const normalizeSlug = (name: string): string =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const normalizeIndianPhone = (value: string | undefined): string | undefined => {
    if (value === undefined) return undefined;

    const trimmed = value.trim();
    if (!trimmed) return "";

    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        return digitsOnly.slice(2);
    }

    return digitsOnly;
};

const normalizeText = (value: string | undefined): string | null | undefined => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};

const hasAnyAddressInput = (address: AddressInput): boolean =>
    Object.values(address).some((value) => value !== undefined);

const toAddressInput = (payload: {
    address?: AddressInput | string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
}): AddressInput => {
    const fromObject = typeof payload.address === "object" && payload.address !== null ? payload.address : {};
    const fromString = typeof payload.address === "string" ? payload.address : undefined;

    return {
        addressLine1: payload.addressLine1 ?? fromObject.addressLine1 ?? fromString,
        addressLine2: payload.addressLine2 ?? fromObject.addressLine2,
        city: payload.city ?? fromObject.city,
        state: payload.state ?? fromObject.state,
        region: payload.region ?? fromObject.region,
        postalCode: payload.postalCode ?? fromObject.postalCode,
        country: payload.country ?? fromObject.country,
        countryCode: payload.countryCode ?? fromObject.countryCode,
    };
};

const validateAddressInput = (address: AddressInput) => {
    if (address.addressLine1 !== undefined) {
        addressLineSchema.parse(address.addressLine1);
    }
    if (address.addressLine2 !== undefined) {
        addressLine2Schema.parse(address.addressLine2);
    }
    if (address.city !== undefined) {
        cityStateSchema.parse(address.city);
    }
    if (address.state !== undefined) {
        cityStateSchema.parse(address.state);
    }
    if (address.region !== undefined) {
        regionSchema.parse(address.region);
    }
    if (address.postalCode !== undefined) {
        postalCodeSchema.parse(address.postalCode);
    }
    if (address.country !== undefined) {
        countrySchema.parse(address.country);
    }
    if (address.countryCode !== undefined) {
        countryCodeSchema.parse(address.countryCode);
    }
};

const mergeAddress = (
    current: {
        addressLine1?: string | null;
        addressLine2?: string | null;
        city?: string | null;
        state?: string | null;
        region?: string | null;
        postalCode?: string | null;
        country?: string | null;
        countryCode?: string | null;
    } | null | undefined,
    incoming: AddressInput
) => {
    const merged = {
        addressLine1: normalizeText(incoming.addressLine1) ?? current?.addressLine1 ?? null,
        addressLine2: normalizeText(incoming.addressLine2) ?? current?.addressLine2 ?? null,
        city: normalizeText(incoming.city) ?? current?.city ?? null,
        state: normalizeText(incoming.state) ?? current?.state ?? null,
        region: normalizeText(incoming.region) ?? current?.region ?? null,
        postalCode: normalizeText(incoming.postalCode) ?? current?.postalCode ?? null,
        country: normalizeText(incoming.country) ?? current?.country ?? "India",
        countryCode: normalizeText(incoming.countryCode) ?? current?.countryCode ?? null,
    };

    const hasContent = Object.values(merged).some((value) => Boolean(value));
    return hasContent ? merged : null;
};

const addressToText = (address: {
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
} | null | undefined): string =>
    [
        address?.addressLine1,
        address?.addressLine2,
        address?.city,
        address?.state,
        address?.region,
        address?.postalCode,
        address?.country,
    ]
        .filter((value): value is string => Boolean(value && value.trim().length > 0))
        .join(", ");

const withSocialLinks = <T extends {
    websiteUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string | null;
    customDomain?: string | null;
    domainVerified?: boolean;
    domainStatus?: string | null;
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
}>(institute: T) => ({
    ...institute,
    socialLinks: {
        website: institute.websiteUrl ?? "",
        instagram: institute.instagramUrl ?? "",
        facebook: institute.facebookUrl ?? "",
        youtube: institute.youtubeUrl ?? "",
        linkedin: institute.linkedinUrl ?? "",
    },
    branding: {
        logoUrl: institute.logoUrl ?? institute.logo ?? "",
        faviconUrl: institute.faviconUrl ?? institute.logo ?? "",
        primaryColor: institute.primaryColor ?? "#00BF63",
    },
    domains: {
        customDomain: institute.customDomain ?? "",
        domainVerified: Boolean(institute.domainVerified),
        domainStatus: institute.domainStatus ?? "PENDING",
    },
    addressText: addressToText(institute.address),
});

const hasText = (value: string | null | undefined): boolean => Boolean(value && value.trim().length > 0);

const tempSlugFromIdentity = (identity: string): string => {
    const base = identity
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 30);

    return `temp-${base || "classes360"}-${Date.now().toString(36)}`;
};

const ensureInstituteForUser = async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (user.instituteId) {
        const existingInstitute = await instituteRepository.findById(user.instituteId);
        if (existingInstitute) {
            return existingInstitute;
        }
    }

    const createdInstitute = await instituteRepository.create({
        name: null,
        slug: tempSlugFromIdentity(user.email || user.id),
        isOnboarded: false,
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { instituteId: createdInstitute.id },
    });

    return createdInstitute;
};

const sendOnboardingWhatsAppMessage = async (institute: {
    id: string;
    name: string | null;
    phone: string | null;
    whatsapp: string | null;
    whatsappOnboardingSent?: boolean;
}) => {
    if (institute.whatsappOnboardingSent) {
        return;
    }

    const destinationPhone = institute.whatsapp || institute.phone;
    if (!destinationPhone) {
        return;
    }

    const normalizedDestination = normalizePhone(destinationPhone);
    if (!normalizedDestination) {
        return;
    }

    await eventDispatcherService.dispatch({
        event: "INSTITUTE_ONBOARDING_COMPLETED",
        instituteId: institute.id,
        whatsappPhoneNumber: normalizedDestination,
        message: `Onboarding completed for ${institute.name || "your institute"}. Your workspace is ready to use.`,
        link: "/overview",
    });

    await instituteRepository.updateById(institute.id, { whatsappOnboardingSent: true });
};

export const instituteService = {
    async getInstitute(userId: string) {
        const institute = await ensureInstituteForUser(userId);

        return withSocialLinks(institute);
    },

    async getOverview(instituteId: string) {
        const institute = await instituteRepository.findById(instituteId);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }
        return withSocialLinks(institute);
    },

    async updateProfile(
        instituteId: string,
        payload: {
            name?: string;
            slug?: string;
            description?: string;
            phone?: string;
            whatsapp?: string;
            address?: AddressInput | string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            state?: string;
            region?: string;
            postalCode?: string;
            country?: string;
            countryCode?: string;
            timings?: string;
            logo?: string;
            logoUrl?: string;
            faviconUrl?: string;
            primaryColor?: string;
            customDomain?: string;
            banner?: string;
            heroImage?: string;
            googleMapLink?: string;
            socialLinks?: {
                website?: string;
                instagram?: string;
                facebook?: string;
                youtube?: string;
                linkedin?: string;
            };
            websiteUrl?: string;
            instagramUrl?: string;
            facebookUrl?: string;
            youtubeUrl?: string;
            linkedinUrl?: string;
        }
    ) {
        const normalizedPhone = normalizeIndianPhone(payload.phone);
        const normalizedWhatsapp = normalizeIndianPhone(payload.whatsapp);

        if (normalizedPhone !== undefined) {
            phoneSchema.parse(normalizedPhone);
        }

        if (normalizedWhatsapp !== undefined) {
            phoneSchema.parse(normalizedWhatsapp);
        }

        if (payload.name !== undefined) {
            instituteNameSchema.parse(payload.name);
        }
        if (payload.slug !== undefined) {
            slugInputSchema.parse(payload.slug);
        }

        if (payload.description !== undefined) {
            descriptionSchema.parse(payload.description);
        }
        const incomingAddress = toAddressInput(payload);
        if (hasAnyAddressInput(incomingAddress)) {
            validateAddressInput(incomingAddress);
        }
        if (payload.timings !== undefined) {
            timingsSchema.parse(payload.timings);
        }

        const websiteUrl = payload.socialLinks?.website ?? payload.websiteUrl;
        const instagramUrl = payload.socialLinks?.instagram ?? payload.instagramUrl;
        const facebookUrl = payload.socialLinks?.facebook ?? payload.facebookUrl;
        const youtubeUrl = payload.socialLinks?.youtube ?? payload.youtubeUrl;
        const linkedinUrl = payload.socialLinks?.linkedin ?? payload.linkedinUrl;
        const heroImage = payload.heroImage;
        const googleMapLink = payload.googleMapLink;

        [websiteUrl, instagramUrl, facebookUrl, youtubeUrl, linkedinUrl, heroImage, googleMapLink]
            .filter(Boolean)
            .forEach((url) => urlSchema.parse(url));

        if (payload.logoUrl !== undefined) urlSchema.parse(payload.logoUrl);
        if (payload.faviconUrl !== undefined) urlSchema.parse(payload.faviconUrl);
        if (payload.primaryColor !== undefined) colorSchema.parse(payload.primaryColor);
        if (payload.customDomain !== undefined) domainSchema.parse(payload.customDomain);

        const nextSlug = payload.slug
            ? normalizeSlug(payload.slug)
            : payload.name
                ? normalizeSlug(payload.name)
                : undefined;

        if (nextSlug) {
            const isTaken = await instituteRepository.isSlugTaken(nextSlug, instituteId);
            if (isTaken) {
                throw new AppError("Slug already in use", 409, "SLUG_ALREADY_EXISTS");
            }
        }

        const current = await instituteRepository.findById(instituteId);
        if (!current) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        const effectiveName = payload.name ?? current.name ?? "";
        const effectivePhone = normalizedPhone ?? current.phone;
        const nextAddress = hasAnyAddressInput(incomingAddress)
            ? mergeAddress(current.address, incomingAddress)
            : current.address;
        const isOnboarded =
            hasText(effectiveName) &&
            hasText(effectivePhone) &&
            hasText(nextAddress?.city) &&
            hasText(nextAddress?.state) &&
            hasText(nextAddress?.addressLine1);

        const updated = await instituteRepository.updateById(instituteId, {
            name: payload.name,
            slug: nextSlug,
            description: payload.description || null,
            phone: normalizedPhone || null,
            whatsapp: normalizedWhatsapp || null,
            address: hasAnyAddressInput(incomingAddress)
                ? mergeAddress(current.address, incomingAddress)
                : undefined,
            timings: payload.timings || null,
            logo: payload.logo || null,
            logoUrl: payload.logoUrl || payload.logo || null,
            faviconUrl: payload.faviconUrl || null,
            primaryColor: payload.primaryColor || null,
            customDomain: payload.customDomain ? payload.customDomain.trim().toLowerCase() : undefined,
            banner: payload.banner || null,
            heroImage: payload.heroImage || null,
            googleMapLink: payload.googleMapLink || null,
            websiteUrl: websiteUrl || null,
            instagramUrl: instagramUrl || null,
            facebookUrl: facebookUrl || null,
            youtubeUrl: youtubeUrl || null,
            linkedinUrl: linkedinUrl || null,
            isOnboarded,
        });

        await eventDispatcherService.dispatch({
            event: "INSTITUTE_PROFILE_UPDATED",
            instituteId,
            message: `Institute profile updated successfully for ${updated.name || "your institute"}.`,
            link: "/institute",
        });

        return withSocialLinks(updated);
    },

    async getDomainSettings(instituteId: string) {
        const institute = await instituteRepository.findById(instituteId);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        return {
            slug: institute.slug,
            customDomain: institute.customDomain ?? "",
            domainVerified: Boolean(institute.domainVerified),
            domainStatus: institute.domainStatus ?? "PENDING",
            defaultDomain: institute.slug ? `${institute.slug}.classes360.online` : "",
            dnsInstruction: {
                type: "CNAME",
                name: "portal",
                target: "cname.vercel-dns.com",
            },
        };
    },

    async saveCustomDomain(instituteId: string, customDomain: string, surface = "portal") {
        const parsed = domainSchema.parse(customDomain);
        const normalized = (parsed || "").trim().toLowerCase();
        if (!normalized) {
            throw new AppError("Custom domain is required", 400, "CUSTOM_DOMAIN_REQUIRED");
        }

        const existing = await instituteRepository.findByCustomDomain(normalized);
        if (existing && existing.id !== instituteId) {
            throw new AppError("Domain already in use by another institute", 409, "DOMAIN_ALREADY_IN_USE");
        }

        await instituteRepository.updateById(instituteId, {
            customDomain: normalized,
            domainVerified: false,
            domainStatus: "PENDING",
        });

        await instituteRepository.upsertDomainRecord({
            instituteId,
            host: normalized,
            surface,
            status: "PENDING",
            active: false,
        });

        return this.getDomainSettings(instituteId);
    },

    async verifyCustomDomain(instituteId: string, customDomain?: string) {
        const institute = await instituteRepository.findById(instituteId);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        const targetDomain = (customDomain || institute.customDomain || "").trim().toLowerCase();
        if (!targetDomain) {
            throw new AppError("No custom domain configured", 400, "CUSTOM_DOMAIN_REQUIRED");
        }

        const cnameRecords = await dns.resolveCname(targetDomain).catch(() => [] as string[]);
        const isVerified = cnameRecords.some((record) => record.toLowerCase().includes("vercel-dns.com"));

        await instituteRepository.updateById(instituteId, {
            customDomain: targetDomain,
            domainVerified: isVerified,
            domainStatus: isVerified ? "VERIFIED" : "FAILED",
        });

        await instituteRepository.upsertDomainRecord({
            instituteId,
            host: targetDomain,
            surface: "portal",
            status: isVerified ? "VERIFIED" : "FAILED",
            active: isVerified,
        });

        return {
            verified: isVerified,
            host: targetDomain,
            cnameRecords,
            nextStep: isVerified
                ? "Domain verified. Attach this domain in Vercel project settings and set status ACTIVE."
                : "DNS record not verified yet. Ensure CNAME points to cname.vercel-dns.com and retry.",
        };
    },

    async activateCustomDomain(instituteId: string, customDomain?: string) {
        const institute = await instituteRepository.findById(instituteId);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        const targetDomain = (customDomain || institute.customDomain || "").trim().toLowerCase();
        if (!targetDomain) {
            throw new AppError("No custom domain configured", 400, "CUSTOM_DOMAIN_REQUIRED");
        }

        if (!institute.domainVerified) {
            throw new AppError("Domain must be verified before activation", 400, "DOMAIN_NOT_VERIFIED");
        }

        await instituteRepository.updateById(instituteId, {
            customDomain: targetDomain,
            domainStatus: "ACTIVE",
        });

        await instituteRepository.upsertDomainRecord({
            instituteId,
            host: targetDomain,
            surface: "portal",
            status: "ACTIVE",
            active: true,
        });

        return this.getDomainSettings(instituteId);
    },

    async getByHost(hostname: string) {
        const normalizedHost = hostname.trim().toLowerCase();
        const byDomain = await instituteRepository.findByCustomDomain(normalizedHost);
        if (byDomain?.slug) return this.getPublicPage(byDomain.slug);

        if (normalizedHost.endsWith(".classes360.online")) {
            const sub = normalizedHost.replace(/\.classes360\.in$/, "");
            if (sub && !["portal", "student", "www", "api"].includes(sub)) {
                return this.getPublicPage(sub);
            }
        }

        return null;
    },

    async completeOnboarding(
        instituteId: string,
        payload: {
            name: string;
            phone: string;
            address: AddressInput | string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            state?: string;
            region?: string;
            postalCode?: string;
            country?: string;
            countryCode?: string;
            whatsapp?: string;
            description?: string;
            website?: string;
            facebook?: string;
            instagram?: string;
            youtube?: string;
            linkedin?: string;
        }
    ) {
        const normalizedPhone = normalizeIndianPhone(payload.phone);
        const normalizedWhatsapp = normalizeIndianPhone(payload.whatsapp);

        if (!normalizedPhone) {
            throw new AppError("Phone is required", 400, "INVALID_PHONE");
        }

        phoneSchema.parse(normalizedPhone);
        if (normalizedWhatsapp !== undefined) {
            phoneSchema.parse(normalizedWhatsapp);
        }

        const incomingAddress = toAddressInput(payload);

        if (!payload.name.trim()) {
            throw new AppError("Name is required", 400, "ONBOARDING_REQUIRED_FIELDS");
        }
        if (!incomingAddress.addressLine1?.trim() || !incomingAddress.city?.trim() || !incomingAddress.state?.trim()) {
            throw new AppError(
                "Name, address line 1, city and state are required",
                400,
                "ONBOARDING_REQUIRED_FIELDS"
            );
        }

        instituteNameSchema.parse(payload.name);
        validateAddressInput(incomingAddress);
        if (payload.description !== undefined) {
            descriptionSchema.parse(payload.description);
        }

        const socialUrls = [payload.website, payload.facebook, payload.instagram, payload.youtube, payload.linkedin].filter(Boolean);
        socialUrls.forEach((url) => urlSchema.parse(url));

        const nextSlug = normalizeSlug(payload.name);
        const isTaken = await instituteRepository.isSlugTaken(nextSlug, instituteId);
        if (isTaken) {
            throw new AppError("Slug already in use", 409, "SLUG_ALREADY_EXISTS");
        }

        const updated = await instituteRepository.updateById(instituteId, {
            name: payload.name.trim(),
            slug: nextSlug,
            phone: normalizedPhone,
            whatsapp: normalizedWhatsapp || null,
            address: {
                addressLine1: incomingAddress.addressLine1?.trim() || null,
                addressLine2: incomingAddress.addressLine2?.trim() || null,
                city: incomingAddress.city?.trim() || null,
                state: incomingAddress.state?.trim() || null,
                region: incomingAddress.region?.trim() || null,
                postalCode: incomingAddress.postalCode?.trim() || null,
                country: incomingAddress.country?.trim() || "India",
                countryCode: incomingAddress.countryCode?.trim() || null,
            },
            description: payload.description?.trim() || null,
            websiteUrl: payload.website?.trim() || null,
            facebookUrl: payload.facebook?.trim() || null,
            instagramUrl: payload.instagram?.trim() || null,
            youtubeUrl: payload.youtube?.trim() || null,
            linkedinUrl: payload.linkedin?.trim() || null,
            isOnboarded: true,
        });

        await sendOnboardingWhatsAppMessage(updated);

        return withSocialLinks(updated);
    },

    async getPublicPage(slug: string) {
        const institute = await instituteRepository.findBySlug(slug);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }
        const [courses, users, batches, studentsCount, announcements] = await Promise.all([
            prisma.course.findMany({
                where: { instituteId: institute.id },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    banner: true,
                    duration: true,
                    defaultFees: true,
                    description: true,
                    createdAt: true,
                },
            }),
            prisma.user.findMany({
                where: { instituteId: institute.id },
                select: {
                    id: true,
                    name: true,
                    subject: true,
                    bio: true,
                },
            }),
            prisma.batch.findMany({
                where: { instituteId: institute.id },
                orderBy: { createdAt: "desc" },
                take: 8,
            }),
            prisma.student.count({ where: { instituteId: institute.id } }),
            prisma.studentAnnouncement.findMany({
                where: { instituteId: institute.id },
                orderBy: { createdAt: "desc" },
                take: 25,
                select: {
                    title: true,
                    body: true,
                    createdAt: true,
                },
            }),
        ]);
        const teachers = users
            .filter((user) => Boolean(user.subject?.trim() || user.bio?.trim()))
            .map((user) => ({
                id: user.id,
                name: user.name ?? "Teacher",
                subject: user.subject ?? null,
                experience: user.bio ?? null,
            }));

        const photos = [
            institute.heroImage,
            institute.banner,
            institute.logo,
            ...courses.map((course) => course.banner),
        ].filter((photo): photo is string => Boolean(photo && photo.trim()));

        return {
            ...withSocialLinks(institute),
            courses,
            teachers,
            batches,
            announcements: announcements.map((item) => ({
                title: item.title,
                body: item.body,
                createdAt: item.createdAt.toISOString(),
            })),
            studentsCount,
            photos: Array.from(new Set(photos)),
        };
    },
};


