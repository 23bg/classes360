import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env, requireEnv } from "@/lib/config/env";
import { AUTH_COOKIE, AUTH_TTL } from "@/modules/auth/domain/tokenPolicy";
import { AccessTokenClaims, RefreshTokenClaims } from "@/modules/auth/domain/types";

const jwtSecret = (): string => requireEnv("JWT_SECRET");

const stripMetaClaims = <T extends Record<string, unknown>>(payload: T): T => {
    const { exp: _exp, iat: _iat, nbf: _nbf, jti: _jti, ...rest } = payload as T & {
        exp?: number;
        iat?: number;
        nbf?: number;
        jti?: string;
    };

    return rest as T;
};

export const jwtAuthService = {
    signAccessToken(payload: AccessTokenClaims): string {
        return jwt.sign(stripMetaClaims(payload), jwtSecret(), {
            expiresIn: `${AUTH_TTL.accessSeconds}s`,
        });
    },

    signRefreshToken(payload: RefreshTokenClaims): string {
        return jwt.sign(stripMetaClaims(payload), jwtSecret(), {
            expiresIn: `${AUTH_TTL.refreshSeconds}s`,
        });
    },

    verifyAccessToken(token: string): AccessTokenClaims | null {
        try {
            return jwt.verify(token, jwtSecret()) as AccessTokenClaims;
        } catch {
            return null;
        }
    },

    verifyRefreshToken(token: string): RefreshTokenClaims | null {
        try {
            return jwt.verify(token, jwtSecret()) as RefreshTokenClaims;
        } catch {
            return null;
        }
    },

    async setAccessCookie(accessToken: string): Promise<void> {
        const cookieStore = await cookies();

        cookieStore.set(AUTH_COOKIE.access, accessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: AUTH_TTL.accessSeconds,
        });
    },

    async setRefreshCookie(refreshToken: string): Promise<void> {
        const cookieStore = await cookies();

        cookieStore.set(AUTH_COOKIE.refresh, refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: AUTH_TTL.refreshSeconds,
        });
    },

    async setAuthCookies(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
        await this.setAccessCookie(tokens.accessToken);
        await this.setRefreshCookie(tokens.refreshToken);
    },

    async clearAuthCookies(): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE.access);
        cookieStore.delete(AUTH_COOKIE.refresh);
    },

    async readAccessTokenFromCookie(): Promise<string | null> {
        try {
            const cookieStore = await cookies();
            return cookieStore.get(AUTH_COOKIE.access)?.value ?? null;
        } catch {
            return null;
        }
    },

    async readRefreshTokenFromCookie(): Promise<string | null> {
        try {
            const cookieStore = await cookies();
            return cookieStore.get(AUTH_COOKIE.refresh)?.value ?? null;
        } catch {
            return null;
        }
    },
};
