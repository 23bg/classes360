import z from "zod";

export const signupFormSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    countryCode: z.string().trim().min(1, "Country code is required"),
    phoneNumber: z.string().trim().min(6, "Phone number must be at least 6 digits").max(16, "Phone number cannot exceed 16 digits"),
    email: z.string().trim().max(120, "Email cannot exceed 120 characters").email("Enter a valid email"),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
