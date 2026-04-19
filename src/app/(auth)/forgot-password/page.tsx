"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequestPasswordReset, useResetPassword } from "@/features/auth/hooks/useAuthQuery";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import ROUTES from "@/constants/routes";
import Link from "next/link";

const resetPasswordSchema = z
    .object({
        email: z.string().trim().max(120, "Email cannot exceed 120 characters").email("Enter a valid email"),
        otp: z.string().regex(/^\d{5}$/, "OTP must be 5 digits"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Please confirm your password"),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const params = useSearchParams();
    const mode = params.get("mode") === "setup" ? "setup" : "reset";
    const emailQuery = params.get("email") ?? "";
    const [isOtpRequested, setOtpRequested] = useState(false);
    const [requestingOtp, setRequestingOtp] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const requestPasswordResetMutation = useRequestPasswordReset();
    const resetPasswordMutation = useResetPassword();

    const pageTitle = useMemo(
        () => (mode === "setup" ? "Set your password" : "Reset your password"),
        [mode]
    );

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onBlur",
        defaultValues: {
            email: emailQuery,
            otp: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (emailQuery) {
            form.setValue("email", emailQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emailQuery]);

    const handleRequestOtp = async (email: string) => {
        setRequestingOtp(true);
        try {
            await requestPasswordResetMutation.mutateAsync({ email });
            toast.success("Verification code sent to your email.");
            setOtpRequested(true);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Unable to send verification code.");
        } finally {
            setRequestingOtp(false);
        }
    };

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!isOtpRequested) {
            await handleRequestOtp(data.email);
            return;
        }

        setSubmitting(true);
        try {
            await resetPasswordMutation.mutateAsync({
                email: data.email,
                otp: data.otp,
                newPassword: data.newPassword,
            });
            toast.success(mode === "setup" ? "Password set successfully." : "Password reset successfully.");
            router.push(ROUTES.AUTH.LOG_IN);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Unable to update password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="border shadow-none rounded-md max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                <CardDescription>
                    {mode === "setup"
                        ? "Enter the email you used to sign up and set your new password."
                        : "Enter your email to receive a password reset code, then set a new password."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                            disabled={requestPasswordResetMutation.isPending || requestingOtp || submitting || Boolean(emailQuery)}
                                            placeholder="name@example.com"
                                            maxLength={120}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isOtpRequested ? (
                            <>
                                <FormField
                                    control={form.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>OTP</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    inputMode="numeric"
                                                    placeholder="12345"
                                                    maxLength={5}
                                                    disabled={resetPasswordMutation.isPending || submitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    {...field}
                                                    placeholder="Create a password"
                                                    disabled={resetPasswordMutation.isPending || submitting}
                                                    maxLength={128}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    {...field}
                                                    placeholder="Confirm password"
                                                    disabled={resetPasswordMutation.isPending || submitting}
                                                    maxLength={128}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : null}

                        <Button type="submit" className="w-full" disabled={requestPasswordResetMutation.isPending || requestingOtp || resetPasswordMutation.isPending || submitting}>
                            {isOtpRequested
                                ? submitting
                                    ? "Saving password..."
                                    : mode === "setup"
                                    ? "Set password"
                                    : "Reset password"
                                : requestingOtp
                                ? "Sending code..."
                                : "Send verification code"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Remembered your password?{" "}
                            <Link href={ROUTES.AUTH.LOG_IN} className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
