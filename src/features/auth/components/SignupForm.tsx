"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "../hooks/useAuthQuery";

import { SignupFormData, signupFormSchema } from "../validations/signup.validation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const countryCodes = [
    { id: "in", label: "India", dialCode: "+91", emoji: "🇮🇳" },
    { id: "us", label: "United States", dialCode: "+1", emoji: "🇺🇸" },
    { id: "gb", label: "United Kingdom", dialCode: "+44", emoji: "🇬🇧" },
    { id: "au", label: "Australia", dialCode: "+61", emoji: "🇦🇺" },
    { id: "ca", label: "Canada", dialCode: "+1", emoji: "🇨🇦" },
    { id: "sg", label: "Singapore", dialCode: "+65", emoji: "🇸🇬" },
    { id: "ae", label: "UAE", dialCode: "+971", emoji: "🇦🇪" },
];

export default function SignupForm() {
    const router = useRouter();
    const signupMutation = useSignup();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupFormSchema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            countryCode: "in",
            phoneNumber: "",
            email: "",
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        const selectedCountry = countryCodes.find((option) => option.id === data.countryCode);
        const dialCode = selectedCountry?.dialCode ?? data.countryCode;
        const fullPhoneNumber = `${dialCode}${data.phoneNumber}`;

        try {
            await signupMutation.mutateAsync({
                name: data.name,
                email: data.email,
                phoneNumber: fullPhoneNumber,
            });

            toast.success("Signup successful! Verify your email to continue.");
            router.push(`${ROUTES.AUTH.VERIFICATION}?mode=verify&email=${encodeURIComponent(data.email)}`);
            form.reset();
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Signup failed");
        }
    };

    return (
        <Card className="border shadow-none rounded-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ""} placeholder="Your full name" disabled={signupMutation.isPending} maxLength={80} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="countryCode"
                                render={({ field }) => (
                                    <FormItem className="w-[6rem]">
                                        <FormLabel className="sr-only">Country code</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Code" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countryCodes.map((option) => (
                                                        <SelectItem key={option.id} value={option.id}>
                                                            <span className="text-xs">{option.emoji}</span>
                                                            <span className="ml-1 text-sm">{option.dialCode}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Phone number</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="1234567890" disabled={signupMutation.isPending} maxLength={16} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} value={field.value ?? ""} placeholder="Email" disabled={signupMutation.isPending} maxLength={120} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={signupMutation.isPending || form.formState.isSubmitting}>
                            {signupMutation.isPending || form.formState.isSubmitting ? "Creating account..." : "Sign up"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
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

