"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStudentPortal } from "@/features/studentPortal/api";

export default function StudentProfilePage() {
    const { data } = useStudentPortal();
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [savedHint, setSavedHint] = useState("");

    useEffect(() => {
        setPhone(data?.student?.phone ?? "");
        setEmail(data?.student?.email ?? "");
    }, [data]);

    const saveLocalEdits = () => {
        setIsEditing(false);
        setSavedHint("Profile changes updated in portal view.");
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Profile</h1>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Student Information</CardTitle>
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
                    ) : null}
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Student Name</p>
                            <p className="font-medium">{data?.student?.name ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Enrollment Date</p>
                            <p className="font-medium">{data?.student?.admissionDate ? new Date(data.student.admissionDate).toLocaleDateString() : "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Course</p>
                            <p className="font-medium">{data?.student?.course?.name ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Batch</p>
                            <p className="font-medium">{data?.student?.batch?.name ?? "-"}</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium">{email || "-"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="studentPhone">Phone</Label>
                                <Input id="studentPhone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter phone" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="studentEmail">Email</Label>
                                <Input id="studentEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter email" />
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2">
                                <Button size="sm" onClick={saveLocalEdits}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {savedHint ? <p className="text-xs text-muted-foreground">{savedHint}</p> : null}
                </CardContent>
            </Card>
        </div>
    );
}
