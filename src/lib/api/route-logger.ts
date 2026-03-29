import { NextRequest } from "next/server";
import { REQUEST_ID_HEADER } from "@/lib/request-logger";
import { serializeError, withLogContext } from "@/lib/logger";

type RequestLike = Request | NextRequest | undefined;

const extractRequestId = (req?: RequestLike): string =>
    req?.headers?.get(REQUEST_ID_HEADER) || crypto.randomUUID();

const extractMethod = (req?: RequestLike): string => {
    if (!req) return "UNKNOWN";
    return "method" in req && typeof req.method === "string" ? req.method : "UNKNOWN";
};

export const createRouteLogger = (
    route: string,
    req?: RequestLike,
    context: Record<string, unknown> = {}
) => {
    const startedAt = Date.now();
    const requestId = extractRequestId(req);
    const method = extractMethod(req);

    const logger = withLogContext({
        requestId,
        route,
        method,
        ...context,
    });

    const durationMs = () => Date.now() - startedAt;

    return {
        requestId,
        logger,
        info: (event: string, data: Record<string, unknown> = {}) =>
            logger.info({ event, durationMs: durationMs(), ...data }),
        warn: (event: string, data: Record<string, unknown> = {}) =>
            logger.warn({ event, durationMs: durationMs(), ...data }),
        error: (event: string, error: unknown, data: Record<string, unknown> = {}) =>
            logger.error({ event, durationMs: durationMs(), error: serializeError(error), ...data }),
    };
};
