import { z } from "zod";

export const teacherValidation = z.object({
    name: z.string().min(2),
    subject: z.string().optional(),
    bio: z.string().optional(),
});
