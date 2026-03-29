import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env, requireEnv } from "@/lib/config/env";

export type StudentAccessTokenPayload = {
    studentId: string;
    instituteId: string;
    name: string;
};

export type StudentRefreshTokenPayload = {
    studentId: string;
    tokenVersion: number;
};

const getJwtSecret = (): string => requireEnv("JWT_SECRET");

const stripJwtMetaClaims = <T extends Record<string, unknown>>(payload: T): T => {
    const { exp: _exp, iat: _iat, nbf: _nbf, jti: _jti, ...rest } = payload as T & {
        exp?: number;
        iat?: number;
        nbf?: number;
        jti?: string;
    };
    return rest as T;
};

// === STUDENT ACCESS TOKEN (15 min) ===
export const createStudentAccessToken = (payload: StudentAccessTokenPayload): string =>
    jwt.sign(stripJwtMetaClaims(payload), getJwtSecret(), { expiresIn: "15m" });

export const verifyStudentAccessToken = (token: string): StudentAccessTokenPayload | null => {
    try {
        return jwt.verify(token, getJwtSecret()) as StudentAccessTokenPayload;
    } catch {
        return null;
    }
};

// === STUDENT REFRESH TOKEN (7 days) ===
export const createStudentRefreshToken = (payload: StudentRefreshTokenPayload): string =>
    jwt.sign(stripJwtMetaClaims(payload), getJwtSecret(), { expiresIn: "7d" });

export const verifyStudentRefreshToken = (token: string): StudentRefreshTokenPayload | null => {
    try {
        return jwt.verify(token, getJwtSecret()) as StudentRefreshTokenPayload;
    } catch {
        return null;
    }
};

// === COOKIE SETTERS ===
export const setStudentAccessTokenCookie = async (token: string): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set("student_access_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
    });
};

export const setStudentRefreshTokenCookie = async (token: string): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set("student_refresh_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
};

export const clearStudentAuthCookies = async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.delete("student_access_token");
    cookieStore.delete("student_refresh_token");
};

// === READ FROM COOKIES ===
export const readStudentAccessTokenFromCookie = async (): Promise<StudentAccessTokenPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("student_access_token")?.value;
    if (!token) return null;
    return verifyStudentAccessToken(token);
};

export const readStudentRefreshTokenFromCookie = async (): Promise<StudentRefreshTokenPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("student_refresh_token")?.value;
    if (!token) return null;
    return verifyStudentRefreshToken(token);
};
