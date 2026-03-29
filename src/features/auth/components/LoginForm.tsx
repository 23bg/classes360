// "use client";

// import { useAuth } from "../hooks/useAuth";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { loginFormSchema } from "../validations/login.validation";
// import { LoginFormData } from "@/features/instagram/validations/login.validation";
// import ROUTES from "@/constants/route";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// import { Label } from "recharts";
// import Link from "next/link";




// export default function LoginForm() {
//     const router = useRouter();
//     const { login, loading, error } = useAuth();

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//         reset,
//     } = useForm<LoginFormData>({
//         resolver: zodResolver(loginFormSchema),
//     });

//     const onSubmit = async (data: LoginFormData) => {
//         try {
//             const success = await login(data);

//             if (success) {
//                 // Save email to localStorage
//                 localStorage.setItem("login_email", data.email);
//                 router.push(ROUTES.AUTH.VERIFICATION);
//             }

//             reset();
//         } catch (err) {
//             console.error("âŒ Login failed:", err);
//         }
//     };

//     return (

//         <Card className="border-0 shadow-lg">
//             <CardHeader className="space-y-1">
//                 <CardTitle className="text-2xl">Sign in</CardTitle>
//                 <CardDescription>Enter your email below to sign in to your account</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="space-y-2">
//                         <Label >Email</Label>

//                         {/* <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={loading} /> */}
//                         <Input
//                             type="email"
//                             {...register("email")}
//                             placeholder="Email"
//                             className="border rounded px-3 py-2 w-full"
//                             disabled={loading}
//                         />
//                         {errors.email && (
//                             <p className="text-red-500 text-sm">{errors.email.message}</p>
//                         )}
//                     </div>

//                     <Button type="submit" className="w-full" disabled={loading}>
//                         {loading ? "Signing in..." : "Sign in"}
//                     </Button>



//                     <p className="text-center text-sm text-muted-foreground">
//                         Don't have an account?{" "}
//                         <Link href={ROUTES.AUTH.SIGN_UP} className="text-primary hover:underline font-medium">
//                             Sign up
//                         </Link>
//                     </p>
//                 </form>
//             </CardContent>
//         </Card>

//     );
// }



"use client";

import { useAuth } from "../hooks/useAuth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "../validations/login.validation";
import { loginFormData } from "../validations/login.validation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function LoginForm() {
    const router = useRouter();
    const { login, loading } = useAuth();

    const form = useForm<loginFormData>({
        resolver: zodResolver(loginFormSchema),
        mode: "onBlur",
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: loginFormData) => {
        login(
            { email: data.email, password: data.password },

            {
                onSuccess: (result: { mfaRequired?: boolean; redirectTo?: string }) => {
                    if (result?.mfaRequired) {
                        localStorage.setItem("mfa_email", data.email);
                        toast.info("MFA verification required.");
                        router.push(ROUTES.AUTH.VERIFICATION);
                        return;
                    }

                    toast.success("Login successful.");
                    router.push(result?.redirectTo || "/overview");
                    form.reset();
                },

                onError: (err: any) => {
                    toast.error(typeof err === 'string' ? err : err?.message || "Login failed");
                },
            }
        );
    };

    return (
        <Card className="border shadow-none rounded-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>
                    Enter your email and password to continue
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input
                                            type="email"
                                            {...field}
                                            placeholder="name@example.com"
                                            disabled={loading}
                                            maxLength={120}
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Password</FieldLabel>
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input
                                            type="password"
                                            {...field}
                                            placeholder="Enter your password"
                                            disabled={loading}
                                            maxLength={128}
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Button type="submit" className="w-full" disabled={loading || form.formState.isSubmitting}>
                            {loading || form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link
                                href={ROUTES.AUTH.SIGN_UP}
                                className="text-primary hover:underline font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}

