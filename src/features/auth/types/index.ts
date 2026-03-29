// Complete auth types definition
export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    email: string;
    password: string;
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
}

export interface OtpResponse {
    expiresAt: number;
    message?: string;
}

export interface LogoutResponse {
    loggedOut?: boolean;
    message?: string;
}
