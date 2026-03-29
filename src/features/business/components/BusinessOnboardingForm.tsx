"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientLogger } from "@/lib/clientLogger";

const businessSchema = z.object({
    name: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name must be less than 100 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
    category: z.string().optional().or(z.literal("")),
    email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
    phoneNumber1: z.string().optional().or(z.literal("")),
    phoneNumber2: z.string().optional().or(z.literal("")),
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

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BusinessFormData>({
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Business Name *</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Enter your business name"
                                    disabled={isLoading}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Tell us about your business..."
                                rows={3}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    {...register("category")}
                                    placeholder="e.g., Restaurant, Retail, Services"
                                    disabled={isLoading}
                                />
                                {errors.category && (
                                    <p className="text-sm text-red-500">{errors.category.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    {...register("website")}
                                    placeholder="https://yourbusiness.com"
                                    disabled={isLoading}
                                />
                                {errors.website && (
                                    <p className="text-sm text-red-500">{errors.website.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contact Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="contact@yourbusiness.com"
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber1">Phone Number 1</Label>
                                <Input
                                    id="phoneNumber1"
                                    {...register("phoneNumber1")}
                                    placeholder="+1 (555) 123-4567"
                                    disabled={isLoading}
                                />
                                {errors.phoneNumber1 && (
                                    <p className="text-sm text-red-500">{errors.phoneNumber1.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber2">Phone Number 2</Label>
                            <Input
                                id="phoneNumber2"
                                {...register("phoneNumber2")}
                                placeholder="Alternative phone number"
                                disabled={isLoading}
                            />
                            {errors.phoneNumber2 && (
                                <p className="text-sm text-red-500">{errors.phoneNumber2.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Address Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Textarea
                                id="address"
                                {...register("address")}
                                placeholder="123 Business St, Suite 100"
                                rows={2}
                                disabled={isLoading}
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    {...register("city")}
                                    placeholder="City"
                                    disabled={isLoading}
                                />
                                {errors.city && (
                                    <p className="text-sm text-red-500">{errors.city.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    {...register("state")}
                                    placeholder="State"
                                    disabled={isLoading}
                                />
                                {errors.state && (
                                    <p className="text-sm text-red-500">{errors.state.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    {...register("country")}
                                    placeholder="Country"
                                    disabled={isLoading}
                                />
                                {errors.country && (
                                    <p className="text-sm text-red-500">{errors.country.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    {...register("pincode")}
                                    placeholder="12345"
                                    disabled={isLoading}
                                />
                                {errors.pincode && (
                                    <p className="text-sm text-red-500">{errors.pincode.message}</p>
                                )}
                            </div>
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
            </CardContent>
        </Card>
    );
}
