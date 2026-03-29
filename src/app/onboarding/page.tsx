"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchOnboardingInstitute, submitOnboarding } from "@/features/appInstitute/appInstituteSlice";

type OnboardingForm = {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    region: string;
    postalCode: string;
    country: string;
    countryCode: string;
    whatsapp: string;
    description: string;
    website: string;
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
};

type FieldError = Partial<Record<keyof OnboardingForm, string>>;

export default function OnboardingIndexPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const onboardingData = useAppSelector((state) => state.appInstitute.onboarding.data);
    const loading = useAppSelector((state) => state.appInstitute.onboarding.loading);
    const saving = useAppSelector((state) => state.appInstitute.onboarding.loading);
    const [errors, setErrors] = useState<FieldError>({});
    const [form, setForm] = useState<OnboardingForm>({
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
    });

    useEffect(() => {
        void dispatch(fetchOnboardingInstitute());
    }, [dispatch]);

    useEffect(() => {
        const data = onboardingData as any;
        if (!data) return;

        if (data.isOnboarded) {
            router.push("/overview");
            return;
        }

        setForm({
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

    const setValue = (key: keyof OnboardingForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const next: FieldError = {};
        if (!form.name.trim()) next.name = "Institute name is required";
        if (!form.phone.trim()) next.phone = "Phone number is required";
        else if (!/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, "")))
            next.phone = "Enter a valid Indian mobile number";
        if (!form.addressLine1.trim()) next.addressLine1 = "Address line 1 is required";
        if (!form.city.trim()) next.city = "City is required";
        if (!form.state.trim()) next.state = "State is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        try {
            await dispatch(submitOnboarding({
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
            })).unwrap();

            toast.success("Institute setup complete!");
            router.push("/overview");
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? "Network error. Please try again.");
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
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Institute Name *</Label>
                                <Input id="name" value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="e.g. Pinnacle Academy" />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input id="phone" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} placeholder="e.g. 9876543210" />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                                <Input id="addressLine1" value={form.addressLine1} onChange={(e) => setValue("addressLine1", e.target.value)} placeholder="Street, building, area" />
                                {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressLine2">Address Line 2</Label>
                                <Input id="addressLine2" value={form.addressLine2} onChange={(e) => setValue("addressLine2", e.target.value)} placeholder="Landmark (optional)" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input id="city" value={form.city} onChange={(e) => setValue("city", e.target.value)} placeholder="e.g. Jaipur" />
                                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input id="state" value={form.state} onChange={(e) => setValue("state", e.target.value)} placeholder="e.g. Rajasthan" />
                                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region">Region</Label>
                                <Input id="region" value={form.region} onChange={(e) => setValue("region", e.target.value)} placeholder="Region (optional)" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input id="postalCode" value={form.postalCode} onChange={(e) => setValue("postalCode", e.target.value)} placeholder="e.g. 302001" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input id="country" value={form.country} onChange={(e) => setValue("country", e.target.value)} placeholder="India" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="countryCode">Country Code</Label>
                                <Input id="countryCode" value={form.countryCode} onChange={(e) => setValue("countryCode", e.target.value)} placeholder="IN" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setValue("whatsapp", e.target.value)} placeholder="WhatsApp number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={form.description} onChange={(e) => setValue("description", e.target.value)} placeholder="Short description" />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Social Links (optional)</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Input value={form.website} onChange={(e) => setValue("website", e.target.value)} placeholder="Website URL" />
                                <Input value={form.facebook} onChange={(e) => setValue("facebook", e.target.value)} placeholder="Facebook URL" />
                                <Input value={form.instagram} onChange={(e) => setValue("instagram", e.target.value)} placeholder="Instagram URL" />
                                <Input value={form.youtube} onChange={(e) => setValue("youtube", e.target.value)} placeholder="YouTube URL" />
                                <Input value={form.linkedin} onChange={(e) => setValue("linkedin", e.target.value)} placeholder="LinkedIn URL" />
                            </div>
                        </div>

                        <Button onClick={submit} disabled={saving} className="w-full" size="lg">
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save & Continue ->"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
