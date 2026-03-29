"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";

export type TeamRole = "OWNER" | "MANAGER" | "COUNSELOR" | "TEACHER" | "VIEWER";

const teamSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name cannot exceed 80 characters."),
    phone: z.string().trim().refine((value) => !value || /^\d{10,15}$/.test(value.replace(/\D/g, "")), "Phone must be 10 to 15 digits."),
    email: z.string().trim().max(120, "Email cannot exceed 120 characters.").email("Enter a valid email.").or(z.literal("")),
    role: z.enum(["OWNER", "MANAGER", "COUNSELOR", "TEACHER", "VIEWER"]),
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
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Name *</FieldLabel>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} minLength={2} maxLength={80} placeholder="Full name" />
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Role *</FieldLabel>
                            <Controller
                                name="role"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OWNER">Owner</SelectItem>
                                                <SelectItem value="MANAGER">Manager</SelectItem>
                                                <SelectItem value="COUNSELOR">Counselor</SelectItem>
                                                <SelectItem value="TEACHER">Teacher</SelectItem>
                                                <SelectItem value="VIEWER">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </>
                                )}
                            />
                        </Field>

                        {selectedRole === "TEACHER" ? (
                            <>
                                <Field>
                                    <FieldLabel>Subjects</FieldLabel>
                                    <Controller
                                        name="subjects"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Input {...field} maxLength={120} placeholder="Physics, Chemistry" />
                                                <FieldError errors={[fieldState.error]} />
                                            </>
                                        )}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>Experience</FieldLabel>
                                    <Controller
                                        name="experience"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Input {...field} maxLength={120} placeholder="e.g. 6 years" />
                                                <FieldError errors={[fieldState.error]} />
                                            </>
                                        )}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>Bio</FieldLabel>
                                    <Controller
                                        name="bio"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <InputGroup>
                                                    <InputGroupTextarea {...field} rows={3} maxLength={1024} placeholder="Short teacher bio" />
                                                    <InputGroupAddon>
                                                        <InputGroupText>{field.value.length}/1024 characters</InputGroupText>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldError errors={[fieldState.error]} />
                                            </>
                                        )}
                                    />
                                </Field>
                            </>
                        ) : (
                            <>
                                <Field>
                                    <FieldLabel>Email *</FieldLabel>
                                    <Controller
                                        name="email"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Input {...field} type="email" maxLength={120} placeholder="email@domain.com" />
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
                                                <Input {...field} inputMode="numeric" maxLength={15} placeholder="Optional" />
                                                <FieldError errors={[fieldState.error]} />
                                            </>
                                        )}
                                    />
                                </Field>
                            </>
                        )}
                    </FieldGroup>
                </form>
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
