"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { saveInstituteProfile } from "@/features/dashboard/dashboardSlice";

export const instituteProfileSchema = z.object({
    name: z.string().trim().min(2, "Institute name must be at least 2 characters.").max(80, "Institute name cannot exceed 80 characters."),
    slug: z.string().trim().min(2, "Slug must be at least 2 characters.").max(80, "Slug cannot exceed 80 characters."),
    description: z.string().trim().max(1024, "Description cannot exceed 1024 characters."),
    phone: z.string().trim().refine((value) => !value || /^\d{10,15}$/.test(value.replace(/\D/g, "")), "Phone must be 10 to 15 digits."),
    whatsapp: z.string().trim().refine((value) => !value || /^\d{10,15}$/.test(value.replace(/\D/g, "")), "WhatsApp must be 10 to 15 digits."),
    addressLine1: z.string().trim().max(240, "Address line 1 cannot exceed 240 characters.").refine((value) => !value || value.length >= 5, "Address line 1 must be at least 5 characters."),
    addressLine2: z.string().trim().max(240, "Address line 2 cannot exceed 240 characters."),
    city: z.string().trim().max(60, "City cannot exceed 60 characters.").refine((value) => !value || value.length >= 2, "City must be at least 2 characters."),
    state: z.string().trim().max(60, "State cannot exceed 60 characters.").refine((value) => !value || value.length >= 2, "State must be at least 2 characters."),
    region: z.string().trim().max(60, "Region cannot exceed 60 characters."),
    postalCode: z.string().trim().max(12, "Postal code cannot exceed 12 characters."),
    country: z.string().trim().max(60, "Country cannot exceed 60 characters."),
    countryCode: z.string().trim().max(8, "Country code cannot exceed 8 characters."),
    timings: z.string().trim().max(120, "Timings cannot exceed 120 characters."),
    logo: z.string().trim().max(2048, "Logo URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
    banner: z.string().trim().max(2048, "Banner URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
    website: z.string().trim().max(2048, "Website URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
    instagram: z.string().trim().max(2048, "Instagram URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
    facebook: z.string().trim().max(2048, "Facebook URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
    youtube: z.string().trim().max(2048, "YouTube URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
    linkedin: z.string().trim().max(2048, "LinkedIn URL cannot exceed 2048 characters.").refine((value) => !value || z.url().safeParse(value).success, "Please enter a valid URL."),
});

export type InstituteFormValues = z.infer<typeof instituteProfileSchema>;

type InstituteProfileFormProps = {
    initialValues: InstituteFormValues;
    onCancel: () => void;
    onSaved: () => Promise<void>;
};

export default function InstituteProfileForm({ initialValues, onCancel, onSaved }: InstituteProfileFormProps) {
    const dispatch = useAppDispatch();
    const form = useForm<InstituteFormValues>({
        resolver: zodResolver(instituteProfileSchema),
        mode: "onBlur",
        defaultValues: initialValues,
    });

    useEffect(() => {
        form.reset(initialValues);
    }, [form, initialValues]);

    const onSubmit = async (values: InstituteFormValues) => {
        try {
            await dispatch(saveInstituteProfile(values)).unwrap();
            toast.success("Profile updated successfully");
            await onSaved();
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? "Failed to save profile");
        }
    };

    return (
        <Card className="border shadow-none rounded-md">
            <CardHeader>
                <CardTitle>Institute Profile</CardTitle>
                <CardDescription>Update your institute details and public profile links.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="md:grid-cols-2">
                        <Field>
                            <FieldLabel>Institute Name</FieldLabel>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} minLength={2} maxLength={80} />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Slug</FieldLabel>
                            <Controller
                                name="slug"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} minLength={2} maxLength={80} />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Phone</FieldLabel>
                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} inputMode="numeric" maxLength={15} />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>WhatsApp</FieldLabel>
                            <Controller
                                name="whatsapp"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} inputMode="numeric" maxLength={15} />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Address Line 1</FieldLabel>
                            <Controller
                                name="addressLine1"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} minLength={5} maxLength={240} placeholder="Street, building, area" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Address Line 2</FieldLabel>
                            <Controller
                                name="addressLine2"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={240} placeholder="Landmark (optional)" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Timings</FieldLabel>
                            <Controller
                                name="timings"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={120} placeholder="e.g. Mon-Sat 9AM-6PM" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>City</FieldLabel>
                            <Controller
                                name="city"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} minLength={2} maxLength={60} />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>State</FieldLabel>
                            <Controller
                                name="state"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} minLength={2} maxLength={60} />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Region</FieldLabel>
                            <Controller
                                name="region"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={60} placeholder="Region (optional)" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Postal Code</FieldLabel>
                            <Controller
                                name="postalCode"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={12} placeholder="Postal / ZIP" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Country</FieldLabel>
                            <Controller
                                name="country"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={60} placeholder="India" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Country Code</FieldLabel>
                            <Controller
                                name="countryCode"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={8} placeholder="IN" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field className="md:col-span-2">
                            <FieldLabel>Description</FieldLabel>
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputGroup>
                                            <InputGroupTextarea {...field} rows={4} maxLength={1024} />
                                            <InputGroupAddon>
                                                <InputGroupText>{field.value.length}/1024 characters</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Logo URL</FieldLabel>
                            <Controller
                                name="logo"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Banner URL</FieldLabel>
                            <Controller
                                name="banner"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Website</FieldLabel>
                            <Controller
                                name="website"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Instagram</FieldLabel>
                            <Controller
                                name="instagram"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://instagram.com/..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Facebook</FieldLabel>
                            <Controller
                                name="facebook"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://facebook.com/..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>YouTube</FieldLabel>
                            <Controller
                                name="youtube"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://youtube.com/..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>LinkedIn</FieldLabel>
                            <Controller
                                name="linkedin"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} type="url" maxLength={2048} placeholder="https://linkedin.com/..." />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" disabled={form.formState.isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
            </CardFooter>
        </Card>
    );
}
