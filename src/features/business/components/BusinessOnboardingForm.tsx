"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientLogger } from "@/lib/clientLogger";

const optionalPhoneSchema = z
    .string()
    .trim()
    .max(20, "Phone number must be less than 20 characters.")
    .refine((value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
    }, "Phone must be 10 to 15 digits.")
    .or(z.literal(""));

const businessSchema = z.object({
    name: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name must be less than 100 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
    category: z.string().optional().or(z.literal("")),
    email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
    phoneNumber1: optionalPhoneSchema,
    phoneNumber2: optionalPhoneSchema,
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    pincode: z.string().optional().or(z.literal("")),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessOnboardingFormProps {
    onSuccess?: () => void;
}

export function BusinessOnboardingForm({ onSuccess }: BusinessOnboardingFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BusinessFormData>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            email: "",
            phoneNumber1: "",
            phoneNumber2: "",
            address: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
            website: "",
        },
    });

    const onSubmit = async (data: BusinessFormData) => {
        setIsLoading(true);
        try {
            await api.put(API.INTERNAL.INSTITUTE.ROOT, {
                name: data.name,
                description: data.description,
                phone: data.phoneNumber1,
                whatsapp: data.phoneNumber2,
                address: data.address,
                city: data.city,
                state: data.state,
                socialLinks: {
                    website: data.website,
                },
            });

            toast.success("Business created successfully!");
            onSuccess?.();
        } catch (error: any) {
            clientLogger.error("business_creation_error", {
                message: error?.message,
            });

            const errorMessage = typeof error === 'string' ? error :
                error?.data?.message ||
                error?.message ||
                error?.error?.message ||
                'Failed to create business. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Setup Your Business</CardTitle>
                <CardDescription>
                    Tell us about your business to get started with Classes360
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Business Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter your business name" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Tell us about your business..." rows={3} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g., Restaurant, Retail, Services" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="url" placeholder="https://yourbusiness.com" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="contact@yourbusiness.com" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber1"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Phone Number 1</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="+1 (555) 123-4567" disabled={isLoading} />
                                            </FormControl>
                                            <FormDescription>Optional. 10 to 15 digits.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="phoneNumber2"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Phone Number 2</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Alternative phone number" disabled={isLoading} />
                                        </FormControl>
                                        <FormDescription>Optional. 10 to 15 digits.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Address Information</h3>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="123 Business St, Suite 100" rows={2} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="City" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="State" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Country" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pincode"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Pincode</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="12345" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Business...
                                </>
                            ) : (
                                "Create Business"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
