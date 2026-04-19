"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStudentPortalLogin } from "@/features/studentPortal/api";

export default function StudentLoginPage() {
    const router = useRouter();
    const loginMutation = useStudentPortalLogin();
    const submitting = loginMutation.isPending;
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        if (!identifier.trim() || !password.trim()) {
            toast.error("Enter username/email and password");
            return;
        }

        try {
            await loginMutation.mutateAsync({ identifier, password });
            router.push("/student");
            router.refresh();
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : error?.message ?? "Login failed");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Student Login</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Username or Email</Label>
                        <Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter username or email" />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" />
                    </div>
                    <p className="text-xs text-muted-foreground">Password reset is managed directly by your institute.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={login} disabled={submitting}>
                        {submitting ? "Signing in..." : "Sign in"}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
