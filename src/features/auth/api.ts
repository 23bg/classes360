import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type {
    AuthResponse,
    LoginPayload,
    SignupPayload,
    VerifyOtpPayload,
    OtpResponse,
    LogoutResponse,
} from './types';

type MutationResult<TData, TVariables> = readonly [
    (payload: TVariables) => Promise<TData>,
    {
        isLoading: boolean;
        data?: TData;
        error: unknown;
        reset: () => void;
    },
];

const useAsyncMutation = <TData, TVariables>(
    execute: (payload: TVariables) => Promise<TData>,
    onSuccess?: (data: TData) => void,
): MutationResult<TData, TVariables> => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<TData | undefined>(undefined);
    const [error, setError] = useState<unknown>(null);

    const reset = useCallback(() => {
        setData(undefined);
        setError(null);
        setIsLoading(false);
    }, []);

    const mutate = useCallback(
        async (payload: TVariables) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await execute(payload);
                setData(result);
                onSuccess?.(result);
                return result;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [execute, onSuccess],
    );

    return [mutate, { isLoading, data, error, reset }] as const;
};

/**
 * Password-based signup
 */
export const useSignup = () =>
    useAsyncMutation<AuthResponse, SignupPayload>((payload: SignupPayload) =>
        api.post('auth/signup', payload).then(res => res.data),
    );

/**
 * Password-based login
 */
export const useLogin = () =>
    useAsyncMutation<AuthResponse, LoginPayload>((payload: LoginPayload) =>
        api.post('auth/login', payload).then(res => res.data),
    );

/**
 * Verify email OTP
 */
export const useVerifyEmail = () =>
    useAsyncMutation<AuthResponse, VerifyOtpPayload>((payload: VerifyOtpPayload) =>
        api.post('auth/verification', payload).then(res => res.data),
    );

/**
 * Request OTP for email verification
 */
export const useRequestVerificationOtp = () =>
    useAsyncMutation<OtpResponse, { email: string }>((payload) =>
        api.post('auth/verification/request', payload).then(res => res.data),
    );

// Backward-compatible aliases for older imports.
export const useRequestOtp = useLogin;
export const useRequestOtpForSignup = useSignup;
export const useVerifyOtp = useVerifyEmail;
export const useSignupWithOtp = useVerifyEmail;

/**
 * Logout user
 * Clears session and auth state
 */
export const useLogout = () =>
    useAsyncMutation<LogoutResponse, void>(() =>
        api.post('auth/logout', {}).then(res => res.data),
    );

/**
 * Refresh access token
 * Used when token is about to expire
 */
export const useRefreshToken = () =>
    useAsyncMutation<unknown, void>(() =>
        api.post('auth/refresh', {}).then(res => res.data),
    );

/**
 * Get current session (called on app init)
 * Optional: can be used to verify current auth state
 */
export const useGetSession = (enabled = true) => {
    const [data, setData] = useState<AuthResponse | undefined>(undefined);
    const [error, setError] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('auth/me').then(res => res.data as AuthResponse);
            setData(response);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        void fetchSession();
    }, [enabled, fetchSession]);

    return useMemo(
        () => ({
            data,
            isLoading,
            isError: Boolean(error),
            error,
            refetch: fetchSession,
        }),
        [data, error, fetchSession, isLoading],
    );
};
