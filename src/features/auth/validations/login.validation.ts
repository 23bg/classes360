import { z } from "zod";

// âœ… Schema for validation
export const loginFormSchema = z.object({
    email: z.string().trim().max(120, "Email cannot exceed 120 characters").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type loginFormData = z.infer<typeof loginFormSchema>;
