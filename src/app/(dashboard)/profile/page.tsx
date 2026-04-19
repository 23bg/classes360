"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchInstituteProfile, saveInstituteProfile } from "@/features/dashboard/dashboardSlice";
import { useFileUpload } from "@/hooks/useFileUpload";
import { isImageFile, validateFile } from "@/lib/storage/utils";

const isValidUrl = (value: string) => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const optionalUrlSchema = z
    .string()
    .trim()
    .max(2048, "URL cannot exceed 2048 characters.")
    .refine((value) => !value || isValidUrl(value), "Please enter a valid URL.");

const optionalIndianPhoneSchema = z
    .string()
    .trim()
    .max(14, "Enter a valid Indian mobile number.")
    .refine((value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, "");
        if (digits.length === 12 && digits.startsWith("91")) {
            return /^[6-9]\d{9}$/.test(digits.slice(2));
        }
        return /^[6-9]\d{9}$/.test(digits);
    }, "Enter a valid Indian mobile number.");

const optionalTextWithMinMax = (min: number, max: number, minMessage: string, maxMessage: string) =>
    z
        .string()
        .trim()
        .max(max, maxMessage)
        .refine((value) => !value || value.length >= min, minMessage);

const instituteProfileSchema = z.object({
    name: z.string().trim().min(2, "Institute name must be at least 2 characters.").max(80, "Institute name cannot exceed 80 characters."),
    slug: z.string().trim().min(2, "Slug must be at least 2 characters.").max(80, "Slug cannot exceed 80 characters."),
    description: z.string().trim().max(1024, "Description cannot exceed 1024 characters."),
    phone: optionalIndianPhoneSchema,
    whatsapp: optionalIndianPhoneSchema,
    addressLine1: optionalTextWithMinMax(5, 240, "Address line 1 must be at least 5 characters.", "Address line 1 cannot exceed 240 characters."),
    addressLine2: z.string().trim().max(240, "Address line 2 cannot exceed 240 characters."),
    city: optionalTextWithMinMax(2, 60, "City must be at least 2 characters.", "City cannot exceed 60 characters."),
    state: optionalTextWithMinMax(2, 60, "State must be at least 2 characters.", "State cannot exceed 60 characters."),
    region: z.string().trim().max(60, "Region cannot exceed 60 characters."),
    postalCode: z.string().trim().max(12, "Postal code cannot exceed 12 characters."),
    country: z.string().trim().max(60, "Country cannot exceed 60 characters."),
    countryCode: z.string().trim().max(8, "Country code cannot exceed 8 characters."),
    timings: z.string().trim().max(80, "Timings cannot exceed 80 characters."),
    logo: optionalUrlSchema,
    heroImage: optionalUrlSchema,
    googleMapLink: optionalUrlSchema,
    website: optionalUrlSchema,
    instagram: optionalUrlSchema,
    facebook: optionalUrlSchema,
    youtube: optionalUrlSchema,
    linkedin: optionalUrlSchema,
});

type ProfileFormValues = z.infer<typeof instituteProfileSchema>;

export default function DashboardProfilePage() {
    const dispatch = useAppDispatch();
    const defaultValues: ProfileFormValues = {
        name: "", slug: "", description: "", phone: "", whatsapp: "",
        addressLine1: "", addressLine2: "", city: "", state: "", region: "", postalCode: "", country: "India", countryCode: "", timings: "", logo: "", heroImage: "", googleMapLink: "",
        website: "", instagram: "", facebook: "", youtube: "", linkedin: "",
    };

    const profile = useAppSelector((state) => state.dashboard.profile.data);
    const loading = useAppSelector((state) => state.dashboard.profile.loading);

    useEffect(() => {
        void dispatch(fetchInstituteProfile());
    }, [dispatch]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(instituteProfileSchema),
        mode: "onBlur",
        defaultValues,
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = form;

    useEffect(() => {
        if (profile) {
            reset(profile);
        }
    }, [profile, reset]);

    const { uploadFile } = useFileUpload();
    const [uploadingField, setUploadingField] = useState<"logo" | "heroImage" | null>(null);

    const handleImageUpload = async (
        file: File,
        fieldName: "logo" | "heroImage",
        onChange: (value: string) => void
    ) => {
        const validation = validateFile(file);
        if (!validation.isValid) {
            toast.error(validation.error ?? "Invalid file");
            return;
        }

        if (!isImageFile(file)) {
            toast.error("Only image files are allowed for this field");
            return;
        }

        try {
            setUploadingField(fieldName);
            const fileUrl = await uploadFile(file, "institutes", file.name);
            onChange(fileUrl);
            toast.success(`${fieldName === "logo" ? "Logo" : "Hero image"} uploaded successfully`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setUploadingField(null);
        }
    };

    const save = async (form: ProfileFormValues) => {
        try {
            await dispatch(saveInstituteProfile(form)).unwrap();
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? "Network error. Please try again.");
        }
    };

    if (loading) {
        return (
            <main className="p-6 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </main>
        );
    }

    return (
        <main className="p-6 max-w-4xl">
            <h1 className=" text-2xl font-semibold">Institute Profile</h1>
            <p className="mt-1 text-muted-foreground">Update your institute details. Changes are visible on your public page.</p>

            <Form {...form}>
                <form className="mt-6 space-y-6" onSubmit={handleSubmit(save)}>
                    <Card>
                    <CardHeader>
                        <CardTitle>Basic Info</CardTitle>
                        <CardDescription>Institute name, contact, and location.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField control={control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Institute Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Institute Name" minLength={2} maxLength={80} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="slug" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="URL slug" minLength={2} maxLength={80} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Phone" inputMode="numeric" maxLength={14} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="whatsapp" render={({ field }) => (
                            <FormItem>
                                <FormLabel>WhatsApp</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="WhatsApp" inputMode="numeric" maxLength={14} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="addressLine1" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Street, building, area" minLength={5} maxLength={240} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="addressLine2" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address Line 2</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Landmark (optional)" maxLength={240} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="timings" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timings</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Mon-Sat 9AM-6PM" maxLength={80} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="city" render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="City" minLength={2} maxLength={60} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="state" render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="State" minLength={2} maxLength={60} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="region" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Region</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Region (optional)" maxLength={60} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="postalCode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Postal / ZIP" maxLength={12} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="country" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="India" maxLength={60} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="countryCode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country Code</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="IN" maxLength={8} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="description" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupTextarea {...field} placeholder="Brief description of your institute" rows={4} maxLength={1024} />
                                        <InputGroupAddon>
                                            <InputGroupText>{field.value.length}/1024 characters</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                        <CardDescription>Add website and social media links.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField control={control} name="website" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder="https://..." maxLength={2048} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="instagram" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instagram</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder="https://instagram.com/..." maxLength={2048} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="facebook" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Facebook</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder="https://facebook.com/..." maxLength={2048} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="youtube" render={({ field }) => (
                            <FormItem>
                                <FormLabel>YouTube</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder="https://youtube.com/..." maxLength={2048} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="linkedin" render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder="https://linkedin.com/..." maxLength={2048} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="googleMapLink" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Google Map Link</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder="https://maps.google.com/..." maxLength={2048} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Media</CardTitle>
                        <CardDescription>Upload logo and hero image.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField control={control} name="logo" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo</FormLabel>
                                <FormControl>
                                    <Input
                                        name={field.name}
                                        onBlur={field.onBlur}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        disabled={isSubmitting || uploadingField === "logo"}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;
                                            void handleImageUpload(file, "logo", field.onChange);
                                            event.currentTarget.value = "";
                                        }}
                                    />
                                </FormControl>
                                <div className="space-y-2">
                                    {field.value ? (
                                        <p className="text-xs text-muted-foreground break-all">Current: {field.value}</p>
                                    ) : null}
                                    {field.value ? (
                                        <Button type="button" variant="outline" size="sm" onClick={() => field.onChange("")}>Remove</Button>
                                    ) : null}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="heroImage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hero Image</FormLabel>
                                <FormControl>
                                    <Input
                                        name={field.name}
                                        onBlur={field.onBlur}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        disabled={isSubmitting || uploadingField === "heroImage"}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;
                                            void handleImageUpload(file, "heroImage", field.onChange);
                                            event.currentTarget.value = "";
                                        }}
                                    />
                                </FormControl>
                                <div className="space-y-2">
                                    {field.value ? (
                                        <p className="text-xs text-muted-foreground break-all">Current: {field.value}</p>
                                    ) : null}
                                    {field.value ? (
                                        <Button type="button" variant="outline" size="sm" onClick={() => field.onChange("")}>Remove</Button>
                                    ) : null}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
                </Button>
            </form>
            </Form>
        </main>
    );
}
