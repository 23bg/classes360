"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard } from "lucide-react";
import { getPlanPricing, PLAN_CONFIG, PlanType, PricingVersion } from "@/config/plans";
import type { BillingInterval } from "@/features/subscription/subscriptionApi";
import Script from "next/script";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
    confirmBillingSubscription,
    createBillingSubscription,
    fetchBillingDashboard,
    generateBillingInvoice,
    retryBillingInvoice,
} from "@/features/dashboard/dashboardSlice";

type RazorpayCheckoutResponse = {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
    key: string;
    subscription_id: string;
    name: string;
    description: string;
    handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
    modal?: {
        ondismiss?: () => void;
    };
};

type RazorpayInstance = {
    open: () => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

type InvoiceHistoryItem = {
    id: string;
    month: number;
    year: number;
    periodStart: string;
    periodEnd: string;
    planCharge: number;
    usageCharge: number;
    totalAmount: number;
    status: "PENDING" | "ISSUED" | "PAID" | "OVERDUE" | "VOID";
    dueDate?: string | null;
    issuedAt?: string | null;
    paidAt?: string | null;
    paymentLinkUrl?: string | null;
    downloadUrl?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
    TRIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    INACTIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function BillingPage() {
    const dispatch = useAppDispatch();
    const billingData = useAppSelector((state) => state.dashboard.billing.data);
    const loading = useAppSelector((state) => state.dashboard.billing.loading);
    const creating = useAppSelector((state) => state.dashboard.billing.subscription.loading);
    const generatingInvoice = useAppSelector((state) => state.dashboard.billing.invoice.loading);
    const retryingInvoice = useAppSelector((state) => state.dashboard.billing.retry.loading);
    const summary = billingData?.summary ?? null;
    const usage = billingData?.usage ?? null;
    const invoices = billingData?.invoices ?? [];
    const policy = billingData?.policy ?? null;
    const sender = billingData?.sender ?? null;
    const [selectedPlan, setSelectedPlan] = useState<PlanType>("STARTER");
    const [selectedInterval, setSelectedInterval] = useState<BillingInterval>("MONTHLY");
    const [retryingInvoiceId, setRetryingInvoiceId] = useState<string | null>(null);

    useEffect(() => {
        void dispatch(fetchBillingDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (summary?.planType) {
            setSelectedPlan(summary.planType as PlanType);
        }
        if (summary?.billingInterval) {
            setSelectedInterval(summary.billingInterval as BillingInterval);
        }
    }, [summary?.billingInterval, summary?.planType]);

    const usageWarningThreshold = usage ? Math.floor(usage.alertsIncluded * 0.8) : null;
    const isUsageWarning = usage && usage.alertsIncluded > 0 && usage.alertsUsed >= (usageWarningThreshold ?? 0);
    const selectedPricingVersion: PricingVersion = (summary?.pricingVersion as PricingVersion | undefined) ?? "CURRENT";
    const getDisplayPlanPrice = (planType: PlanType) => getPlanPricing(planType, { version: selectedPricingVersion }).monthly;

    const createSubscription = async (planType: PlanType) => {
        try {
            const payload = await dispatch(createBillingSubscription({
                planType,
                interval: selectedInterval,
            })).unwrap();

            if (!payload?.subscriptionId || !payload?.key) {
                throw new Error("Missing checkout payload");
            }

            const RazorpayCtor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
            if (!RazorpayCtor) {
                throw new Error("Razorpay SDK not loaded");
            }

            const rzp = new RazorpayCtor({
                key: payload.key,
                subscription_id: payload.subscriptionId,
                name: "Classes360",
                description: "Admission and Student Management Platform Subscription",
                handler: async (checkoutResponse) => {
                    await dispatch(confirmBillingSubscription(checkoutResponse as unknown as Record<string, unknown>)).unwrap();
                    toast.success(`${planType} plan activated`);
                    await dispatch(fetchBillingDashboard()).unwrap();
                },
                modal: {
                    ondismiss: () => {
                        toast.message("Checkout closed. Complete payment setup to activate trial.");
                    },
                },
            });

            rzp.open();
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? error?.message ?? "Network error");
        }
    };

    const generateInvoice = async () => {
        try {
            await dispatch(generateBillingInvoice()).unwrap();
            toast.success("Invoice generated for last closed month");
            await dispatch(fetchBillingDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? "Unable to generate invoice");
        }
    };

    const retryInvoice = async (invoiceId: string) => {
        try {
            setRetryingInvoiceId(invoiceId);
            await dispatch(retryBillingInvoice(invoiceId)).unwrap();
            toast.success("Invoice retry scheduled");
            await dispatch(fetchBillingDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? "Unable to retry invoice");
        } finally {
            setRetryingInvoiceId(null);
        }
    };

    if (loading) {
        return (
            <main className="p-6 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </main>
        );
    }

    return (
        <main className="p-6 max-w-2xl">
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />
            <h1 className=" text-2xl font-semibold">Billing</h1>
            <p className="mt-1 text-muted-foreground">Manage your subscription and billing.</p>

            {summary?.status === "INACTIVE" ? (
                <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    Trial has expired. Choose a plan below to continue full access.
                </div>
            ) : null}

            {policy && !policy.alertsEnabled ? (
                <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    WhatsApp alerts are currently disabled due to overdue invoice payment.
                </div>
            ) : null}

            {summary?.trialPaymentReminder ? (
                <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                    Trial ends in {summary.trialDaysRemaining ?? 0} day(s). Add payment method now to keep account active on expiry.
                </div>
            ) : null}

            {policy?.notifyPaymentMethodUpdate ? (
                <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Automatic payment retries have failed. Update payment method and retry invoice payment.
                </div>
            ) : null}

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Subscription Plan
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {summary?.planName ?? "Starter System"} — ₹{summary?.planAmount ?? PLAN_CONFIG.STARTER.priceMonthly}/month
                                {summary?.planAmountYearly ? ` · ₹${summary.planAmountYearly}/year` : ""}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className={STATUS_COLORS[summary?.status ?? "TRIAL"] ?? ""}>
                            {summary?.status ?? "TRIAL"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{summary?.status ?? "TRIAL"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Billing cycle</span>
                        <span className="font-medium">{summary?.billingInterval ?? "MONTHLY"} (1st - last day)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Autopay status</span>
                        <span className="font-medium">{summary?.autopayEnabled ? "Enabled" : "Not configured"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">
                            {summary?.usersUsed ?? 0}/{summary?.userLimit === null ? "Unlimited" : (summary?.userLimit ?? 1)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next billing date</span>
                        <span className="font-medium">
                            {summary?.nextBillingDate ? new Date(summary.nextBillingDate).toLocaleDateString() : "Not set"}
                        </span>
                    </div>
                    {summary?.razorpaySubId ? (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Razorpay ID</span>
                            <span className="font-mono text-xs">{summary.razorpaySubId}</span>
                        </div>
                    ) : null}

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last payment</span>
                        <span className="font-medium">
                            {summary?.lastPaymentDate && summary?.lastPaymentAmount
                                ? `${new Date(summary.lastPaymentDate).toLocaleDateString()} • ₹${summary.lastPaymentAmount}`
                                : "No payment history yet"}
                        </span>
                    </div>

                    <div className="grid gap-2 pt-2 sm:grid-cols-3">
                        <Button
                            variant={selectedInterval === "MONTHLY" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => setSelectedInterval("MONTHLY")}
                        >
                            Monthly
                        </Button>
                        <Button
                            variant={selectedInterval === "YEARLY" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => setSelectedInterval("YEARLY")}
                        >
                            Yearly (2 months free)
                        </Button>
                        <Button variant="outline" disabled={generatingInvoice} onClick={() => void generateInvoice()}>
                            {generatingInvoice ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Last Invoice"}
                        </Button>
                    </div>

                    <div className="grid gap-2 pt-2 sm:grid-cols-4">
                        <Button
                            variant={selectedPlan === "STARTER" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => {
                                setSelectedPlan("STARTER");
                                void createSubscription("STARTER");
                            }}
                        >
                            {creating && selectedPlan === "STARTER" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Choose Starter (₹${getDisplayPlanPrice("STARTER")})`}
                        </Button>
                        <Button
                            variant={selectedPlan === "TEAM" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => {
                                setSelectedPlan("TEAM");
                                void createSubscription("TEAM");
                            }}
                        >
                            {creating && selectedPlan === "TEAM" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Choose Team (₹${getDisplayPlanPrice("TEAM")})`}
                        </Button>
                        <Button
                            variant={selectedPlan === "GROWTH" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => {
                                setSelectedPlan("GROWTH");
                                void createSubscription("GROWTH");
                            }}
                        >
                            {creating && selectedPlan === "GROWTH" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Upgrade Growth (₹${getDisplayPlanPrice("GROWTH")})`}
                        </Button>
                        <Button
                            variant={selectedPlan === "SCALE" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => {
                                setSelectedPlan("SCALE");
                                void createSubscription("SCALE");
                            }}
                        >
                            {creating && selectedPlan === "SCALE" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Upgrade Scale (₹${getDisplayPlanPrice("SCALE")})`}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Usage Summary</CardTitle>
                    <CardDescription>Current month WhatsApp activity across system alerts and connected sender mode.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {isUsageWarning ? (
                        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            High WhatsApp activity detected: {usage?.alertsUsed ?? 0} alerts sent this month (volume benchmark: {usageWarningThreshold ?? 0}).
                        </div>
                    ) : null}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Alerts sent</span>
                        <span className="font-medium">{usage?.alertsUsed ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sender mode</span>
                        <span className="font-medium">
                            {sender?.mode === "INSTITUTE_CUSTOM"
                                ? `Institute WhatsApp Number${sender?.connectedNumber ? ` (${sender.connectedNumber})` : ""}`
                                : "Classes360 Shared Number"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">WhatsApp billing</span>
                        <span className="font-medium">Meta charges apply directly to connected institute numbers</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">In plan</span>
                        <span className="font-medium">Classes360 system alerts for institute staff</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>One monthly invoice focused on your subscription plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {invoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No invoices generated yet.</p>
                    ) : (
                        invoices.map((invoice: InvoiceHistoryItem) => (
                            <div key={invoice.id} className="rounded border p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium">
                                        {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                                    </p>
                                    <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "OVERDUE" ? "destructive" : "secondary"}>
                                        {invoice.status}
                                    </Badge>
                                </div>
                                <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                                    <p>Plan: ₹{invoice.planCharge.toFixed(2)}</p>
                                    <p>Usage: ₹{invoice.usageCharge.toFixed(2)}</p>
                                    <p className="font-semibold text-foreground">Total: ₹{invoice.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                    {invoice.paymentLinkUrl ? (
                                        <Button asChild variant="outline" size="sm">
                                            <a href={invoice.paymentLinkUrl} target="_blank" rel="noreferrer">Pay Invoice</a>
                                        </Button>
                                    ) : null}
                                    {invoice.status !== "PAID" ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={retryingInvoice && retryingInvoiceId === invoice.id}
                                            onClick={() => void retryInvoice(invoice.id)}
                                        >
                                            {retryingInvoice && retryingInvoiceId === invoice.id ? "Retrying..." : "Retry Payment"}
                                        </Button>
                                    ) : null}
                                    {invoice.downloadUrl ? (
                                        <Button asChild variant="outline" size="sm">
                                            <a href={invoice.downloadUrl} target="_blank" rel="noreferrer">Download Invoice</a>
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </main>
    );
}

