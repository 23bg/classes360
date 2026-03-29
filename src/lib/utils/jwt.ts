import jwt from "jsonwebtoken";
import { logger, serializeError } from "@/lib/logger";

const getJwtSecret = (): string => {
    const value = process.env.JWT_SECRET;
    if (!value) {
        throw new Error("Missing JWT_SECRET environment variable.");
    }
    return value;
};

interface JwtPayload {
    id: string;
    email: string;
}

/**
 * Generate a signed JWT token
 */
export function generateToken(
    payload: JwtPayload,
    expiresIn: jwt.SignOptions["expiresIn"] = "7d"
) {
    return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, getJwtSecret()) as JwtPayload;
    } catch (err) {
        logger.warn({
            event: "jwt_verification_failed",
            error: serializeError(err),
        });
        return null;
    }
}

/**
 * Decode a JWT token without verifying signature (useful for non-sensitive inspection)
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (err) {
        logger.warn({
            event: "jwt_decode_failed",
            error: serializeError(err),
        });
        return null;
    }
}
