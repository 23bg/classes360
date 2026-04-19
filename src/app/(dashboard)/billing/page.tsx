"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, CreditCard, Globe2, Loader2, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPlanPricing, PLAN_CONFIG, PlanType, PricingVersion } from "@/config/plans";
import type { BillingInterval } from "@/features/subscription/subscriptionApi";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
    confirmBillingSubscription,
    createBillingSubscription,
    fetchBillingDashboard,
    generateBillingInvoice,
    retryBillingInvoice,
} from "@/features/dashboard/dashboardSlice";

type CheckoutProvider = "RAZORPAY" | "STRIPE";

type BillingCheckoutSession = {
    provider: CheckoutProvider;
    region: "IN" | "GLOBAL" | "UNKNOWN";
    checkoutMode: "subscription" | "payment";
    planType: string;
    interval: string;
    currency: string;
    amount: number;
    taxes: number;
    totalAmount: number;
    couponCode?: string | null;
    couponOriginalAmount?: number | null;
    couponDiscount?: number | null;
    couponFinalAmount?: number | null;
    checkoutSessionId?: string | null;
    providerSubscriptionId?: string | null;
    providerPaymentId?: string | null;
    providerPaymentLinkId?: string | null;
    checkoutUrl?: string | null;
    clientSecret?: string | null;
    publishableKey?: string | null;
    paymentMethods: Array<"CARD" | "UPI" | "NETBANKING" | "APPLE_PAY" | "GOOGLE_PAY" | "PAYPAL">;
    redirectRequired: boolean;
    regionLabel: string;
};

const INTERNATIONAL_PRICING_USD: Record<PlanType, { monthly: number; yearly: number }> = {
    STARTER: { monthly: 12, yearly: 120 },
    TEAM: { monthly: 24, yearly: 240 },
    GROWTH: { monthly: 42, yearly: 420 },
    SCALE: { monthly: 60, yearly: 600 },
};

const PROVIDER_METHODS: Record<CheckoutProvider, Array<{ label: string; description: string }>> = {
    RAZORPAY: [
        { label: "Card", description: "Visa, Mastercard, RuPay" },
        { label: "UPI", description: "Google Pay, PhonePe, Paytm" },
        { label: "Netbanking", description: "All major Indian banks" },
    ],
    STRIPE: [
        { label: "Card", description: "Visa, Mastercard, AmEx" },
        { label: "Apple Pay", description: "One-tap on supported devices" },
        { label: "Google Pay", description: "Fast wallet checkout" },
    ],
};

const STATUS_COLORS: Record<string, string> = {
    TRIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PAST_DUE: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    INACTIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const getCurrencySymbol = (currency: string) => (currency === "USD" ? "$" : "₹");

const formatMoney = (amount: number, currency: string) =>
    currency === "USD"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
        : new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

const getQuotedPrice = (planType: PlanType, interval: BillingInterval, currency: string, pricingVersion: PricingVersion) => {
    if (currency === "USD") {
        return INTERNATIONAL_PRICING_USD[planType][interval === "YEARLY" ? "yearly" : "monthly"];
    }

    const pricing = getPlanPricing(planType, { version: pricingVersion });
    return interval === "YEARLY" ? pricing.yearly : pricing.monthly;
};

export default function BillingPage() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const billingData = useAppSelector((state) => state.dashboard.billing.data);
    const loading = useAppSelector((state) => state.dashboard.billing.loading);
    const creating = useAppSelector((state) => state.dashboard.billing.subscription.loading);
    const generatingInvoice = useAppSelector((state) => state.dashboard.billing.invoice.loading);
    const retryingInvoice = useAppSelector((state) => state.dashboard.billing.retry.loading);
    const confirming = useAppSelector((state) => state.dashboard.billing.confirm.loading);
    const summary = billingData?.summary ?? null;
    const usage = billingData?.usage ?? null;
    const invoices = billingData?.invoices ?? [];
    const policy = billingData?.policy ?? null;
    const checkoutContext = billingData?.checkout ?? null;
    const billingContact = billingData?.billingContact ?? null;
    const institute = billingData?.institute ?? null;
    const [selectedPlan, setSelectedPlan] = useState<PlanType>("STARTER");
    const [selectedInterval, setSelectedInterval] = useState<BillingInterval>("MONTHLY");
    const [selectedProvider, setSelectedProvider] = useState<CheckoutProvider | null>(null);
    const [checkoutState, setCheckoutState] = useState<{ status: "idle" | "opening" | "pending" | "success" | "error"; message?: string }>({
        status: "idle",
    });
    const [retryingInvoiceId, setRetryingInvoiceId] = useState<string | null>(null);
    const [manualRecoveryHandled, setManualRecoveryHandled] = useState(false);
    const [couponVisible, setCouponVisible] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponResult, setCouponResult] = useState<{
        code: string;
        discount: number;
        finalAmount: number;
        originalAmount: number;
        message: string;
    } | null>(null);

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

    useEffect(() => {
        if (checkoutContext?.recommendedProvider) {
            setSelectedProvider(checkoutContext.recommendedProvider);
        }
    }, [checkoutContext?.recommendedProvider]);

    const selectedPricingVersion: PricingVersion = (summary?.pricingVersion as PricingVersion | undefined) ?? "CURRENT";
    const quoteCurrency = checkoutContext?.currency ?? (selectedProvider === "STRIPE" ? "USD" : "INR");

    useEffect(() => {
        setCouponResult(null);
        setCouponError(null);
        setCouponCode("");
        setCouponVisible(false);
    }, [selectedPlan, selectedInterval, quoteCurrency]);

    const quotedPrice = useMemo(
        () => getQuotedPrice(selectedPlan, selectedInterval, quoteCurrency, selectedPricingVersion),
        [quoteCurrency, selectedInterval, selectedPlan, selectedPricingVersion]
    );
    const quoteTax = useMemo(() => (checkoutContext?.taxRate ?? 0) * quotedPrice, [checkoutContext?.taxRate, quotedPrice]);
    const quoteTotal = quotedPrice + quoteTax;
    const billingMethods = PROVIDER_METHODS[(selectedProvider ?? checkoutContext?.provider ?? "RAZORPAY") as CheckoutProvider];
    const isBusy = creating || confirming || retryingInvoice || checkoutState.status === "opening";

    const openCheckout = async (session: BillingCheckoutSession) => {
        setCheckoutState({ status: "opening", message: "Launching secure checkout..." });

        if (session.provider === "STRIPE") {
            if (session.checkoutUrl) {
                window.location.assign(session.checkoutUrl);
                return;
            }

            throw new Error("Stripe checkout URL missing");
        }

        const RazorpayCtor = (window as unknown as { Razorpay?: new (options: any) => { open: () => void } }).Razorpay;
        if (!RazorpayCtor) {
            throw new Error("Razorpay SDK not loaded");
        }

        const checkout = new RazorpayCtor({
            key: session.publishableKey,
            subscription_id: session.providerSubscriptionId,
            name: institute?.name ?? "Classes360",
            description: `${selectedPlan} ${selectedInterval.toLowerCase()} subscription`,
            handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
                setCheckoutState({ status: "pending", message: "Verifying payment with provider..." });
                try {
                    const result = await dispatch(
                        confirmBillingSubscription({
                            provider: "RAZORPAY",
                            ...response,
                        })
                    ).unwrap();

                    if (result?.verified === false) {
                        setCheckoutState({ status: "pending", message: "Payment received. Waiting for confirmation..." });
                        return;
                    }

                    setCheckoutState({ status: "success", message: "Payment verified and subscription activated." });
                    toast.success("Subscription activated");
                    await dispatch(fetchBillingDashboard()).unwrap();
                } catch (error: any) {
                    setCheckoutState({ status: "error", message: error?.data?.error?.message ?? error?.message ?? "Verification failed" });
                    toast.error(error?.data?.error?.message ?? "Unable to verify payment");
                }
            },
            modal: {
                ondismiss: () => {
                    setCheckoutState({ status: "idle", message: "Checkout closed. You can retry payment any time." });
                    toast.message("Checkout closed");
                },
            },
        });

        checkout.open();
    };

    const startCheckout = async (payload: { planType: PlanType; interval: BillingInterval; provider?: CheckoutProvider | null; invoiceId?: string | null }) => {
        try {
            setCheckoutState({ status: "opening", message: "Preparing checkout session..." });
            const session = payload.invoiceId
                ? await dispatch(retryBillingInvoice(payload.invoiceId)).unwrap()
                : await dispatch(
                    createBillingSubscription({
                        planType: payload.planType,
                        interval: payload.interval,
                        provider: payload.provider ?? undefined,
                        couponCode: couponResult?.code ?? undefined,
                    })
                ).unwrap();

            if (!session?.provider) {
                throw new Error("Missing checkout session");
            }

            await openCheckout(session as BillingCheckoutSession);
        } catch (error: any) {
            setCheckoutState({ status: "error", message: error?.data?.error?.message ?? error?.message ?? "Unable to start checkout" });
            toast.error(error?.data?.error?.message ?? error?.message ?? "Unable to start checkout");
        }
    };

    const applyCouponCode = async () => {
        if (!couponCode.trim()) {
            setCouponError("Enter a coupon code to apply.");
            return;
        }

        setCouponError(null);
        try {
            const response = await api.post<{ success: boolean; data?: { valid: boolean; discount: number; finalAmount: number; originalAmount: number; coupon: { code: string } }; error?: { message: string } }>(
                API.INTERNAL.BILLING.APPLY_COUPON,
                {
                    code: couponCode,
                    planType: selectedPlan,
                    interval: selectedInterval,
                    currency: quoteCurrency,
                }
            );

            if (!response.data?.success || !response.data.data?.valid) {
                setCouponResult(null);
                setCouponError(response.data?.error?.message ?? "Coupon is not valid.");
                return;
            }

            const payload = response.data.data;
            setCouponResult({
                code: payload.coupon.code,
                discount: payload.discount,
                finalAmount: payload.finalAmount,
                originalAmount: payload.originalAmount,
                message: "Coupon applied successfully.",
            });
            toast.success("Coupon applied.");
        } catch (error: any) {
            setCouponResult(null);
            setCouponError(error?.response?.data?.error?.message ?? error?.message ?? "Unable to apply coupon.");
            toast.error(error?.response?.data?.error?.message ?? error?.message ?? "Unable to apply coupon.");
        }
    };

    const retryStripeConfirmation = async (sessionId?: string | null) => {
        if (!sessionId) {
            return;
        }

        setCheckoutState({ status: "pending", message: "Checking payment status..." });
        try {
            const result = await dispatch(
                confirmBillingSubscription({
                    provider: "STRIPE",
                    checkout_session_id: sessionId,
                })
            ).unwrap();

            if (result?.verified) {
                setCheckoutState({ status: "success", message: "Payment verified and subscription activated." });
                toast.success("Payment confirmed");
                await dispatch(fetchBillingDashboard()).unwrap();
                return;
            }

            setCheckoutState({ status: "pending", message: "Payment is still processing. We will refresh once the webhook lands." });
            await dispatch(fetchBillingDashboard()).unwrap();
        } catch (error: any) {
            setCheckoutState({ status: "error", message: error?.data?.error?.message ?? error?.message ?? "Unable to confirm payment" });
            toast.error(error?.data?.error?.message ?? "Unable to confirm payment");
        }
    };

    useEffect(() => {
        const checkoutStatus = searchParams.get("checkout");
        const sessionId = searchParams.get("session_id");

        if (checkoutStatus === "cancelled") {
            toast.message("Checkout cancelled. You can continue from the billing page.");
        }

        if (checkoutStatus === "success" && sessionId && !manualRecoveryHandled) {
            setManualRecoveryHandled(true);
            void retryStripeConfirmation(sessionId);
        }
    }, [manualRecoveryHandled, searchParams]);

    const methodLabels = billingMethods.map((method) => method.label).join(" · ");
    const orderPlanPrice = selectedProvider === "STRIPE"
        ? INTERNATIONAL_PRICING_USD[selectedPlan][selectedInterval === "YEARLY" ? "yearly" : "monthly"]
        : getPlanPricing(selectedPlan, { version: selectedPricingVersion })[selectedInterval === "YEARLY" ? "yearly" : "monthly"];
    const orderTaxAmount = orderPlanPrice * (checkoutContext?.taxRate ?? 0);
    const orderTotal = orderPlanPrice + orderTaxAmount;
    const couponSubtotal = couponResult?.finalAmount ?? orderPlanPrice;
    const couponTaxAmount = couponResult ? couponSubtotal * (checkoutContext?.taxRate ?? 0) : orderTaxAmount;
    const couponTotal = couponSubtotal + couponTaxAmount;

    if (loading) {
        return (
            <main className="flex min-h-[50vh] items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl space-y-6 p-6">
            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

            <section className="rounded-3xl border bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-3">
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                            Secure billing
                        </Badge>
                        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Billing</h1>
                        <p className="max-w-xl text-sm text-white/75 md:text-base">
                            A provider-aware checkout for India and international institutes, with real verification, recovery, and subscription tracking.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 lg:w-md">
                        <Button variant="secondary" onClick={() => void generateBillingInvoice()} disabled={generatingInvoice || isBusy}>
                            {generatingInvoice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Generate invoice
                        </Button>
                        <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
                            <a href="#invoice-history">Invoice history</a>
                        </Button>
                        <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
                            <a href="#checkout">Checkout</a>
                        </Button>
                    </div>
                </div>
            </section>

            {summary?.status === "INACTIVE" ? (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    Trial has expired. Select a plan to restore access.
                </div>
            ) : null}

            {checkoutState.status === "success" ? (
                <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                    {checkoutState.message ?? "Payment verified."}
                </div>
            ) : null}

            {checkoutState.status === "pending" ? (
                <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    {checkoutState.message ?? "Payment is processing."}
                    <Button variant="link" className="ml-2 p-0 text-amber-900 dark:text-amber-100" onClick={() => void dispatch(fetchBillingDashboard())}>
                        Refresh status
                    </Button>
                </div>
            ) : null}

            {checkoutState.status === "error" ? (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    {checkoutState.message ?? "Checkout failed."}
                    <Button variant="link" className="ml-2 p-0 text-red-800 dark:text-red-100" onClick={() => setCheckoutState({ status: "idle" })}>
                        Dismiss
                    </Button>
                </div>
            ) : null}

            <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex rounded-full border bg-background p-1 shadow-sm">
                        {(Object.keys(PLAN_CONFIG) as PlanType[]).map((planType) => (
                            <button
                                key={planType}
                                type="button"
                                disabled={isBusy}
                                onClick={() => setSelectedPlan(planType)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedPlan === planType ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {PLAN_CONFIG[planType].name}
                            </button>
                        ))}
                    </div>

                    <div className="inline-flex rounded-full border bg-background p-1 shadow-sm">
                        {(["MONTHLY", "YEARLY"] as BillingInterval[]).map((interval) => (
                            <button
                                key={interval}
                                type="button"
                                disabled={isBusy}
                                onClick={() => setSelectedInterval(interval)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedInterval === interval ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {interval === "YEARLY" ? "Yearly" : "Monthly"}
                            </button>
                        ))}
                    </div>

                    <Badge variant="outline" className="gap-1.5">
                        <Globe2 className="h-3.5 w-3.5" />
                        {checkoutContext?.regionLabel ?? "Region auto-detected"}
                    </Badge>
                </div>

                {checkoutContext?.region === "UNKNOWN" ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
                        <span className="font-medium text-foreground">Auto routing failed:</span>
                        <span className="text-muted-foreground">choose a provider manually.</span>
                        {(["RAZORPAY", "STRIPE"] as CheckoutProvider[]).map((provider) => (
                            <Button
                                key={provider}
                                variant={selectedProvider === provider ? "default" : "outline"}
                                size="sm"
                                disabled={isBusy}
                                onClick={() => setSelectedProvider(provider)}
                            >
                                {provider === "RAZORPAY" ? "Razorpay" : "Stripe"}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </section>

            <Card id="checkout" className="overflow-hidden border-slate-200/80 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Checkout</CardTitle>
                            <CardDescription>
                                {selectedProvider === "STRIPE" ? "Stripe checkout for international cards and wallets." : "Razorpay checkout for India with UPI and card support."}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="w-fit">
                            {selectedProvider === "STRIPE" ? "Stripe" : "Razorpay"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_1.1fr_1fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border bg-background p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                <BadgeCheck className="h-4 w-4" /> Billing info
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium text-right">{billingContact?.name ?? institute?.name ?? "Billing contact"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium text-right">{billingContact?.email ?? "From your workspace session"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">Institute</span>
                                    <span className="font-medium text-right">{institute?.name ?? "-"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">Country</span>
                                    <span className="font-medium text-right">{institute?.country ?? checkoutContext?.country ?? "Not set"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">Currency</span>
                                    <span className="font-medium text-right">{quoteCurrency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-background p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" /> Security
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Frontend actions are locked during checkout, payment verification happens on the backend, and every webhook is recorded for replay-safe processing.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border bg-background p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                <Wallet className="h-4 w-4" /> Payment methods
                            </div>
                            <div className="mt-4 grid gap-3">
                                {billingMethods.map((method) => (
                                    <div key={method.label} className="rounded-xl border px-4 py-3 transition hover:border-primary/40 hover:bg-primary/5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium">{method.label}</span>
                                            <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                                                {selectedProvider === "STRIPE" ? "Stripe" : "Razorpay"}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{method.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-background p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                <Sparkles className="h-4 w-4" /> Recovery
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                If confirmation fails after a successful payment, the checkout can be re-checked from the return screen or retried from the invoice history below.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border bg-slate-950 p-5 text-white shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-white/70">Order summary</p>
                                    <h3 className="mt-1 text-xl font-semibold">{PLAN_CONFIG[selectedPlan].name}</h3>
                                </div>
                                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                                    {checkoutContext?.provider ?? selectedProvider ?? "Razorpay"}
                                </Badge>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white/90 shadow-sm">
                                {couponVisible ? (
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <Input
                                                type="text"
                                                value={couponCode}
                                                onChange={(event) => setCouponCode(event.target.value)}
                                                placeholder="Enter coupon code"
                                                className="w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                            <Button size="sm" onClick={applyCouponCode} disabled={!couponCode.trim() || isBusy}>
                                                Apply
                                            </Button>
                                        </div>
                                        {couponError ? <p className="text-sm text-red-300">{couponError}</p> : null}
                                        {couponResult ? (
                                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                                                <p className="font-medium">Coupon applied: {couponResult.code}</p>
                                                <p>{couponResult.message}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-white/80 hover:text-white"
                                        onClick={() => setCouponVisible(true)}
                                    >
                                        Have a code?
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/65">Billing cycle</span>
                                    <span className="font-medium">{selectedInterval === "YEARLY" ? "Yearly" : "Monthly"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/65">Plan price</span>
                                    <span className="font-medium">{formatMoney(orderPlanPrice, quoteCurrency)}</span>
                                </div>
                                {couponResult ? (
                                    <div className="flex items-center justify-between text-emerald-200">
                                        <span className="text-white/80">Discount ({couponResult.code})</span>
                                        <span className="font-medium">-{formatMoney(couponResult.discount, quoteCurrency)}</span>
                                    </div>
                                ) : null}
                                <div className="flex items-center justify-between">
                                    <span className="text-white/65">Taxes</span>
                                    <span className="font-medium">{formatMoney(couponTaxAmount, quoteCurrency)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base">
                                    <span className="font-medium">Total</span>
                                    <span className="font-semibold">{formatMoney(couponTotal, quoteCurrency)}</span>
                                </div>
                            </div>

                            <Button
                                className="mt-6 w-full bg-white text-slate-950 hover:bg-white/90"
                                size="lg"
                                disabled={isBusy}
                                onClick={() => void startCheckout({ planType: selectedPlan, interval: selectedInterval, provider: selectedProvider ?? checkoutContext?.provider ?? null })}
                            >
                                {creating || checkoutState.status === "opening" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                {selectedProvider === "STRIPE" ? "Continue with Stripe" : "Pay with Razorpay"}
                            </Button>

                            <p className="mt-3 text-xs text-white/60">
                                {methodLabels}. Your subscription activates only after server-side verification.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-muted/30 shadow-none">
                <CardHeader>
                    <CardTitle>Plan controls</CardTitle>
                    <CardDescription>Choose the subscription tier that matches your team size and billing rhythm.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-4">
                    {(Object.keys(PLAN_CONFIG) as PlanType[]).map((planType) => (
                        <Button
                            key={planType}
                            variant={selectedPlan === planType ? "default" : "outline"}
                            disabled={isBusy}
                            onClick={() => setSelectedPlan(planType)}
                            className="justify-between"
                        >
                            <span>{PLAN_CONFIG[planType].name}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ))}
                </CardContent>
            </Card>

            {summary?.status === "ACTIVE" ? (
                <Card className="border-green-200 bg-green-50 shadow-none dark:border-green-900 dark:bg-green-950/30">
                    <CardHeader>
                        <CardTitle className="text-green-900 dark:text-green-100">Subscription active</CardTitle>
                        <CardDescription className="text-green-800/80 dark:text-green-100/70">
                            Your account is verified and ready. Future renewals will continue to flow through the provider webhook ledger.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : null}

            <Card id="invoice-history" className="shadow-sm">
                <CardHeader>
                    <CardTitle>Invoice history</CardTitle>
                    <CardDescription>Monthly invoice trail with retry actions that open a real payment flow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {invoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No invoices generated yet.</p>
                    ) : (
                        invoices.map((invoice: {
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
                            couponCode?: string | null;
                            discountAmount?: number | null;
                            originalAmount?: number | null;
                        }) => (
                            <div key={invoice.id} className="rounded-2xl border bg-background p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{invoice.status}</p>
                                    </div>
                                    <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "OVERDUE" ? "destructive" : "secondary"}>
                                        {invoice.status}
                                    </Badge>
                                </div>

                                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                                    <p>Plan: {formatMoney(invoice.planCharge, quoteCurrency)}</p>
                                    <p>Usage: {formatMoney(invoice.usageCharge, quoteCurrency)}</p>
                                    <p className="font-semibold text-foreground">Total: {formatMoney(invoice.totalAmount, quoteCurrency)}</p>
                                </div>
                                {invoice.discountAmount ? (
                                    <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-900/10 dark:text-emerald-100">
                                        <p className="font-medium">Coupon: {invoice.couponCode}</p>
                                        <p>Discount: {formatMoney(invoice.discountAmount, quoteCurrency)}</p>
                                        {invoice.originalAmount != null ? (
                                            <p>Subtotal: {formatMoney(invoice.originalAmount, quoteCurrency)}</p>
                                        ) : null}
                                    </div>
                                ) : null}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {invoice.paymentLinkUrl ? (
                                        <Button asChild variant="outline" size="sm">
                                            <a href={invoice.paymentLinkUrl} target="_blank" rel="noreferrer">
                                                Open payment link
                                            </a>
                                        </Button>
                                    ) : null}

                                    {invoice.status !== "PAID" ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={retryingInvoice && retryingInvoiceId === invoice.id}
                                            onClick={() => {
                                                setRetryingInvoiceId(invoice.id);
                                                void startCheckout({
                                                    planType: selectedPlan,
                                                    interval: selectedInterval,
                                                    provider: selectedProvider ?? checkoutContext?.provider ?? null,
                                                    invoiceId: invoice.id,
                                                }).finally(() => setRetryingInvoiceId(null));
                                            }}
                                        >
                                            {retryingInvoice && retryingInvoiceId === invoice.id ? "Preparing..." : "Retry payment"}
                                        </Button>
                                    ) : null}

                                    {invoice.downloadUrl ? (
                                        <Button asChild variant="outline" size="sm">
                                            <a href={invoice.downloadUrl} target="_blank" rel="noreferrer">
                                                Download invoice
                                            </a>
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {checkoutState.status === "pending" && searchParams.get("session_id") ? (
                <Card className="border-amber-200 bg-amber-50 shadow-none dark:border-amber-900 dark:bg-amber-950/30">
                    <CardHeader>
                        <CardTitle className="text-amber-900 dark:text-amber-100">Waiting for provider confirmation</CardTitle>
                        <CardDescription className="text-amber-800/80 dark:text-amber-100/70">
                            The payment was completed, but the backend confirmation is still catching up. You can refresh the billing dashboard or wait for the webhook.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => void dispatch(fetchBillingDashboard())}>
                            Refresh dashboard
                        </Button>
                    </CardContent>
                </Card>
            ) : null}
        </main>
    );
}
