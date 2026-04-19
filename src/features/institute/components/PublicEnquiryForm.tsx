"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { submitPublicEnquiry } from "@/features/appInstitute/appInstituteSlice";

const publicEnquirySchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name cannot exceed 80 characters."),
	phone: z
		.string()
		.trim()
		.refine((value) => /^\d{10,15}$/.test(value.replace(/\D/g, "")), "Phone must be 10 to 15 digits."),
	email: z.string().trim().max(120, "Email cannot exceed 120 characters.").email("Enter a valid email.").or(z.literal("")),
	course: z.string().trim().max(120, "Course cannot exceed 120 characters.").or(z.literal("")),
	message: z.string().trim().max(1024, "Message cannot exceed 1024 characters.").or(z.literal("")),
});

type PublicEnquiryValues = z.infer<typeof publicEnquirySchema>;

type PublicEnquiryFormProps = {
	slug: string;
};

export default function PublicEnquiryForm({ slug }: PublicEnquiryFormProps) {
	const dispatch = useAppDispatch();
	const isSubmittingEnquiry = useAppSelector((state) => state.appInstitute.publicEnquiry.loading);
	const form = useForm<PublicEnquiryValues>({
		resolver: zodResolver(publicEnquirySchema),
		mode: "onBlur",
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			course: "",
			message: "",
		},
	});

	const onSubmit = async (values: PublicEnquiryValues) => {
		const phoneDigits = values.phone.replace(/\D/g, "");

		try {
			await dispatch(submitPublicEnquiry({
				slug,
				values: {
					name: values.name.trim(),
					phone: phoneDigits.length === 12 && phoneDigits.startsWith("91") ? phoneDigits.slice(2) : phoneDigits,
					email: values.email || undefined,
					course: values.course || undefined,
					message: values.message || undefined,
				},
			})).unwrap();
			toast.success("Enquiry submitted successfully");
			form.reset();
		} catch (error: any) {
			const code = error?.data?.error?.code;
			if (code === "DUPLICATE_LEAD") {
				toast.warning("Lead already exists. Open the existing record from dashboard search using this mobile number.");
				return;
			}

			toast.error(error?.data?.error?.message ?? "Failed to submit enquiry");
		}
	};

	return (
		<Card className="border shadow-none rounded-md">
			<CardHeader>
				<CardTitle>Enquiry Form</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name *</FormLabel>
									<FormControl>
										<Input {...field} minLength={2} maxLength={80} />
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
										<Input {...field} inputMode="numeric" maxLength={15} />
									</FormControl>
									<FormDescription>10 to 15 digits only.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/> 

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" maxLength={120} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/> 

						<FormField
							control={form.control}
							name="course"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course</FormLabel>
									<FormControl>
										<Input {...field} maxLength={120} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/> 

						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Message</FormLabel>
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
							)}
						/> 
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<Button disabled={form.formState.isSubmitting || isSubmittingEnquiry} onClick={form.handleSubmit(onSubmit)} className="w-full">
					{form.formState.isSubmitting || isSubmittingEnquiry ? "Submitting..." : "Submit Enquiry"}
				</Button>
			</CardFooter>
		</Card>
	);
}
