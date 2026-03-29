// import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
// import { loginUser, signupUser, verifyOtp } from "../slices/authSlice";

// export const useAuth = () => {
//     const dispatch = useAppDispatch();
//     const { user, loading, error, isAuthenticated } = useAppSelector(
//         (state) => state.auth
//     );

//     const login = (data: { email: string; }) =>
//         dispatch(loginUser(data));
//     const signup = (data: { name: string; email: string; phoneNumber: string }) =>
//         dispatch(signupUser(data));
//     const verifyOTP = (data: { email: string, otp: string }) => dispatch(verifyOtp(data));


//     return { user, loading, error, isAuthenticated, login, signup, verifyOTP };
// };

import { useState } from "react";
import { api } from "@/lib/api";
import { useAppSelector } from "@/hooks/reduxHooks";

export const useAuth = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    // Generic wrapper for dispatch + callbacks
    const withCallbacks = async <T>(request: Promise<T>, callbacks?: {
        onSuccess?: (data: any) => void;
        onError?: (error: any) => void;
        onFinally?: () => void;
    }) => {
        const { onSuccess, onError, onFinally } = callbacks || {};

        try {
            setLoading(true);
            setError(null);
            const result = await request;
            onSuccess?.(result);
            return result;
        } catch (err) {
            setError(err);
            onError?.(err);
            throw err;
        } finally {
            setLoading(false);
            onFinally?.();
        }
    };

    // --- AUTH METHODS WITH CALLBACK SUPPORT ---

    const login = (data: { email: string; password: string }, callbacks?: any) =>
        withCallbacks(api.post("auth/login", data).then((res) => res.data), callbacks);

    const signup = (
        data: { email: string; password: string },
        callbacks?: any
    ) => withCallbacks(api.post("auth/signup", data).then((res) => res.data), callbacks);

    const verifyEmail = (
        data: { email: string; otp: string },
        callbacks?: any
    ) => withCallbacks(api.post("auth/verification", data).then((res) => res.data), callbacks);

    const logout = (callbacks?: any) =>
        withCallbacks(api.post("auth/logout", {}).then((res) => res.data), callbacks);

    return {
        user,
        loading,
        error,
        login,
        signup,
        verifyEmail,
        logout,
    };
};

