"use client";

import { useEffect, useMemo, useState } from "react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import ListWidget from "@/components/custom/ListWidget";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchDefaulters } from "@/features/dashboard/dashboardSlice";

type Defaulter = {
    studentId: string;
    studentName: string;
    phone: string;
    courseName: string;
    totalFees: number;
    totalPaid: number;
    pending: number;
    dueDate?: string | null;
};

const PAGE_SIZE = 10;

export default function DefaultersPage() {
    const dispatch = useAppDispatch();
    const defaulters = useAppSelector((state) => state.dashboard.defaulters.data);
    const loading = useAppSelector((state) => state.dashboard.defaulters.loading);
    const [page, setPage] = useState(1);

    useEffect(() => {
        void dispatch(fetchDefaulters());
    }, [dispatch]);

    useEffect(() => {
        setPage(1);
    }, [defaulters.length]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
    const totalPending = defaulters.reduce((sum, item) => sum + item.pending, 0);
    const paginatedDefaulters = defaulters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const columns = useMemo<Column<Defaulter>[]>(() => [
        {
            header: "Sr. No.",
            cell: (_item, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Student",
            type: "text",
            className: "font-medium max-w-[180px] truncate",
            hoverCard: true,
            cell: (item) => item.studentName,
            hoverCardContent: (item) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{item.studentName}</p>
                    <p className="text-muted-foreground">Phone: {item.phone}</p>
                    <p className="text-muted-foreground">Course: {item.courseName}</p>
                    <p className="text-muted-foreground">Pending: {formatCurrency(item.pending)}</p>
                </div>
            ),
            sortValue: (item) => item.studentName,
        },
        {
            header: "Phone",
            accessor: "phone",
        },
        {
            header: "Course",
            type: "text",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (item) => item.courseName,
            tooltipContent: (item) => item.courseName,
            sortValue: (item) => item.courseName,
        },
        {
            header: "Total Fees",
            type: "text",
            className: "text-right",
            cell: (item) => formatCurrency(item.totalFees),
            sortValue: (item) => item.totalFees,
        },
        {
            header: "Paid",
            type: "text",
            className: "text-right text-green-600",
            cell: (item) => formatCurrency(item.totalPaid),
            sortValue: (item) => item.totalPaid,
        },
        {
            header: "Pending",
            type: "text",
            className: "text-right font-medium text-red-600",
            cell: (item) => formatCurrency(item.pending),
            sortValue: (item) => item.pending,
        },
        {
            header: "Due Date",
            type: "date",
            cell: (item) => (item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"),
            sortValue: (item) => item.dueDate || "",
        },
    ], [page]);

    return (
        <ListWidget
            title="Fee Defaulters"
            description={`${defaulters.length} students with pending fees • Total outstanding: ${formatCurrency(totalPending)}`}
            loading={loading}
            isEmpty={!loading && defaulters.length === 0}
            emptyMessage="No fee defaulters. All fees are up to date!"
            footer={
                <TablePaginationControls
                    page={page}
                    pageSize={PAGE_SIZE}
                    totalItems={defaulters.length}
                    onPageChange={setPage}
                />
            }
        >
            <div className="px-6 py-4">
                <p className="mb-4 text-base font-medium">Students with Pending Fees</p>
                <TableWidget columns={columns} data={paginatedDefaulters} rowKey={(item) => item.studentId} />
            </div>
        </ListWidget>
    );
}
