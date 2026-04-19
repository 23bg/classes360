export * from './session';
// Complete auth types definition
export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    name: string;
    email: string;
    phoneNumber: string;
    password?: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    institute_id: string;
    role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER';
    email_verified?: boolean;
    created_at?: string;
}

export interface AuthResponse {
    user?: AuthUser;
    expiresAt?: number;
    redirectTo?: string;
    message?: string;
    mfaRequired?: boolean;
    requiresEmailVerification?: boolean;
    status?: "PENDING_VERIFICATION" | "VERIFIED_NO_PASSWORD" | "ACTIVE";
}

export interface OtpResponse {
    expiresAt: number;
    message?: string;
}

export interface LogoutResponse {
    loggedOut?: boolean;
    message?: string;
}
