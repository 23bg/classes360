import { z } from "zod";

export const instituteValidation = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    phone: z.string().optional(),
    address: z
        .object({
            addressLine1: z.string().optional(),
            addressLine2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            region: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
            countryCode: z.string().optional(),
        })
        .optional(),
    websiteUrl: z.string().url().optional(),
    instagramUrl: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    youtubeUrl: z.string().url().optional(),
});
