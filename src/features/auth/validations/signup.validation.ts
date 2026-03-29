import z from "zod";

export const signupFormSchema = z.object({
    email: z.string().trim().max(120, "Email cannot exceed 120 characters").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
