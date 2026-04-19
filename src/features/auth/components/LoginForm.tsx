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

import { useLogin } from "../hooks/useAuthQuery";
import { useForm } from "react-hook-form";
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export default function LoginForm() {
    const router = useRouter();
    const loginMutation = useLogin();

    const form = useForm<loginFormData>({
        resolver: zodResolver(loginFormSchema),
        mode: "onBlur",
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: loginFormData) => {
        try {
            const result = await loginMutation.mutateAsync({ email: data.email, password: data.password });

            if (result?.mfaRequired) {
                toast.info("MFA verification required.");
                router.push(`${ROUTES.AUTH.VERIFICATION}?mode=mfa&email=${encodeURIComponent(data.email)}`);
                return;
            }

            if (result?.redirectTo === "/verification") {
                toast.info(result.message || "Please verify your email before continuing.");
                router.push(`${ROUTES.AUTH.VERIFICATION}?mode=verify&email=${encodeURIComponent(data.email)}`);
                return;
            }

            if (result?.redirectTo?.startsWith("/forgot-password")) {
                toast.info(result.message || "You haven’t set your password yet. Please create one.");
                router.push(result.redirectTo);
                return;
            }

            toast.success("Login successful.");
            router.push(result?.redirectTo || "/overview");
            form.reset();
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Login failed");
        }
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
                                            placeholder="name@example.com"
                                            disabled={loginMutation.isPending}
                                            maxLength={120}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                            placeholder="Enter your password"
                                            disabled={loginMutation.isPending}
                                            maxLength={128}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={loginMutation.isPending || form.formState.isSubmitting}>
                            {loginMutation.isPending || form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>

                        <div className="space-y-2 text-center text-sm text-muted-foreground">
                            <p>
                                Don't have an account?{" "}
                                <Link
                                    href={ROUTES.AUTH.SIGN_UP}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign up
                                </Link>
                            </p>
                            <p>
                                <Link
                                    href={`${ROUTES.AUTH.FORGOT_PASSWORD}?mode=reset`}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </p>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

