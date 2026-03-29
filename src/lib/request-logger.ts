const REQUEST_ID_HEADER = "x-request-id";
const isTest = process.env.NODE_ENV === "test";

const createRequestId = (): string => {
    try {
        return crypto.randomUUID();
    } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
};

export const getOrCreateRequestId = (headers: Headers): string =>
    headers.get(REQUEST_ID_HEADER) || createRequestId();

const buildRecord = (
    level: "info" | "warn" | "error",
    event: string,
    data: Record<string, unknown> = {}
) => ({
    level,
    event,
    app: "oncampus",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    ...data,
});

export const edgeLogger = {
    info(event: string, data: Record<string, unknown> = {}) {
        if (isTest) return;
        console.info(JSON.stringify(buildRecord("info", event, data)));
    },
    warn(event: string, data: Record<string, unknown> = {}) {
        if (isTest) return;
        console.warn(JSON.stringify(buildRecord("warn", event, data)));
    },
    error(event: string, data: Record<string, unknown> = {}) {
        console.error(JSON.stringify(buildRecord("error", event, data)));
    },
};

export { REQUEST_ID_HEADER };
