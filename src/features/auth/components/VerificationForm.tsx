"use client";

import { useCompleteMfaLogin, useVerifyEmail } from "../hooks/useAuthQuery";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import ROUTES from "@/constants/routes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const otpSchema = z.object({
    otp: z.string().regex(/^\d{5}$/, "OTP must be 5 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerificationForm() {
    const [codes, setCodes] = useState(["", "", "", "", ""]);

    const handleCodeChange = (index: number, value: string) => {
        const next = [...codes];
        next[index] = value.slice(0, 1);
        setCodes(next);

        if (value && index < 4) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }
    };

    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState<string | null>(null);
    const [mode, setMode] = useState<"emailVerification" | "mfa">("emailVerification");

    useEffect(() => {
        const rawMode = searchParams.get("mode");
        const rawEmail = searchParams.get("email");

        if (!rawEmail || !rawMode) {
            toast.error("Verification session is invalid. Please start again.");
            router.push(ROUTES.AUTH.LOG_IN);
            return;
        }

        if (rawMode === "mfa") {
            setMode("mfa");
            setEmail(rawEmail);
            return;
        }

        setMode("emailVerification");
        setEmail(rawEmail);
    }, [router, searchParams]);

    const verifyEmailMutation = useVerifyEmail();
    const completeMfaMutation = useCompleteMfaLogin();
    const isLoading = verifyEmailMutation.isPending || completeMfaMutation.isPending;
    const form = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        mode: "onBlur",
        defaultValues: { otp: "" },
    });

    const onSubmit = async (data: OtpFormData) => {
        if (!email) return;

        try {
            if (mode === "mfa") {
                const result = await completeMfaMutation.mutateAsync({ email, otp: data.otp });
                toast.success("MFA verification successful.");
                router.push(result?.redirectTo || "/overview");
                return;
            }

            const result = await verifyEmailMutation.mutateAsync({ email, otp: data.otp });

            if (result?.status === "VERIFIED_NO_PASSWORD") {
                toast.success("Email verified. Set your password to continue.");
                router.push(`/forgot-password?mode=setup&email=${encodeURIComponent(email)}`);
                return;
            }

            toast.success("Email verified. Please sign in.");
            router.push(ROUTES.AUTH.LOG_IN);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Invalid OTP. Please try again.");
        }
    };

    if (email === null) return null;

    return (
        <Card className="border shadow-none rounded-md">
            <CardHeader>
                <CardTitle className="text-2xl">{mode === "mfa" ? "Complete sign in" : "Verify your email"}</CardTitle>
                <CardDescription>Enter the 5-digit code sent to your email</CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const finalOtp = codes.join("");
                            form.setValue("otp", finalOtp, { shouldValidate: true, shouldTouch: true });
                            form.handleSubmit(onSubmit)();
                        }}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel className="text-center">Verification Code</FormLabel>
                                    <FormControl>
                                        <div className="flex justify-center gap-2">
                                            {codes.map((c, i) => (
                                                <Input
                                                    key={i}
                                                    id={`code-${i}`}
                                                    maxLength={1}
                                                    inputMode="numeric"
                                                    value={c}
                                                    onChange={(e) => handleCodeChange(i, e.target.value.replace(/\D/g, ""))}
                                                    className="w-12 h-12 text-xl text-center font-semibold"
                                                    disabled={isLoading}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-center" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading || form.formState.isSubmitting || codes.join("").length !== 5}
                            className="w-full"
                        >
                            {isLoading || form.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

