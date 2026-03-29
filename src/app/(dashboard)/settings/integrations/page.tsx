"use client";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchIntegrations } from "@/features/dashboard/dashboardSlice";

type IntegrationItem = {
    id: string;
    provider: "WHATSAPP" | "EMAIL" | "RAZORPAY";
    status: "CONNECTED" | "DISCONNECTED" | "DEGRADED";
    config?: Record<string, unknown> | null;
    updatedAt: string;
};

type IntegrationStatus = IntegrationItem["status"];

const statusVariant = (status: IntegrationStatus) => {
    if (status === "CONNECTED") return "default" as const;
    if (status === "DEGRADED") return "secondary" as const;
    return "outline" as const;
};

export default function IntegrationsSettingsPage() {
    const dispatch = useAppDispatch();
    const items = useAppSelector((state) => state.dashboard.integrations.data);
    const loading = useAppSelector((state) => state.dashboard.integrations.loading);

    useEffect(() => {
        void dispatch(fetchIntegrations());
    }, [dispatch]);

    const refresh = async () => {
        try {
            await dispatch(fetchIntegrations()).unwrap();
        } catch {
            toast.error("Failed to load integrations");
        }
    };

    if (loading) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <main className="p-6 space-y-6 max-w-4xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Integrations</h1>
                    <p className="text-sm text-muted-foreground mt-1">WhatsApp alerts notify your team instantly when enquiries arrive or follow-ups are due. You can optionally connect your WhatsApp Business number to automate student notifications.</p>
                </div>
                <Button variant="outline" onClick={() => void refresh()}>Refresh</Button>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                Settings -&gt; Integrations -&gt; WhatsApp -&gt; Payments -&gt; Email
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle className="text-base">{item.provider}</CardTitle>
                                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                            </div>
                            <CardDescription>
                                Updated {new Date(item.updatedAt).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-1">
                            <p><span className="font-medium text-foreground">Connection status:</span> {item.status}</p>
                            <p><span className="font-medium text-foreground">Configuration:</span> {Object.keys(item.config ?? {}).length > 0 ? "Configured" : "Not configured"}</p>
                            <p><span className="font-medium text-foreground">Activity log:</span> Last update {new Date(item.updatedAt).toLocaleString()}</p>
                            {Object.entries(item.config ?? {}).slice(0, 3).map(([key, value]) => (
                                <p key={key}>{key}: {String(value)}</p>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}
