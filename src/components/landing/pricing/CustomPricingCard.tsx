"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_CONFIG, type PlanType } from "@/config/plans";
import Input from "@/components/ui/input";

const PER_USER_COST = 250; // INR per extra user per month (assumption)
const WHATSAPP_PACK_SIZE = 1000;
const WHATSAPP_PACK_PRICE = 500; // INR per 1000 messages

export default function CustomPricingCard() {
    const plans: PlanType[] = ["STARTER", "TEAM", "GROWTH", "SCALE"];

    const [selectedPlan, setSelectedPlan] = useState<PlanType>("GROWTH");
    const includedUsers = PLAN_CONFIG[selectedPlan].userLimit ?? 0;
    const includedWhatsApp = PLAN_CONFIG[selectedPlan].whatsappMonthlyLimit ?? 0;

    const [users, setUsers] = useState<number>(includedUsers || 1);
    const [messages, setMessages] = useState<number>(includedWhatsApp || 0);
    const [customBase, setCustomBase] = useState<number>(0);

    const basePrice = selectedPlan === "SCALE" ? customBase : PLAN_CONFIG[selectedPlan].priceMonthly;
    const extraUsers = Math.max(0, users - (PLAN_CONFIG[selectedPlan].userLimit ?? users));
    const extraUsersCost = extraUsers * PER_USER_COST;

    const messagesOver = Math.max(0, messages - (PLAN_CONFIG[selectedPlan].whatsappMonthlyLimit ?? 0));
    const packs = Math.ceil(messagesOver / WHATSAPP_PACK_SIZE);
    const whatsappCost = packs * WHATSAPP_PACK_PRICE;

    const total = basePrice + extraUsersCost + whatsappCost;

    return (
        <Card className="rounded-lg border">
            <CardHeader>
                <CardTitle className="text-2xl">Estimate custom pricing</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Quick estimate for extra users and WhatsApp top-ups.</p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Start from plan</span>
                        <select
                            value={selectedPlan}
                            onChange={(e) => {
                                const p = e.target.value as PlanType;
                                setSelectedPlan(p);
                                setUsers(PLAN_CONFIG[p].userLimit ?? 1);
                                setMessages(PLAN_CONFIG[p].whatsappMonthlyLimit ?? 0);
                                setCustomBase(0);
                            }}
                            className="mt-1 rounded-md border px-2 py-1"
                        >
                            {plans.map((p) => (
                                <option key={p} value={p}>{PLAN_CONFIG[p].name}</option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Number of users</span>
                        <Input type="number" min={1} value={users} onChange={(e) => setUsers(Number(e.target.value) || 0)} className="mt-1 rounded-md border px-2 py-1" />
                        <span className="text-xs text-muted-foreground mt-1">Included: {PLAN_CONFIG[selectedPlan].userLimit ?? "Unlimited"}</span>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">WhatsApp messages / month</span>
                        <Input type="number" min={0} value={messages} onChange={(e) => setMessages(Number(e.target.value) || 0)} className="mt-1 rounded-md border px-2 py-1" />
                        <span className="text-xs text-muted-foreground mt-1">Included: {PLAN_CONFIG[selectedPlan].whatsappMonthlyLimit ?? "Pay-as-you-go"}</span>
                    </label>
                </div>

                {selectedPlan === "SCALE" ? (
                    <div className="space-y-1">
                        <label className="flex flex-col">
                            <span className="text-xs font-medium text-muted-foreground">Base monthly (enter your expected base)</span>
                            <Input type="number" min={0} value={customBase} onChange={(e) => setCustomBase(Number(e.target.value) || 0)} className="mt-1 rounded-md border px-2 py-1" />
                        </label>
                        <p className="text-xs text-muted-foreground">Enterprise is custom—enter an initial base or contact sales for a quote.</p>
                    </div>
                ) : null}

                <div className="rounded-md bg-muted/10 p-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Base price</div>
                        <div className="font-medium">INR {basePrice.toLocaleString("en-IN")}{selectedPlan !== "SCALE" ? "/month" : ""}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="text-sm text-muted-foreground">Extra users ({extraUsers})</div>
                        <div className="font-medium">INR {extraUsersCost.toLocaleString("en-IN")}/month</div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="text-sm text-muted-foreground">WhatsApp top-ups</div>
                        <div className="font-medium">INR {whatsappCost.toLocaleString("en-IN")}/month</div>
                    </div>

                    <div className="flex items-center justify-between mt-3 border-t pt-3">
                        <div className="text-sm font-semibold">Estimated monthly total</div>
                        <div className="text-lg font-semibold">INR {total.toLocaleString("en-IN")}</div>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <div className="w-full grid gap-2 sm:grid-cols-2">
                    <Button className="h-11">Contact Sales</Button>
                    <Button variant="secondary" className="h-11">Save estimate</Button>
                </div>
            </CardFooter>
        </Card>
    );
}
