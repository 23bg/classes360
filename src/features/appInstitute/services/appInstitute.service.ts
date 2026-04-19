import { API } from "@/constants/api";
import { apiRequest } from "@/lib/api/request";
import type { DataCounts, DomainSettings, InstituteSummary } from "@/features/appInstitute/types";

export const appInstituteService = {
    getInstituteSummary: async (): Promise<InstituteSummary> => {
        const [institute, students, courses] = await Promise.all([
            apiRequest<any>({ url: API.INTERNAL.INSTITUTE.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.STUDENTS.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.COURSES.ROOT, method: "get" }),
        ]);

        return {
            form: {
                name: institute?.name ?? "",
                slug: institute?.slug ?? "",
                description: institute?.description ?? "",
                phone: institute?.phone ?? "",
                whatsapp: institute?.whatsapp ?? "",
                addressLine1: institute?.address?.addressLine1 ?? "",
                addressLine2: institute?.address?.addressLine2 ?? "",
                city: institute?.address?.city ?? "",
                state: institute?.address?.state ?? "",
                region: institute?.address?.region ?? "",
                postalCode: institute?.address?.postalCode ?? "",
                country: institute?.address?.country ?? "India",
                countryCode: institute?.address?.countryCode ?? "",
                timings: institute?.timings ?? "",
                logo: institute?.logo ?? "",
                banner: institute?.banner ?? "",
                website: institute?.socialLinks?.website ?? "",
                instagram: institute?.socialLinks?.instagram ?? "",
                facebook: institute?.socialLinks?.facebook ?? "",
                youtube: institute?.socialLinks?.youtube ?? "",
                linkedin: institute?.socialLinks?.linkedin ?? "",
            },
            studentsCount: (students ?? []).length,
            coursesCount: (courses ?? []).length,
        };
    },

    getSettingsCounts: async (): Promise<DataCounts> => {
        const [studentsRes, leadsRes, coursesRes, paymentsRes] = await Promise.all([
            apiRequest<any[]>({ url: API.INTERNAL.STUDENTS.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.LEADS.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.COURSES.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.PAYMENTS.ROOT, method: "get" }),
        ]);

        return {
            students: (studentsRes ?? []).length,
            leads: (leadsRes ?? []).length,
            courses: (coursesRes ?? []).length,
            payments: (paymentsRes ?? []).length,
        };
    },

    exportSettingsData: async (): Promise<{ exportedAt: string; data: { students: any[]; leads: any[]; courses: any[]; fees: any[]; payments: any[] } }> => {
        const [students, leads, courses, fees, payments] = await Promise.all([
            apiRequest<any[]>({ url: API.INTERNAL.STUDENTS.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.LEADS.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.COURSES.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.FEES.ROOT, method: "get" }),
            apiRequest<any[]>({ url: API.INTERNAL.PAYMENTS.ROOT, method: "get" }),
        ]);

        return {
            exportedAt: new Date().toISOString(),
            data: {
                students: students ?? [],
                leads: leads ?? [],
                courses: courses ?? [],
                fees: fees ?? [],
                payments: payments ?? [],
            },
        };
    },

    getDomainSettings: async (): Promise<DomainSettings> =>
        apiRequest<DomainSettings>({ url: API.INTERNAL.INSTITUTE.DOMAIN, method: "get" }),

    saveDomainSettings: async (customDomain: string): Promise<DomainSettings> =>
        apiRequest<DomainSettings>({
            url: API.INTERNAL.INSTITUTE.DOMAIN,
            method: "put",
            data: { customDomain, surface: "portal" },
        }),

    verifyDomainSettings: async (customDomain: string): Promise<DomainSettings> => {
        await apiRequest({
            url: API.INTERNAL.INSTITUTE.DOMAIN,
            method: "post",
            data: { action: "verify", customDomain },
        });
        return appInstituteService.getDomainSettings();
    },

    activateDomainSettings: async (customDomain: string): Promise<DomainSettings> =>
        apiRequest<DomainSettings>({
            url: API.INTERNAL.INSTITUTE.DOMAIN,
            method: "post",
            data: { action: "activate", customDomain },
        }),

    getOnboardingInstitute: async () => apiRequest<Record<string, unknown>>({ url: API.INTERNAL.INSTITUTE.ROOT, method: "get" }),

    submitOnboarding: async (payload: Record<string, unknown>) =>
        apiRequest<Record<string, unknown>>({ url: API.INTERNAL.INSTITUTE.ONBOARDING, method: "post", data: payload }),
};
