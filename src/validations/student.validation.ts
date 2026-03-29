import { z } from "zod";

export const studentValidation = z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional(),
});
