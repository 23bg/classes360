"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, IndianRupee, CheckCircle2, Clock } from "lucide-react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
    addFeePlanPayment,
    deleteFeePlan,
    fetchFeePlanPayments,
    fetchFeesDashboard,
    saveFeePlan,
} from "@/features/dashboard/dashboardSlice";

type Student = { id: string; name: string; phone: string };
type FeePlan = {
    id: string;
    studentId: string;
    totalAmount: number;
    dueDate?: string | null;
    createdAt: string;
};
type Payment = {
    id: string;
    feePlanId: string;
    amount: number;
    status: "PENDING" | "PAID" | "OVERDUE";
    paidOn?: string | null;
    note?: string | null;
};

const PAGE_SIZE = 10;

export default function FeesPage() {
    const dispatch = useAppDispatch();
    const feesState = useAppSelector((state) => state.dashboard.fees.data);
    const loading = useAppSelector((state) => state.dashboard.fees.loading);
    const savingPlan = useAppSelector((state) => state.dashboard.fees.planMutation.loading);
    const savingPayment = useAppSelector((state) => state.dashboard.fees.paymentMutation.loading);
    const students = feesState?.students ?? [];
    const plans = feesState?.plans ?? [];

    // Plan dialog
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [planForm, setPlanForm] = useState({ studentId: "", totalAmount: "", dueDate: "" });

    // Payment view
    const [selectedPlan, setSelectedPlan] = useState<FeePlan | null>(null);
    const payments = useAppSelector((state) => state.dashboard.fees.payments.data);
    const [paymentPage, setPaymentPage] = useState(1);

    // Add Payment dialog
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ amount: "", date: "", note: "", method: "CASH", reference: "" });

    useEffect(() => {
        void dispatch(fetchFeesDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedPlan?.id) return;
        void dispatch(fetchFeePlanPayments(selectedPlan.id));
    }, [dispatch, selectedPlan?.id]);

    const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

    // Create fee plan
    const savePlan = async () => {
        if (!planForm.studentId || !planForm.totalAmount) {
            toast.error("Student and total amount are required");
            return;
        }
        try {
            const body: Record<string, unknown> = {
                studentId: planForm.studentId,
                totalAmount: parseFloat(planForm.totalAmount),
            };
            if (planForm.dueDate) body.dueDate = planForm.dueDate;

            await dispatch(saveFeePlan(body)).unwrap();
            toast.success("Fee plan created");
            setPlanDialogOpen(false);
            setPlanForm({ studentId: "", totalAmount: "", dueDate: "" });
            await dispatch(fetchFeesDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    // Delete fee plan
    const deletePlan = async (planId: string) => {
        try {
            await dispatch(deleteFeePlan(planId)).unwrap();
            toast.success("Fee plan deleted");
            if (selectedPlan?.id === planId) {
                setSelectedPlan(null);
            }
            await dispatch(fetchFeesDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    // Load payments for a plan
    const viewPayments = async (plan: FeePlan) => {
        setSelectedPlan(plan);
    };

    // Add Payment (simple: amount, date, note — always PAID)
    const savePayment = async () => {
        if (!paymentForm.amount || !selectedPlan) {
            toast.error("Amount is required");
            return;
        }
        try {
            const body: Record<string, unknown> = {
                amount: parseFloat(paymentForm.amount),
                method: paymentForm.method,
            };
            if (paymentForm.date) body.date = paymentForm.date;
            if (paymentForm.note.trim()) body.note = paymentForm.note.trim();
            if (paymentForm.reference.trim()) body.reference = paymentForm.reference.trim();

            await dispatch(addFeePlanPayment({ planId: selectedPlan.id, body })).unwrap();
            toast.success(`Payment saved: ₹${parseFloat(paymentForm.amount).toLocaleString("en-IN")}`);
            setPaymentDialogOpen(false);
            setPaymentForm({ amount: "", date: "", note: "", method: "CASH", reference: "" });
            setSelectedPlan({ ...selectedPlan });
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

    const paidTotal = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
    const pendingTotal = selectedPlan ? Math.max(0, selectedPlan.totalAmount - paidTotal) : 0;
    const paginatedPayments = payments.slice((paymentPage - 1) * PAGE_SIZE, paymentPage * PAGE_SIZE);

    const paymentColumns = useMemo<Column<Payment>[]>(() => [
        {
            header: "Sr. No.",
            cell: (_payment, index) => (paymentPage - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Amount",
            className: "font-medium",
            cell: (payment) => formatCurrency(payment.amount),
        },
        {
            header: "Date",
            cell: (payment) => payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : "-",
        },
        {
            header: "Note",
            className: "max-w-60 truncate text-muted-foreground text-sm",
            cell: (payment) => <span title={payment.note || "-"}>{payment.note || "-"}</span>,
        },
    ], [paymentPage]);

    useEffect(() => {
        setPaymentPage(1);
    }, [selectedPlan?.id, payments.length]);

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className=" text-2xl font-semibold flex items-center gap-2">
                        <IndianRupee className="h-6 w-6" /> Fee Management
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">{plans.length} fee plans</p>
                </div>
                <Button onClick={() => setPlanDialogOpen(true)} disabled={students.length === 0}>
                    <Plus className="mr-2 h-4 w-4" /> Create Fee Plan
                </Button>
            </div>

            {students.length === 0 && !loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Add students first before creating fee plans.</p>
            ) : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Fee Plans List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Fee Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : plans.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No fee plans yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {plans.map((plan) => {
                                    const student = studentMap[plan.studentId];
                                    return (
                                        <div
                                            key={plan.id}
                                            onClick={() => viewPayments(plan)}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${selectedPlan?.id === plan.id ? "border-primary bg-muted/50" : ""}`}
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{student?.name ?? "Unknown"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(plan.totalAmount)}
                                                    {plan.dueDate ? ` • Due ${new Date(plan.dueDate).toLocaleDateString()}` : ""}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}>
                                                <span className="text-xs text-destructive">Delete</span>
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payments Panel */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">
                            {selectedPlan ? `Payments — ${studentMap[selectedPlan.studentId]?.name ?? "Student"}` : "Select a fee plan"}
                        </CardTitle>
                        {selectedPlan ? (
                            <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
                                <Plus className="mr-1 h-3 w-3" /> Add Payment
                            </Button>
                        ) : null}
                    </CardHeader>
                    <CardContent>
                        {!selectedPlan ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Click a fee plan to view payments.</p>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground">No payments yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total Fees: {formatCurrency(selectedPlan.totalAmount)} • Pending: {formatCurrency(pendingTotal)}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Summary */}
                                <div className="flex gap-4 mb-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span>Paid: {formatCurrency(paidTotal)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        <span>Pending: {formatCurrency(pendingTotal)}</span>
                                    </div>
                                </div>

                                <TableWidget columns={paymentColumns} data={paginatedPayments} rowKey={(payment) => payment.id} />
                                <TablePaginationControls
                                    className="mt-3"
                                    page={paymentPage}
                                    pageSize={PAGE_SIZE}
                                    totalItems={payments.length}
                                    onPageChange={setPaymentPage}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Fee Plan Dialog */}
            <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Fee Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Student *</Label>
                            <Select value={planForm.studentId} onValueChange={(v) => setPlanForm({ ...planForm, studentId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} — {s.phone}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Total Amount (₹) *</Label>
                            <Input type="number" value={planForm.totalAmount} onChange={(e) => setPlanForm({ ...planForm, totalAmount: e.target.value })} placeholder="e.g. 50000" />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={planForm.dueDate} onChange={(e) => setPlanForm({ ...planForm, dueDate: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
                        <Button onClick={savePlan} disabled={savingPlan}>
                            {savingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Amount (₹) *</Label>
                            <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="e.g. 10000" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
                            <p className="text-xs text-muted-foreground">Defaults to today if left empty</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}>
                                <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Reference</Label>
                            <Input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="Txn ID / receipt no. (optional)" maxLength={120} />
                        </div>
                        <div className="space-y-2">
                            <Label>Note</Label>
                            <Textarea value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} placeholder="e.g. Cash payment, UPI, Cheque #123" rows={2} maxLength={1024} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={savePayment} disabled={savingPayment}>
                            {savingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Add Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
