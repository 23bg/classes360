import type {
    AuthResponse,
    LoginPayload,
    SignupPayload,
    VerifyOtpPayload,
    OtpResponse,
    LogoutResponse,
} from "@/features/auth/types";
import { API } from "@/constants/api";
import { apiRequest } from "@/lib/api/request";

export const authService = {
    getCurrentUser: async () => apiRequest<AuthResponse>({ url: API.AUTH.ME, method: "get" }),

    signup: async (payload: SignupPayload) =>
        apiRequest<AuthResponse>({ url: API.AUTH.SIGN_UP, method: "post", data: payload }),

    login: async (payload: LoginPayload) =>
        apiRequest<AuthResponse>({ url: API.AUTH.LOG_IN, method: "post", data: payload }),

    verifyEmail: async (payload: VerifyOtpPayload) =>
        apiRequest<AuthResponse>({ url: API.AUTH.VERIFY, method: "post", data: payload }),

    completeMfa: async (payload: VerifyOtpPayload) =>
        apiRequest<AuthResponse>({ url: API.AUTH.MFA_VERIFY, method: "post", data: payload }),

    requestVerificationOtp: async (payload: { email: string }) =>
        apiRequest<OtpResponse>({ url: API.AUTH.VERIFY_REQUEST, method: "post", data: payload }),

    requestPasswordReset: async (payload: { email: string }) =>
        apiRequest<OtpResponse>({ url: API.AUTH.PASSWORD_RESET_REQUEST, method: "post", data: payload }),

    resetPassword: async (payload: { email: string; otp: string; newPassword: string }) =>
        apiRequest<{ reset: true }>({ url: API.AUTH.PASSWORD_RESET, method: "post", data: payload }),

    logout: async () => apiRequest<LogoutResponse>({ url: API.AUTH.LOG_OUT, method: "post", data: {} }),
};
