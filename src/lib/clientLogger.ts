type ClientLogPayload = Record<string, unknown> | string;

const isDev = process.env.NODE_ENV === "development";

const normalize = (event: string, payload?: ClientLogPayload) => {
    if (typeof payload === "string") {
        return { event, message: payload };
    }

    return {
        event,
        ...(payload || {}),
    };
};

export const clientLogger = {
    info(event: string, payload?: ClientLogPayload) {
        if (isDev) {
            console.info(normalize(event, payload));
        }
    },
    warn(event: string, payload?: ClientLogPayload) {
        if (isDev) {
            console.warn(normalize(event, payload));
        }
    },
    error(event: string, payload?: ClientLogPayload) {
        if (isDev) {
            console.error(normalize(event, payload));
        }
    },
};
