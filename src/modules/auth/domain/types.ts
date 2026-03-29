export type SessionRole = "OWNER" | "EDITOR" | "VIEWER" | "MANAGER";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";

export type AccessTokenClaims = {
    userId: string;
    email: string;
    role: SessionRole;
    instituteId: string;
    isOnboarded: boolean;
    subscriptionStatus: SubscriptionStatus;
};

export type RefreshTokenClaims = {
    userId: string;
    tokenVersion: number;
};

export type AuthSession = {
    access: AccessTokenClaims;
    refresh: RefreshTokenClaims;
};
