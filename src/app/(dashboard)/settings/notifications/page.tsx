"use client";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchNotificationSettings, updateNotificationSetting } from "@/features/dashboard/dashboardSlice";

type NotificationPreferences = {
    newEnquiryAlert: boolean;
    followUpReminder: boolean;
    leadAssigned: boolean;
    paymentReceived: boolean;
    admissionConfirmed: boolean;
};

const DEFAULT_PREFS: NotificationPreferences = {
    newEnquiryAlert: true,
    followUpReminder: true,
    leadAssigned: true,
    paymentReceived: true,
    admissionConfirmed: true,
};

export default function NotificationSettingsPage() {
    const dispatch = useAppDispatch();
    const prefs = useAppSelector((state) => state.dashboard.notifications.data);
    const loading = useAppSelector((state) => state.dashboard.notifications.loading);

    useEffect(() => {
        void dispatch(fetchNotificationSettings());
    }, [dispatch]);

    const update = async (key: keyof NotificationPreferences, value: boolean) => {
        try {
            await dispatch(updateNotificationSetting({ key, value })).unwrap();
            toast.success("Notification settings updated", { description: "Your preferences have been saved." });
        } catch {
            toast.error("Failed to update notification settings");
        }
    };

    if (loading) {
        return <main className="p-6">Loading...</main>;
    }

    return (
        <main className="p-6 space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <p className="text-sm text-muted-foreground mt-1">Enable or disable platform-managed WhatsApp notification events.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Event Notifications</CardTitle>
                    <CardDescription>Template text is managed by Classes360 and cannot be edited.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ToggleRow
                        label="New enquiry alert"
                        checked={(prefs ?? DEFAULT_PREFS).newEnquiryAlert}
                        onCheckedChange={(checked) => void update("newEnquiryAlert", checked)}
                    />
                    <ToggleRow
                        label="Follow-up reminder"
                        checked={(prefs ?? DEFAULT_PREFS).followUpReminder}
                        onCheckedChange={(checked) => void update("followUpReminder", checked)}
                    />
                    <ToggleRow
                        label="Payment received"
                        checked={(prefs ?? DEFAULT_PREFS).paymentReceived}
                        onCheckedChange={(checked) => void update("paymentReceived", checked)}
                    />
                    <ToggleRow
                        label="Lead assigned"
                        checked={(prefs ?? DEFAULT_PREFS).leadAssigned}
                        onCheckedChange={(checked) => void update("leadAssigned", checked)}
                    />
                    <ToggleRow
                        label="Admission confirmed"
                        checked={(prefs ?? DEFAULT_PREFS).admissionConfirmed}
                        onCheckedChange={(checked) => void update("admissionConfirmed", checked)}
                    />
                </CardContent>
            </Card>
        </main>
    );
}

function ToggleRow(props: {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{props.label}</p>
            <Switch checked={props.checked} onCheckedChange={props.onCheckedChange} />
        </div>
    );
}
