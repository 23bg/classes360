import { z } from "zod";

export const leadValidation = z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional(),
    source: z.string().optional(),
});
