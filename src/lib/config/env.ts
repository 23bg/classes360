import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_API_URL: z.string().optional(),
    APP_ROOT_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
    APP_PORTAL_SUBDOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
    APP_STUDENT_SUBDOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
    SESSION_COOKIE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
    CUSTOM_DOMAIN_MAPPINGS: z.preprocess(emptyToUndefined, z.string().optional()),
    JWT_SECRET: z.string().optional(),
    DATABASE_URL: z.string().min(1).optional(),
    OTP_EMAIL_ENABLED: z.coerce.boolean().default(false),
    SMTP_HOST_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
    SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
    SMTP_PORT: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().positive().optional()
    ),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.preprocess(emptyToUndefined, z.string().optional()),
    SMTP_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
    SMTP_FROM: z.preprocess(emptyToUndefined, z.string().email().optional()),
    OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(5),
    OTP_MAX_RESEND: z.coerce.number().int().positive().default(2),
    OTP_RATE_LIMIT_PER_MIN: z.coerce.number().int().positive().default(5),
    LEAD_RATE_LIMIT_PER_MIN: z.coerce.number().int().positive().default(10),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
    RAZORPAY_PLAN_ID_SOLO: z.string().optional(),
    RAZORPAY_PLAN_ID_TEAM: z.string().optional(),
    RAZORPAY_PLAN_ID_STARTER_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_ID_STARTER_YEARLY: z.string().optional(),
    RAZORPAY_PLAN_ID_TEAM_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_ID_TEAM_YEARLY: z.string().optional(),
    RAZORPAY_PLAN_ID_GROWTH_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_ID_GROWTH_YEARLY: z.string().optional(),
    RAZORPAY_PLAN_ID_SCALE_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_ID_SCALE_YEARLY: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.preprocess(emptyToUndefined, z.string().optional()),
    WHATSAPP_ACCESS_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
    WHATSAPP_VERIFY_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
    WHATSAPP_API_VERSION: z.preprocess(emptyToUndefined, z.string().default("v19.0")),
    GEMINI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
    GEMINI_MODEL: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const env = envSchema.parse(process.env);

export const requireEnv = (key: "JWT_SECRET" | "DATABASE_URL" | "NEXT_PUBLIC_API_URL"): string => {
    const value = env[key];
    if (!value) {
        throw new Error(`Missing ${key} environment variable.`);
    }

    if (key === "JWT_SECRET" && value.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters.");
    }

    if (key === "NEXT_PUBLIC_API_URL") {
        const parsed = z.string().url().safeParse(value);
        if (!parsed.success) {
            throw new Error("NEXT_PUBLIC_API_URL must be a valid URL.");
        }
    }

    return value;
};

export const assertServerEnv = (): void => {
    requireEnv("DATABASE_URL");
};

