"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, IndianRupee, AlertTriangle, GraduationCap, UserPlus, Users } from "lucide-react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import MetricCard from "@/components/layout/dashboard/MetricCard";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchOverview, postAnnouncement } from "@/features/dashboard/dashboardSlice";

type Metrics = {
    leadsThisMonth: number;
    admissionsThisMonth: number;
    totalStudents: number;
    conversionPercentage: number;
    totalFeesCollectedThisMonth: number;
    totalOutstandingFees: number;
    todayOverview?: {
        newLeads: number;
        feesCollected: number;
        feesDueToday: number;
        newStudents: number;
    };
    recentLeads?: Array<{ id: string; name: string; phone: string; status: string; createdAt: string }>;
    recentPayments?: Array<{ id: string; amount: number; method?: string | null; paidOn: string; student: { name: string; phone: string } }>;
    followUpOverview?: {
        todayCount: number;
        overdueCount: number;
        todaysFollowUps: Array<{ id: string; name: string; phone: string; followUpAt?: string | null; status: string }>;
        overdueFollowUps: Array<{ id: string; name: string; phone: string; followUpAt?: string | null; status: string }>;
    };
};

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

export default function DashboardHome() {
    // Component implementation
    return <div>Dashboard Overview</div>;
}
