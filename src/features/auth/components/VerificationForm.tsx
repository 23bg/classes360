"use client";

import { useAuth } from "../hooks/useAuth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

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
    const { verifyEmail, loading } = useAuth();

    const [email, setEmail] = useState<string | null>(null);
    const [mode, setMode] = useState<"emailVerification" | "mfa">("emailVerification");

    useEffect(() => {
        const mfaEmail = localStorage.getItem("mfa_email");
        if (mfaEmail) {
            setEmail(mfaEmail);
            setMode("mfa");
            return;
        }

        const verificationEmail = localStorage.getItem("verification_email");
        if (verificationEmail) {
            setEmail(verificationEmail);
            setMode("emailVerification");
            return;
        }

        toast.error("Verification session expired. Please try again.");
        router.push(ROUTES.AUTH.LOG_IN);
    }, [router]);

    const form = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        mode: "onBlur",
        defaultValues: { otp: "" },
    });

    const onSubmit = async (data: OtpFormData) => {
        if (!email) return;

        if (mode === "mfa") {
            fetch("/api/v1/auth/mfa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, otp: data.otp }),
            })
                .then(async (res) => {
                    const payload = await res.json();
                    if (!res.ok || !payload?.success) {
                        throw new Error(payload?.error || "Invalid OTP");
                    }

                    toast.success("MFA verification successful.");
                    localStorage.removeItem("mfa_email");
                    router.push(payload?.data?.redirectTo || "/overview");
                })
                .catch((err) => {
                    toast.error(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
                });
            return;
        }

        verifyEmail(
            { email, otp: data.otp },
            {
                onSuccess: () => {
                    toast.success("Email verified. Please sign in.");
                    localStorage.removeItem("verification_email");
                    router.push(ROUTES.AUTH.LOG_IN);
                },
                onError: (err: any) => {
                    toast.error(typeof err === "string" ? err : err?.message || "Invalid OTP. Please try again.");
                },
            }
        );
    };

    if (email === null) return null;

    return (
        <Card className="border shadow-none rounded-md">
            <CardHeader>
                <CardTitle className="text-2xl">{mode === "mfa" ? "Complete sign in" : "Verify your email"}</CardTitle>
                <CardDescription>Enter the 5-digit code sent to your email</CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const finalOtp = codes.join("");
                        form.setValue("otp", finalOtp, { shouldValidate: true, shouldTouch: true });
                        form.handleSubmit(onSubmit)();
                    }}
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel className="block text-center">Verification Code</FieldLabel>
                            <Controller
                                name="otp"
                                control={form.control}
                                render={({ fieldState }) => (
                                    <>
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
                                                    disabled={loading}
                                                />
                                            ))}
                                        </div>
                                        <FieldError errors={[fieldState.error]} className="text-center" />
                                    </>
                                )}
                            />
                        </Field>

                        <Button
                            type="submit"
                            disabled={loading || form.formState.isSubmitting || codes.join("").length !== 5}
                            className="w-full"
                        >
                            {loading || form.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}

