
export interface LoginPayload {
    email: string;
}

export interface SignupPayload {
    name: string;
    email: string;
    phoneNumber: string;
}

export interface verificationPayload {
    email: string;
    otp: string
}

export interface AuthUser {
    id: string;
    email: string;
    role: "OWNER" | "MANAGER" | "VIEWER";
}

