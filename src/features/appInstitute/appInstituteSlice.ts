import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    activateDomain,
    createPublicEnquiry,
    getDomainSettings,
    getExportResources,
    getInstituteSummaryResources,
    getOnboardingInstitute,
    getSettingsCountsResources,
    postOnboarding,
    putDomainSettings,
    verifyDomain,
} from "@/features/appInstitute/appInstituteApi";
import type { AppInstituteState, InstituteSummary } from "@/features/appInstitute/types";

const initialState: AppInstituteState = {
    summary: { data: null, loading: false, error: null },
    domain: { data: null, loading: false, error: null },
    counts: { data: { students: 0, leads: 0, courses: 0, payments: 0 }, loading: false, error: null },
    exportData: { data: null, loading: false, error: null },
    onboarding: { loading: false, error: null, data: null },
    publicEnquiry: { loading: false, error: null },
};

const getErrorMessage = (error: unknown) =>
    (error as { message?: string })?.message || "Request failed";

export const fetchInstituteSummary = createAsyncThunk("appInstitute/fetchInstituteSummary", async () => {
    const { institute, students, courses } = await getInstituteSummaryResources();

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
    } satisfies InstituteSummary;
});

export const fetchSettingsCounts = createAsyncThunk("appInstitute/fetchSettingsCounts", async () => {
    const { studentsRes, leadsRes, coursesRes, paymentsRes } = await getSettingsCountsResources();

    return {
        students: (studentsRes ?? []).length,
        leads: (leadsRes ?? []).length,
        courses: (coursesRes ?? []).length,
        payments: (paymentsRes ?? []).length,
    };
});

export const exportSettingsData = createAsyncThunk("appInstitute/exportSettingsData", async () => {
    const { students, leads, courses, fees, payments } = await getExportResources();

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
});

export const fetchDomainSettings = createAsyncThunk("appInstitute/fetchDomainSettings", async () => {
    return await getDomainSettings();
});

export const saveDomainSettings = createAsyncThunk(
    "appInstitute/saveDomainSettings",
    async ({ customDomain }: { customDomain: string }) => {
        return await putDomainSettings(customDomain);
    }
);

export const verifyDomainSettings = createAsyncThunk(
    "appInstitute/verifyDomainSettings",
    async ({ customDomain }: { customDomain: string }) => {
        return await verifyDomain(customDomain);
    }
);

export const activateDomainSettings = createAsyncThunk(
    "appInstitute/activateDomainSettings",
    async ({ customDomain }: { customDomain: string }) => {
        return await activateDomain(customDomain);
    }
);

export const submitPublicEnquiry = createAsyncThunk(
    "appInstitute/submitPublicEnquiry",
    async ({ slug, values }: { slug: string; values: Record<string, unknown> }) => {
        await createPublicEnquiry(slug, values);
        return true;
    }
);

export const fetchOnboardingInstitute = createAsyncThunk("appInstitute/fetchOnboardingInstitute", async () => {
    return await getOnboardingInstitute();
});

export const submitOnboarding = createAsyncThunk(
    "appInstitute/submitOnboarding",
    async (payload: Record<string, unknown>) => {
        return await postOnboarding(payload);
    }
);

const appInstituteSlice = createSlice({
    name: "appInstitute",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInstituteSummary.pending, (state) => {
                state.summary.loading = true;
                state.summary.error = null;
            })
            .addCase(fetchInstituteSummary.fulfilled, (state, action) => {
                state.summary.loading = false;
                state.summary.data = action.payload;
            })
            .addCase(fetchInstituteSummary.rejected, (state, action) => {
                state.summary.loading = false;
                state.summary.error = getErrorMessage(action.error);
            })
            .addCase(fetchSettingsCounts.pending, (state) => {
                state.counts.loading = true;
            })
            .addCase(fetchSettingsCounts.fulfilled, (state, action) => {
                state.counts.loading = false;
                state.counts.data = action.payload;
            })
            .addCase(fetchSettingsCounts.rejected, (state, action) => {
                state.counts.loading = false;
                state.counts.error = getErrorMessage(action.error);
            })
            .addCase(exportSettingsData.pending, (state) => {
                state.exportData.loading = true;
            })
            .addCase(exportSettingsData.fulfilled, (state, action) => {
                state.exportData.loading = false;
                state.exportData.data = action.payload;
            })
            .addCase(exportSettingsData.rejected, (state, action) => {
                state.exportData.loading = false;
                state.exportData.error = getErrorMessage(action.error);
            })
            .addCase(fetchDomainSettings.pending, (state) => {
                state.domain.loading = true;
            })
            .addCase(fetchDomainSettings.fulfilled, (state, action) => {
                state.domain.loading = false;
                state.domain.data = action.payload;
            })
            .addCase(fetchDomainSettings.rejected, (state, action) => {
                state.domain.loading = false;
                state.domain.error = getErrorMessage(action.error);
            })
            .addCase(saveDomainSettings.pending, (state) => {
                state.domain.loading = true;
            })
            .addCase(saveDomainSettings.fulfilled, (state, action) => {
                state.domain.loading = false;
                state.domain.data = action.payload;
            })
            .addCase(saveDomainSettings.rejected, (state, action) => {
                state.domain.loading = false;
                state.domain.error = getErrorMessage(action.error);
            })
            .addCase(verifyDomainSettings.pending, (state) => {
                state.domain.loading = true;
            })
            .addCase(verifyDomainSettings.fulfilled, (state, action) => {
                state.domain.loading = false;
                state.domain.data = action.payload;
            })
            .addCase(verifyDomainSettings.rejected, (state, action) => {
                state.domain.loading = false;
                state.domain.error = getErrorMessage(action.error);
            })
            .addCase(activateDomainSettings.pending, (state) => {
                state.domain.loading = true;
            })
            .addCase(activateDomainSettings.fulfilled, (state, action) => {
                state.domain.loading = false;
                state.domain.data = action.payload;
            })
            .addCase(activateDomainSettings.rejected, (state, action) => {
                state.domain.loading = false;
                state.domain.error = getErrorMessage(action.error);
            })
            .addCase(submitPublicEnquiry.pending, (state) => {
                state.publicEnquiry.loading = true;
                state.publicEnquiry.error = null;
            })
            .addCase(submitPublicEnquiry.fulfilled, (state) => {
                state.publicEnquiry.loading = false;
            })
            .addCase(submitPublicEnquiry.rejected, (state, action) => {
                state.publicEnquiry.loading = false;
                state.publicEnquiry.error = getErrorMessage(action.error);
            })
            .addCase(fetchOnboardingInstitute.pending, (state) => {
                state.onboarding.loading = true;
            })
            .addCase(fetchOnboardingInstitute.fulfilled, (state, action) => {
                state.onboarding.loading = false;
                state.onboarding.data = action.payload;
            })
            .addCase(fetchOnboardingInstitute.rejected, (state, action) => {
                state.onboarding.loading = false;
                state.onboarding.error = getErrorMessage(action.error);
            })
            .addCase(submitOnboarding.pending, (state) => {
                state.onboarding.loading = true;
            })
            .addCase(submitOnboarding.fulfilled, (state, action) => {
                state.onboarding.loading = false;
                state.onboarding.data = action.payload;
            })
            .addCase(submitOnboarding.rejected, (state, action) => {
                state.onboarding.loading = false;
                state.onboarding.error = getErrorMessage(action.error);
            });
    },
});

export default appInstituteSlice.reducer;
