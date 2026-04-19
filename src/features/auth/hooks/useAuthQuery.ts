import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import type {
    AuthResponse,
    LoginPayload,
    SignupPayload,
    VerifyOtpPayload,
    OtpResponse,
    LogoutResponse,
} from "@/features/auth/types";

export const useCurrentUser = () =>
    useQuery<AuthResponse>({
        queryKey: ["auth", "me"],
        queryFn: authService.getCurrentUser,
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
    });

export const useSignup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authService.signup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authService.login,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
    });
};

export const useVerifyEmail = () =>
    useMutation({
        mutationFn: authService.verifyEmail,
    });

export const useCompleteMfaLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authService.completeMfa,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
    });
};

export const useRequestVerificationOtp = () =>
    useMutation({
        mutationFn: authService.requestVerificationOtp,
    });

export const useRequestPasswordReset = () =>
    useMutation({
        mutationFn: authService.requestPasswordReset,
    });

export const useResetPassword = () =>
    useMutation({
        mutationFn: authService.resetPassword,
    });

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            queryClient.removeQueries({ queryKey: ["auth", "me"] });
        },
    });
};
