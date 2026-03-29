export const AUTH_COOKIE = {
    access: "access_token",
    refresh: "refresh_token",
} as const;

export const AUTH_TTL = {
    accessSeconds: 15 * 60,
    refreshSeconds: 7 * 24 * 60 * 60,
} as const;
