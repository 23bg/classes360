import { API } from "@/constants/api";
import { apiGet, apiPost, apiPut } from "@/lib/apiService";
import type { DomainSettings } from "@/features/appInstitute/types";

export const getInstituteSummaryResources = async () => {
    const [institute, students, courses] = await Promise.all([
        apiGet<any>(API.INTERNAL.INSTITUTE.ROOT),
        apiGet<any[]>(API.INTERNAL.STUDENTS.ROOT),
        apiGet<any[]>(API.INTERNAL.COURSES.ROOT),
    ]);

    return { institute, students, courses };
};

export const getSettingsCountsResources = async () => {
    const [studentsRes, leadsRes, coursesRes, paymentsRes] = await Promise.all([
        apiGet<any[]>(API.INTERNAL.STUDENTS.ROOT),
        apiGet<any[]>(API.INTERNAL.LEADS.ROOT),
        apiGet<any[]>(API.INTERNAL.COURSES.ROOT),
        apiGet<any[]>(API.INTERNAL.PAYMENTS.ROOT),
    ]);

    return { studentsRes, leadsRes, coursesRes, paymentsRes };
};

export const getExportResources = async () => {
    const [students, leads, courses, fees, payments] = await Promise.all([
        apiGet<any[]>(API.INTERNAL.STUDENTS.ROOT),
        apiGet<any[]>(API.INTERNAL.LEADS.ROOT),
        apiGet<any[]>(API.INTERNAL.COURSES.ROOT),
        apiGet<any[]>(API.INTERNAL.FEES.ROOT),
        apiGet<any[]>(API.INTERNAL.PAYMENTS.ROOT),
    ]);

    return { students, leads, courses, fees, payments };
};

export const getDomainSettings = async () => {
    return await apiGet<DomainSettings>(API.INTERNAL.INSTITUTE.DOMAIN);
};

export const putDomainSettings = async (customDomain: string) => {
    return await apiPut<DomainSettings>(API.INTERNAL.INSTITUTE.DOMAIN, {
        customDomain,
        surface: "portal",
    });
};

export const verifyDomain = async (customDomain: string) => {
    await apiPost(API.INTERNAL.INSTITUTE.DOMAIN, {
        action: "verify",
        customDomain,
    });

    return await getDomainSettings();
};

export const activateDomain = async (customDomain: string) => {
    return await apiPost<DomainSettings>(API.INTERNAL.INSTITUTE.DOMAIN, {
        action: "activate",
        customDomain,
    });
};

export const createPublicEnquiry = async (slug: string, values: Record<string, unknown>) => {
    await apiPost(API.INTERNAL.PUBLIC.LEAD(slug), values);
};

export const getOnboardingInstitute = async () => {
    return await apiGet<Record<string, unknown>>(API.INTERNAL.INSTITUTE.ROOT);
};

export const postOnboarding = async (payload: Record<string, unknown>) => {
    return await apiPost<Record<string, unknown>>(API.INTERNAL.INSTITUTE.ONBOARDING, payload);
};
