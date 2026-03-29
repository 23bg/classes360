import { cookies } from "next/headers";
import { readAccessTokenFromCookie, AccessTokenPayload } from "./tokens";
import { jwtAuthService } from "@/modules/auth/infrastructure/jwtAuthService";
import { issueSessionUseCase } from "@/modules/auth/application/issueSession.useCase";

const SESSION_COOKIE = "session_token";

export type SessionRole = "OWNER" | "EDITOR" | "VIEWER" | "MANAGER";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";

export type SessionPayload = {
    userId: string;
    email: string;
    role: SessionRole;
    instituteId: string;
    isOnboarded: boolean;
    subscriptionStatus: SubscriptionStatus;
};

export const createSessionToken = (payload: SessionPayload): string =>
    jwtAuthService.signAccessToken(payload as AccessTokenPayload);

export const verifySessionToken = (token: string): SessionPayload | null => {
    return jwtAuthService.verifyAccessToken(token) as SessionPayload | null;
};

export const setSessionCookie = async (token: string): Promise<void> => {
    await jwtAuthService.setAccessCookie(token);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
};

export const clearSessionCookie = async (): Promise<void> => {
    const cookieStore = await cookies();
    await jwtAuthService.clearAuthCookies();
    cookieStore.delete(SESSION_COOKIE);
};

/**
 * Read session from cookies.
 * IMPORTANT: Prioritizes new access_token over legacy session_token.
 * During migration, both will work but access_token takes precedence.
 */
export const readSessionFromCookie = async (): Promise<SessionPayload | null> => {
    const accessTokenPayload = await readAccessTokenFromCookie();
    return accessTokenPayload ? (accessTokenPayload as SessionPayload) : null;
};

export const readSessionUserId = async (): Promise<string | null> => {
    const session = await readSessionFromCookie();
    return session?.userId ?? null;
};

export const issueSessionForUser = async (userId: string): Promise<void> => {
    await issueSessionUseCase({ userId });
};

export const revokeAllSessionsForUser = async (userId: string): Promise<void> => {
    const { authUserRepository } = await import("@/modules/auth/infrastructure/authUserRepository");
    await authUserRepository.incrementTokenVersion(userId);
};

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

