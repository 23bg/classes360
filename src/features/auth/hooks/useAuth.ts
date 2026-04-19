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

export { useSignup, useLogin, useVerifyEmail, useCompleteMfaLogin, useRequestVerificationOtp, useRequestPasswordReset, useResetPassword, useLogout } from "../hooks/useAuthQuery";

