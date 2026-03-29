"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { MoreHorizontal } from "lucide-react";

export type TeamRow = {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: "OWNER" | "MANAGER" | "COUNSELOR" | "TEACHER" | "VIEWER";
    active: boolean;
    subjects?: string;
    experience?: string;
    bio?: string;
    source: "team" | "teacher";
};

type TeamTableProps = {
    rows: TeamRow[];
    canManage: boolean;
    onEdit: (member: TeamRow) => void;
    onDelete: (member: TeamRow) => void;
};

const PAGE_SIZE = 10;

export default function TeamTable({ rows, canManage, onEdit, onDelete }: TeamTableProps) {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [rows.length]);

    const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const displayRole = (role: TeamRow["role"]) => {
        if (role === "MANAGER") return "EDITOR";
        if (role === "COUNSELOR") return "EDITOR";
        return role;
    };

    const columns: Column<TeamRow>[] = [
        {
            header: "Sr. No.",
            cell: (_member, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Name",
            className: "font-medium",
            accessor: "name",
            hoverCard: true,
            hoverCardContent: (member) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-muted-foreground">Email: {member.email || "-"}</p>
                    <p className="text-muted-foreground">Role: {displayRole(member.role)}</p>
                    <p className="text-muted-foreground">Subjects: {member.subjects || "-"}</p>
                </div>
            ),
            sortable: true,
        },
        {
            header: "Phone",
            accessor: "phone",
            cell: (member) => member.phone || "-",
        },
        {
            header: "Email",
            tooltip: true,
            cell: (member) => member.email || "-",
            tooltipContent: (member) => member.email || "-",
        },
        {
            header: "Role",
            cell: (member) => displayRole(member.role),
        },
        {
            header: "Active",
            cell: (member) => (member.active ? "Yes" : "No"),
        },
        {
            header: "Subjects",
            cell: (member) => member.subjects || "-",
        },
        {
            header: "Experience",
            cell: (member) => member.experience || "-",
        },
        {
            header: "Actions",
            type: "actions",
            className: "w-[140px]",
            cell: (member) => canManage ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(member)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(member)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : "-",
        },
    ];

    return (
        <div className="space-y-3">
            <TableWidget columns={columns} data={paginatedRows} rowKey={(member) => `${member.source}-${member.id}`} />
            <TablePaginationControls
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={rows.length}
                onPageChange={setPage}
            />
        </div>
    );
}
