"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import ListWidget from "@/components/custom/ListWidget";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchPayments } from "@/features/dashboard/dashboardSlice";

type PaymentRow = {
    id: string;
    amount: number;
    method?: string | null;
    reference?: string | null;
    paidOn: string;
    student: {
        id: string;
        name: string;
        phone: string;
    };
};

const PAYMENT_METHODS = ["ALL", "CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"] as const;
const PAGE_SIZE = 10;

export default function PaymentsPage() {
    const dispatch = useAppDispatch();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [studentQuery, setStudentQuery] = useState("");
    const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("ALL");
    const [page, setPage] = useState(1);
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (method !== "ALL") params.set("method", method);
        return params.toString();
    }, [from, method, to]);
    const rows = useAppSelector((state) => state.dashboard.payments.data);
    const loading = useAppSelector((state) => state.dashboard.payments.loading);

    useEffect(() => {
        void dispatch(fetchPayments(queryString));
    }, [dispatch, queryString]);

    const filteredRows = useMemo(() => {
        if (!studentQuery.trim()) return rows;
        const query = studentQuery.trim().toLowerCase();
        return rows.filter((row) => row.student.name.toLowerCase().includes(query) || row.student.phone.includes(query));
    }, [rows, studentQuery]);

    useEffect(() => {
        setPage(1);
    }, [studentQuery, method, from, to, rows.length]);

    const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalAmount = filteredRows.reduce((sum, row) => sum + row.amount, 0);

    const columns = useMemo<Column<PaymentRow>[]>(() => [
        {
            header: "Sr. No.",
            cell: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Student",
            type: "text",
            className: "font-medium max-w-[180px] truncate",
            hoverCard: true,
            cell: (row) => row.student.name,
            hoverCardContent: (row) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{row.student.name}</p>
                    <p className="text-muted-foreground">Phone: {row.student.phone}</p>
                    <p className="text-muted-foreground">Method: {row.method || "-"}</p>
                    <p className="text-muted-foreground">Amount: ₹{row.amount.toLocaleString("en-IN")}</p>
                </div>
            ),
            sortValue: (row) => row.student.name,
        },
        {
            header: "Phone",
            cell: (row) => row.student.phone,
            sortValue: (row) => row.student.phone,
        },
        {
            header: "Amount",
            type: "text",
            className: "text-right",
            cell: (row) => `₹${row.amount.toLocaleString("en-IN")}`,
            sortValue: (row) => row.amount,
        },
        {
            header: "Date",
            type: "date",
            cell: (row) => new Date(row.paidOn).toLocaleDateString(),
            sortValue: (row) => row.paidOn,
        },
        {
            header: "Method",
            type: "text",
            className: "max-w-[140px] truncate",
            tooltip: true,
            cell: (row) => row.method || "-",
            tooltipContent: (row) => row.method || "-",
            sortValue: (row) => row.method || "",
        },
        {
            header: "Reference",
            type: "text",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (row) => row.reference || "-",
            tooltipContent: (row) => row.reference || "-",
            sortValue: (row) => row.reference || "",
        },
    ], [page]);

    return (
        <ListWidget
            title="Payments"
            description={`Showing ${filteredRows.length} payments • Total ₹${totalAmount.toLocaleString("en-IN")}`}
            search={studentQuery}
            onSearchChange={setStudentQuery}
            searchPlaceholder="Search student name or phone"
            loading={loading}
            isEmpty={!loading && filteredRows.length === 0}
            emptyMessage="No payments found for selected filters."
            actions={
                <Button variant="outline" onClick={() => void dispatch(fetchPayments(queryString))}>Refresh</Button>
            }
            footer={
                <TablePaginationControls
                    page={page}
                    pageSize={PAGE_SIZE}
                    totalItems={filteredRows.length}
                    onPageChange={setPage}
                />
            }
        >
            <div className="space-y-4 px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                            <Select value={method} onValueChange={(value) => setMethod(value as (typeof PAYMENT_METHODS)[number])}>
                                <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((item) => (
                                        <SelectItem key={item} value={item}>{item === "ALL" ? "All Methods" : item}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <TableWidget columns={columns} data={paginatedRows} rowKey={(row) => row.id} />
            </div>
        </ListWidget>
    );
}
