type Bucket = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function enforceRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
        buckets.set(key, {
            count: 1,
            resetAt: now + windowMs,
        });
        return { ok: true, retryAfter: 0 };
    }

    if (existing.count >= limit) {
        return { ok: false, retryAfter: Math.max(0, Math.ceil((existing.resetAt - now) / 1000)) };
    }

    existing.count += 1;
    return { ok: true, retryAfter: 0 };
}

