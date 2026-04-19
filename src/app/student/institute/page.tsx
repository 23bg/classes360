"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useStudentPortal } from "@/features/studentPortal/api";

type Teacher = {
    photo?: string | null;
    name?: string | null;
    subject?: string | null;
    experience?: string | null;
    bio?: string | null;
};

type PortalInstitute = {
    name?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    whatsapp?: string | null;
    supportPhone?: string | null;
    supportEmail?: string | null;
    officeAddress?: string | null;
    services?: string[] | null;
    teachers?: Teacher[] | null;
};

type StudentInstitutePortalData = {
    student?: {
        institute?: PortalInstitute | null;
    };
    teachers?: Teacher[];
};

export default function StudentInstitutePage() {
    const { data } = useStudentPortal();

    const institute = data?.student?.institute;
    const teachers = useMemo(() => {
        return (data?.teachers ?? institute?.teachers ?? []) as Teacher[];
    }, [data?.teachers, institute?.teachers]);

    const services = institute?.services ?? [
        "Doubt Solving",
        "Test Series",
        "Mentorship",
        "Recorded Lectures",
        "Study Materials",
    ];

    const whatsappContact = institute?.whatsapp || institute?.phone || "";
    const supportPhone = institute?.supportPhone || institute?.phone || "";
    const supportEmail = institute?.supportEmail || institute?.email || "";

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Institute</h1>

            <Card>
                <CardHeader>
                    <CardTitle>About Institute</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                    <p><span className="text-muted-foreground">Institute Name:</span> {institute?.name || "-"}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {institute?.phone || "-"}</p>
                    <p><span className="text-muted-foreground">Email:</span> {institute?.email || "-"}</p>
                    <p><span className="text-muted-foreground">Website:</span> {institute?.website || "-"}</p>
                    <p className="md:col-span-2"><span className="text-muted-foreground">Description:</span> {institute?.description || "Institute description will be updated soon."}</p>
                    <p className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {institute?.address || "Address not available."}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Faculty / Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    {teachers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Faculty details will be published soon.</p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {teachers.map((teacher, index) => (
                                <div key={`${teacher.name}-${index}`} className="rounded-lg border p-4">
                                    <div className="mb-3 flex items-center gap-3">
                                        {teacher.photo ? (
                                            <Image
                                                src={teacher.photo}
                                                alt={teacher.name || "Teacher"}
                                                width={48}
                                                height={48}
                                                unoptimized
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                                {(teacher.name || "T").slice(0, 1).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold">{teacher.name || "Teacher"}</h3>
                                            <p className="text-xs text-muted-foreground">{teacher.subject || "Subject to be announced"}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm"><span className="text-muted-foreground">Experience:</span> {teacher.experience || "-"}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{teacher.bio || "Bio will be updated soon."}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="grid gap-2 md:grid-cols-2">
                        <p><span className="text-muted-foreground">WhatsApp Support:</span> {whatsappContact || "-"}</p>
                        <p><span className="text-muted-foreground">Email Support:</span> {supportEmail || "-"}</p>
                        <p><span className="text-muted-foreground">Phone Support:</span> {supportPhone || "-"}</p>
                        <p><span className="text-muted-foreground">Office Address:</span> {institute?.officeAddress || institute?.address || "-"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" disabled={!whatsappContact}>
                            <a href={whatsappContact ? `https://wa.me/${whatsappContact.replace(/\D/g, "")}` : "#"} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
                        </Button>
                        <Button asChild variant="outline" disabled={!supportEmail}>
                            <a href={supportEmail ? `mailto:${supportEmail}` : "#"}>Send Email</a>
                        </Button>
                        <Button asChild variant="outline" disabled={!supportPhone}>
                            <a href={supportPhone ? `tel:${supportPhone}` : "#"}>Call Support</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {services.map((service) => (
                            <span key={service} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                                {service}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
