import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentPortalService } from "@/features/studentPortal/services/studentPortal.service";
import type { PortalData } from "@/features/studentPortal/types";

export const useStudentPortal = () =>
    useQuery<PortalData>({
        queryKey: ["studentPortal", "me"],
        queryFn: studentPortalService.getStudentPortal,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

export const useStudentPortalLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { identifier: string; password: string }) => studentPortalService.loginStudentPortal(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studentPortal", "me"] }),
    });
};

export const useStudentPortalLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => studentPortalService.logoutStudentPortal(),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["studentPortal", "me"] });
        },
    });
};

export const useStudentPortalUserLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => studentPortalService.logoutUser(),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["studentPortal", "me"] });
        },
    });
};
