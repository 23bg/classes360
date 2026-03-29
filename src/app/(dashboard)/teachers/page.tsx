"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import ListWidget from "@/components/custom/ListWidget";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { deleteTeacher as deleteTeacherThunk, fetchTeachers, saveTeacher as saveTeacherThunk } from "@/features/dashboard/dashboardSlice";

type Teacher = {
    id: string;
    name: string;
    subject?: string | null;
    bio?: string | null;
};

type TeacherForm = { name: string; subject: string; bio: string };

const emptyForm: TeacherForm = { name: "", subject: "", bio: "" };
const PAGE_SIZE = 10;

export default function TeachersPage() {
    const dispatch = useAppDispatch();
    const teachers = useAppSelector((state) => state.dashboard.teachers.data);
    const loading = useAppSelector((state) => state.dashboard.teachers.loading);
    const saving = useAppSelector((state) => state.dashboard.teachers.mutation.loading);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<TeacherForm>(emptyForm);
    const [page, setPage] = useState(1);

    useEffect(() => {
        void dispatch(fetchTeachers());
    }, [dispatch]);

    useEffect(() => {
        setPage(1);
    }, [teachers.length]);

    const paginatedTeachers = teachers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (teacher: Teacher) => {
        setEditingId(teacher.id);
        setForm({ name: teacher.name, subject: teacher.subject ?? "", bio: teacher.bio ?? "" });
        setDialogOpen(true);
    };

    const saveTeacher = async () => {
        if (!form.name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            await dispatch(saveTeacherThunk({
                editingId,
                body: { name: form.name, subject: form.subject || undefined, bio: form.bio || undefined },
            })).unwrap();
            toast.success(editingId ? "Teacher updated" : "Teacher added");
            setDialogOpen(false);
            await dispatch(fetchTeachers()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const deleteTeacher = async (id: string) => {
        try {
            await dispatch(deleteTeacherThunk(id)).unwrap();
            toast.success("Teacher deleted");
            await dispatch(fetchTeachers()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const columns = useMemo<Column<Teacher>[]>(() => [
        {
            header: "Sr. No.",
            cell: (_teacher, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Name",
            accessor: "name",
            className: "font-medium max-w-[180px] truncate",
            hoverCard: true,
            hoverCardContent: (teacher) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-muted-foreground">Subject: {teacher.subject || "-"}</p>
                    <p className="text-muted-foreground">Bio: {teacher.bio || "-"}</p>
                </div>
            ),
            sortable: true,
        },
        {
            header: "Subject",
            accessor: "subject",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (teacher) => teacher.subject || "-",
            tooltipContent: (teacher) => teacher.subject || "-",
        },
        {
            header: "Bio",
            className: "max-w-[220px] truncate",
            tooltip: true,
            cell: (teacher) => teacher.bio || "-",
            tooltipContent: (teacher) => teacher.bio || "-",
        },
        {
            header: "Actions",
            type: "actions",
            className: "w-[120px]",
            cell: (teacher) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(teacher)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => deleteTeacher(teacher.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [deleteTeacher, page]);

    return (
        <>
            <ListWidget
                title="Teachers"
                description={`${teachers.length} total teachers`}
                loading={loading}
                isEmpty={!loading && teachers.length === 0}
                emptyMessage="No teachers yet. Add your first teacher."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Teacher
                    </Button>
                }
                footer={
                    <TablePaginationControls
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalItems={teachers.length}
                        onPageChange={setPage}
                    />
                }
            >
                <TableWidget columns={columns} data={paginatedTeachers} rowKey={(teacher) => teacher.id} />
            </ListWidget>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Teacher name" minLength={2} maxLength={80} />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject taught" maxLength={120} />
                        </div>
                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" rows={3} maxLength={1024} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveTeacher} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingId ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
