"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";

export type TeamRole = "MANAGER" | "COUNSELOR" | "TEACHER" | "VIEWER";

const teamSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name cannot exceed 80 characters."),
    phone: z.string().trim().refine((value) => !value || /^\d{10,15}$/.test(value.replace(/\D/g, "")), "Phone must be 10 to 15 digits."),
    email: z.string().trim().max(120, "Email cannot exceed 120 characters.").email("Enter a valid email.").or(z.literal("")),
    role: z.enum(["MANAGER", "COUNSELOR", "TEACHER", "VIEWER"]),
    active: z.boolean(),
    subjects: z.string().trim().max(120, "Subjects cannot exceed 120 characters."),
    experience: z.string().trim().max(120, "Experience cannot exceed 120 characters."),
    bio: z.string().trim().max(1024, "Bio cannot exceed 1024 characters."),
}).superRefine((values, ctx) => {
    if (values.role === "TEACHER") {
        return;
    }
    if (!values.email) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["email"],
            message: "Email is required for non-teacher members.",
        });
    }
});

export type TeamFormValues = z.infer<typeof teamSchema>;

type TeamFormProps = {
    initialValues: TeamFormValues;
    saving: boolean;
    isEdit: boolean;
    onCancel: () => void;
    onSubmit: (values: TeamFormValues) => Promise<void>;
};

export default function TeamForm({ initialValues, saving, isEdit, onCancel, onSubmit }: TeamFormProps) {
    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema),
        mode: "onBlur",
        defaultValues: initialValues,
        values: initialValues,
    });

    const selectedRole = form.watch("role");

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
                <CardTitle>{isEdit ? "Edit Team Member" : "Add Team Member"}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} minLength={2} maxLength={80} placeholder="Full name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role *</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                                    <SelectItem value="COUNSELOR">Counselor</SelectItem>
                                                    <SelectItem value="TEACHER">Teacher</SelectItem>
                                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedRole === "TEACHER" ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="subjects"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subjects</FormLabel>
                                                <FormControl>
                                                    <Input {...field} maxLength={120} placeholder="Physics, Chemistry" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="experience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experience</FormLabel>
                                                <FormControl>
                                                    <Input {...field} maxLength={120} placeholder="e.g. 6 years" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <InputGroup>
                                                        <InputGroupTextarea {...field} rows={3} maxLength={1024} placeholder="Short teacher bio" />
                                                        <InputGroupAddon>
                                                            <InputGroupText>{field.value.length}/1024 characters</InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="email" maxLength={120} placeholder="email@domain.com" />
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
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input {...field} inputMode="numeric" maxLength={15} placeholder="Optional" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="px-0 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" disabled={saving || form.formState.isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                    {saving || form.formState.isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>
            </CardFooter>
        </Card>
    );
}
