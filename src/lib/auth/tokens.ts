import { jwtAuthService } from "@/modules/auth/infrastructure/jwtAuthService";
import { AccessTokenClaims as ModuleAccessTokenClaims, RefreshTokenClaims as ModuleRefreshTokenClaims } from "@/modules/auth/domain/types";

export type AccessTokenPayload = {
    userId: string;
    email: string;
    role: "OWNER" | "EDITOR" | "VIEWER" | "MANAGER";
    instituteId: string;
    isOnboarded: boolean;
    subscriptionStatus: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
};

export type RefreshTokenPayload = {
    userId: string;
    tokenVersion: number;
};

// === ACCESS TOKEN (15 min) ===
export const createAccessToken = (payload: AccessTokenPayload): string =>
    jwtAuthService.signAccessToken(payload as ModuleAccessTokenClaims);

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
    return jwtAuthService.verifyAccessToken(token) as AccessTokenPayload | null;
};

// === REFRESH TOKEN (7 days) ===
export const createRefreshToken = (payload: RefreshTokenPayload): string =>
    jwtAuthService.signRefreshToken(payload as ModuleRefreshTokenClaims);

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
    return jwtAuthService.verifyRefreshToken(token) as RefreshTokenPayload | null;
};

// === COOKIE SETTERS ===
export const setAccessTokenCookie = async (token: string): Promise<void> => {
    await jwtAuthService.setAccessCookie(token);
};

export const setRefreshTokenCookie = async (token: string): Promise<void> => {
    await jwtAuthService.setRefreshCookie(token);
};

export const clearAuthCookies = async (): Promise<void> => {
    await jwtAuthService.clearAuthCookies();
};

// === READ FROM COOKIES ===
export const readAccessTokenFromCookie = async (): Promise<AccessTokenPayload | null> => {
    const token = await jwtAuthService.readAccessTokenFromCookie();
    if (!token) return null;
    return verifyAccessToken(token);
};

export const readRefreshTokenFromCookie = async (): Promise<RefreshTokenPayload | null> => {
    const token = await jwtAuthService.readRefreshTokenFromCookie();
    if (!token) return null;
    return verifyRefreshToken(token);
};
