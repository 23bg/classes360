import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env, requireEnv } from "@/lib/config/env";

const STUDENT_SESSION_COOKIE = "student_session_token";

export type StudentSessionPayload = {
    studentId: string;
    instituteId: string;
    name: string;
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

export const createStudentSessionToken = (payload: StudentSessionPayload): string =>
    jwt.sign(stripJwtMetaClaims(payload), getJwtSecret(), { expiresIn: "7d" });

export const verifyStudentSessionToken = (token: string): StudentSessionPayload | null => {
    try {
        return jwt.verify(token, getJwtSecret()) as StudentSessionPayload;
    } catch {
        return null;
    }
};

export const setStudentSessionCookie = async (token: string): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set(STUDENT_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
};

export const clearStudentSessionCookie = async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.delete(STUDENT_SESSION_COOKIE);
};

export const readStudentSessionFromCookie = async (): Promise<StudentSessionPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifyStudentSessionToken(token);
};
