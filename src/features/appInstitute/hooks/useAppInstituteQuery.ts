import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appInstituteService } from "@/features/appInstitute/services/appInstitute.service";
import type { DataCounts, DomainSettings, InstituteSummary } from "@/features/appInstitute/types";

export const useInstituteSummary = () =>
    useQuery<InstituteSummary>({
        queryKey: ["appInstitute", "summary"],
        queryFn: appInstituteService.getInstituteSummary,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

export const useSettingsCounts = () =>
    useQuery<DataCounts>({
        queryKey: ["appInstitute", "counts"],
        queryFn: appInstituteService.getSettingsCounts,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

export const useExportSettingsData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appInstituteService.exportSettingsData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appInstitute", "counts"] });
        },
    });
};

export const useDomainSettings = () =>
    useQuery<DomainSettings>({
        queryKey: ["appInstitute", "domain"],
        queryFn: appInstituteService.getDomainSettings,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

export const useSaveDomainSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customDomain }: { customDomain: string }) => appInstituteService.saveDomainSettings(customDomain),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appInstitute", "domain"] }),
    });
};

export const useVerifyDomainSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customDomain }: { customDomain: string }) => appInstituteService.verifyDomainSettings(customDomain),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appInstitute", "domain"] }),
    });
};

export const useActivateDomainSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customDomain }: { customDomain: string }) => appInstituteService.activateDomainSettings(customDomain),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appInstitute", "domain"] }),
    });
};

export const useOnboardingInstitute = () =>
    useQuery<Record<string, unknown>>({
        queryKey: ["appInstitute", "onboarding"],
        queryFn: appInstituteService.getOnboardingInstitute,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

export const useSubmitOnboarding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appInstituteService.submitOnboarding,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appInstitute", "onboarding"] }),
    });
};
