"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { saveInstituteProfile } from "@/features/dashboard/dashboardSlice";
import { useFileUpload } from "@/hooks/useFileUpload";
import { isImageFile, validateFile } from "@/lib/storage/utils";

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
	const { uploadFile } = useFileUpload();
	const [uploadingField, setUploadingField] = useState<"logo" | "banner" | null>(null);
	const form = useForm<InstituteFormValues>({
		resolver: zodResolver(instituteProfileSchema),
		mode: "onBlur",
		defaultValues: initialValues,
	});

	useEffect(() => {
		form.reset(initialValues);
	}, [form, initialValues]);

	const handleImageUpload = async (
		file: File,
		fieldName: "logo" | "banner",
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
			toast.success(`${fieldName === "logo" ? "Logo" : "Banner"} uploaded successfully`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setUploadingField(null);
		}
	};

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
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField control={form.control} name="name" render={({ field }) => (
								<FormItem>
									<FormLabel>Institute Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Institute Name" minLength={2} maxLength={80} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="slug" render={({ field }) => (
								<FormItem>
									<FormLabel>Slug</FormLabel>
									<FormControl>
										<Input {...field} placeholder="URL slug" minLength={2} maxLength={80} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="phone" render={({ field }) => (
								<FormItem>
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<Input {...field} inputMode="numeric" maxLength={15} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="whatsapp" render={({ field }) => (
								<FormItem>
									<FormLabel>WhatsApp</FormLabel>
									<FormControl>
										<Input {...field} inputMode="numeric" maxLength={15} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="addressLine1" render={({ field }) => (
								<FormItem>
									<FormLabel>Address Line 1</FormLabel>
									<FormControl>
										<Input {...field} minLength={5} maxLength={240} placeholder="Street, building, area" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="addressLine2" render={({ field }) => (
								<FormItem>
									<FormLabel>Address Line 2</FormLabel>
									<FormControl>
										<Input {...field} maxLength={240} placeholder="Landmark (optional)" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="timings" render={({ field }) => (
								<FormItem>
									<FormLabel>Timings</FormLabel>
									<FormControl>
										<Input {...field} maxLength={120} placeholder="e.g. Mon-Sat 9AM-6PM" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="city" render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input {...field} minLength={2} maxLength={60} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="state" render={({ field }) => (
								<FormItem>
									<FormLabel>State</FormLabel>
									<FormControl>
										<Input {...field} minLength={2} maxLength={60} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="region" render={({ field }) => (
								<FormItem>
									<FormLabel>Region</FormLabel>
									<FormControl>
										<Input {...field} maxLength={60} placeholder="Region (optional)" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="postalCode" render={({ field }) => (
								<FormItem>
									<FormLabel>Postal Code</FormLabel>
									<FormControl>
										<Input {...field} maxLength={12} placeholder="Postal / ZIP" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="country" render={({ field }) => (
								<FormItem>
									<FormLabel>Country</FormLabel>
									<FormControl>
										<Input {...field} maxLength={60} placeholder="India" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="countryCode" render={({ field }) => (
								<FormItem>
									<FormLabel>Country Code</FormLabel>
									<FormControl>
										<Input {...field} maxLength={8} placeholder="IN" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="description" render={({ field }) => (
								<FormItem className="md:col-span-2">
									<FormLabel>Description</FormLabel>
									<FormControl>
										<InputGroup>
											<InputGroupTextarea {...field} rows={4} maxLength={1024} />
											<InputGroupAddon>
												<InputGroupText>{field.value.length}/1024 characters</InputGroupText>
											</InputGroupAddon>
										</InputGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />
						</div>
					</form>
				</Form>
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
