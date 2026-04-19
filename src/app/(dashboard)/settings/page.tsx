"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    useActivateDomainSettings,
    useDomainSettings,
    useExportSettingsData,
    useSaveDomainSettings,
    useSettingsCounts,
    useVerifyDomainSettings,
} from "@/features/appInstitute/api";

type DomainSettings = {
    slug: string;
    customDomain: string;
    domainVerified: boolean;
    domainStatus: "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";
    defaultDomain: string;
    dnsInstruction: {
        type: string;
        name: string;
        target: string;
    };
};

type DashboardSettings = {
    compactTables: boolean;
    autoRefreshDashboard: boolean;
    showAmountsInLakh: boolean;
};

type NotificationSettings = {
    desktopAlerts: boolean;
    paymentReminders: boolean;
    leadActivityAlerts: boolean;
};

type AppSettings = {
    dashboard: DashboardSettings;
    notifications: NotificationSettings;
};

const SETTINGS_STORAGE_KEY = "classes360:settings";

const defaultSettings: AppSettings = {
    dashboard: {
        compactTables: false,
        autoRefreshDashboard: true,
        showAmountsInLakh: false,
    },
    notifications: {
        desktopAlerts: true,
        paymentReminders: true,
        leadActivityAlerts: true,
    },
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const { data: dataCounts } = useSettingsCounts();
    const exportSettingsMutation = useExportSettingsData();
    const { data: domainSettings, isLoading: domainLoading } = useDomainSettings();
    const saveDomainMutation = useSaveDomainSettings();
    const verifyDomainMutation = useVerifyDomainSettings();
    const activateDomainMutation = useActivateDomainSettings();
    const [domainInput, setDomainInput] = useState("");

    useEffect(() => {
        setMounted(true);
        try {
            const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as AppSettings;
            setSettings({
                dashboard: { ...defaultSettings.dashboard, ...parsed.dashboard },
                notifications: { ...defaultSettings.notifications, ...parsed.notifications },
            });
        } catch {
            setSettings(defaultSettings);
        }
    }, []);

    useEffect(() => {
        setDomainInput(domainSettings?.customDomain ?? "");
    }, [domainSettings]);

    const domainBusy = saveDomainMutation.isPending || verifyDomainMutation.isPending || activateDomainMutation.isPending || domainLoading;

    const getStatusVariant = (status: DomainSettings["domainStatus"]): "default" | "secondary" | "destructive" => {
        if (status === "ACTIVE") return "default";
        if (status === "FAILED") return "destructive";
        return "secondary";
    };

    const saveDomain = async () => {
        if (!domainInput.trim()) {
            toast.error("Please enter a custom domain");
            return;
        }

        try {
            await saveDomainMutation.mutateAsync({ customDomain: domainInput });
            toast.success("Domain saved. Add DNS record and verify.");
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : error?.message ?? "Unable to save custom domain");
        }
    };

    const verifyDomain = async () => {
        try {
            const latest = await verifyDomainMutation.mutateAsync({ customDomain: domainInput });
            toast.success(latest?.domainVerified ? "Domain verified" : "Domain not verified yet");
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : error?.message ?? "Unable to verify domain");
        }
    };

    const activateDomain = async () => {
        try {
            await activateDomainMutation.mutateAsync({ customDomain: domainInput });
            toast.success("Domain activated");
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : error?.message ?? "Unable to activate domain");
        }
    };

    const saveSettings = () => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        toast.success("Settings saved");
    };

    const exportData = async () => {
        try {
            const payload = await exportSettingsMutation.mutateAsync();

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `classes360-export-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("Data export downloaded");
        } catch {
            toast.error("Failed to export data");
        }
    };

    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className=" text-2xl font-semibold">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage appearance, notifications, and dashboard behavior.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Platform Integrations</CardTitle>
                    <CardDescription>Configure sender and event-level notification behavior.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/settings/whatsapp-integration">Settings → WhatsApp Integration</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/settings/notifications">Settings → Notifications</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/settings/integrations">Settings → Integrations</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Choose how Classes360 looks for your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-xs">
                        <Label>Theme</Label>
                        <Select
                            value={mounted ? (theme ?? "system") : "system"}
                            onValueChange={(value) => setTheme(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Preferences</CardTitle>
                    <CardDescription>Control table density and dashboard behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Compact tables</p>
                            <p className="text-xs text-muted-foreground">Reduce table spacing to fit more rows.</p>
                        </div>
                        <Switch
                            checked={settings.dashboard.compactTables}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    dashboard: { ...prev.dashboard, compactTables: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Auto refresh dashboard</p>
                            <p className="text-xs text-muted-foreground">Refresh summary cards and key metrics automatically.</p>
                        </div>
                        <Switch
                            checked={settings.dashboard.autoRefreshDashboard}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    dashboard: { ...prev.dashboard, autoRefreshDashboard: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Show large amounts in lakh format</p>
                            <p className="text-xs text-muted-foreground">Display values like ₹1,50,000 as ₹1.5L where applicable.</p>
                        </div>
                        <Switch
                            checked={settings.dashboard.showAmountsInLakh}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    dashboard: { ...prev.dashboard, showAmountsInLakh: checked },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Choose what updates you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Desktop alerts</p>
                            <p className="text-xs text-muted-foreground">Show browser alerts for important activity.</p>
                        </div>
                        <Switch
                            checked={settings.notifications.desktopAlerts}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, desktopAlerts: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Fee payment reminders</p>
                            <p className="text-xs text-muted-foreground">Notify when pending fee reminders are due.</p>
                        </div>
                        <Switch
                            checked={settings.notifications.paymentReminders}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, paymentReminders: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Lead activity alerts</p>
                            <p className="text-xs text-muted-foreground">Notify when leads are added or status changes.</p>
                        </div>
                        <Switch
                            checked={settings.notifications.leadActivityAlerts}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, leadActivityAlerts: checked },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data</CardTitle>
                    <CardDescription>Review usage and export your institute data anytime.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Students</p><p className="text-lg font-semibold">{dataCounts?.students ?? 0}</p></div>
                        <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Leads</p><p className="text-lg font-semibold">{dataCounts?.leads ?? 0}</p></div>
                        <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Courses</p><p className="text-lg font-semibold">{dataCounts?.courses ?? 0}</p></div>
                        <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Payments</p><p className="text-lg font-semibold">{dataCounts?.payments ?? 0}</p></div>
                    </div>

                    <Button variant="outline" onClick={exportData} disabled={exportSettingsMutation.isPending}>
                        {exportSettingsMutation.isPending ? "Exporting..." : "Export Data"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Domains</CardTitle>
                    <CardDescription>Connect your own domain and activate white-label access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded border p-3">
                            <p className="text-xs text-muted-foreground">Default subdomain</p>
                            <p className="text-sm font-medium">{domainSettings?.defaultDomain || "-"}</p>
                        </div>
                        <div className="rounded border p-3">
                            <p className="text-xs text-muted-foreground">Current status</p>
                            <div className="mt-1">
                                <Badge variant={getStatusVariant(domainSettings?.domainStatus ?? "PENDING")}>
                                    {domainSettings?.domainStatus ?? "PENDING"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-domain">Custom domain</Label>
                        <Input
                            id="custom-domain"
                            value={domainInput}
                            onChange={(event) => setDomainInput(event.target.value)}
                            placeholder="portal.yourinstitute.com"
                        />
                    </div>

                    <div className="rounded border p-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">DNS record to add</p>
                        <p className="mt-1">Type: {domainSettings?.dnsInstruction.type ?? "CNAME"}</p>
                        <p>Name: {domainSettings?.dnsInstruction.name ?? "portal"}</p>
                        <p>Target: {domainSettings?.dnsInstruction.target ?? "cname.vercel-dns.com"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={saveDomain} disabled={domainBusy}>
                            {saveDomainMutation.isPending ? "Saving..." : "Save Domain"}
                        </Button>
                        <Button variant="outline" onClick={verifyDomain} disabled={domainBusy || !domainInput.trim()}>
                            {verifyDomainMutation.isPending ? "Verifying..." : "Verify DNS"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={activateDomain}
                            disabled={domainBusy || !domainSettings?.domainVerified}
                        >
                            {activateDomainMutation.isPending ? "Activating..." : "Activate Domain"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={saveSettings}>Save Settings</Button>
            </div>
        </main>
    );
}
