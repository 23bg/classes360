"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useOnboardingInstitute, useSubmitOnboarding } from "@/features/appInstitute/api";

const onboardingFormSchema = z.object({
    name: z.string().trim().min(2, "Institute name must be at least 2 characters.").max(80, "Institute name cannot exceed 80 characters."),
    phone: z.string().trim().min(4, "Phone number must be at least 4 digits.").max(20, "Phone number cannot exceed 20 digits."),
    addressLine1: z.string().trim().min(2, "Address line 1 must be at least 2 characters.").max(240, "Address line 1 cannot exceed 240 characters."),
    addressLine2: z.string().trim().max(240, "Address line 2 cannot exceed 240 characters.").optional().or(z.literal("")),
    city: z.string().trim().min(2, "City must be at least 2 characters.").max(60, "City cannot exceed 60 characters."),
    state: z.string().trim().min(2, "State must be at least 2 characters.").max(60, "State cannot exceed 60 characters."),
    region: z.string().trim().max(60, "Region cannot exceed 60 characters.").optional().or(z.literal("")),
    postalCode: z.string().trim().max(12, "Postal code cannot exceed 12 characters.").optional().or(z.literal("")),
    country: z.string().trim().max(60, "Country cannot exceed 60 characters.").optional().or(z.literal("")),
    countryCode: z.string().trim().max(8, "Country code cannot exceed 8 characters.").optional().or(z.literal("")),
    whatsapp: z.string().trim().max(20, "WhatsApp cannot exceed 20 characters.").optional().or(z.literal("")),
    description: z.string().trim().max(1024, "Description cannot exceed 1024 characters.").optional().or(z.literal("")),
    website: z.string().trim().url("Please enter a valid website URL").optional().or(z.literal("")),
    facebook: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
    instagram: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
    youtube: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
    linkedin: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
});

type OnboardingForm = z.infer<typeof onboardingFormSchema>;

export default function OnboardingIndexPage() {
    const router = useRouter();
    const { data: onboardingData, isLoading: loading } = useOnboardingInstitute();
    const submitOnboardingMutation = useSubmitOnboarding();
    const saving = submitOnboardingMutation.isPending;

    const form = useForm<OnboardingForm>({
        resolver: zodResolver(onboardingFormSchema),
        defaultValues: {
            name: "",
            phone: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            region: "",
            postalCode: "",
            country: "India",
            countryCode: "",
            whatsapp: "",
            description: "",
            website: "",
            facebook: "",
            instagram: "",
            youtube: "",
            linkedin: "",
        },
    });

    useEffect(() => {
        const data = onboardingData as any;
        if (!data) return;

        if (data.isOnboarded) {
            router.push("/overview");
            return;
        }

        form.reset({
            name: data.name ?? "",
            phone: data.phone ?? "",
            addressLine1: data.address?.addressLine1 ?? "",
            addressLine2: data.address?.addressLine2 ?? "",
            city: data.address?.city ?? "",
            state: data.address?.state ?? "",
            region: data.address?.region ?? "",
            postalCode: data.address?.postalCode ?? "",
            country: data.address?.country ?? "India",
            countryCode: data.address?.countryCode ?? "",
            whatsapp: data.whatsapp ?? "",
            description: data.description ?? "",
            website: data.socialLinks?.website ?? "",
            facebook: data.socialLinks?.facebook ?? "",
            instagram: data.socialLinks?.instagram ?? "",
            youtube: data.socialLinks?.youtube ?? "",
            linkedin: data.socialLinks?.linkedin ?? "",
        });
    }, [onboardingData, router]);

    const submit = async (form: OnboardingForm) => {
        try {
            await submitOnboardingMutation.mutateAsync({
                ...form,
                address: {
                    addressLine1: form.addressLine1,
                    addressLine2: form.addressLine2,
                    city: form.city,
                    state: form.state,
                    region: form.region,
                    postalCode: form.postalCode,
                    country: form.country,
                    countryCode: form.countryCode,
                },
            });

            toast.success("Institute setup complete!");
            router.push("/overview");
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : error?.message ?? "Network error. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-3xl space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-primary">Step 1 of 1 - Institute Setup</p>
                    <h1 className="text-3xl font-bold tracking-tight">Setup Your Institute</h1>
                    <p className="text-muted-foreground">Fill in the details below to start managing admissions.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Fields marked with * are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Institute Name *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Pinnacle Academy" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. 9876543210" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="addressLine1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address Line 1 *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Street, building, area" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="addressLine2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address Line 2</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Landmark (optional)" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Jaipur" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Rajasthan" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Region</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Region (optional)" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="postalCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. 302001" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="India" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="countryCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country Code</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="IN" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="WhatsApp number" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Short description" rows={4} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-3">Social Links (optional)</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Website</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Website URL" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="facebook"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Facebook</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Facebook URL" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="instagram"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Instagram</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Instagram URL" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="youtube"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>YouTube</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="YouTube URL" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="linkedin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="LinkedIn URL" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving} className="w-full" size="lg">
                                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save & Continue ->"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
