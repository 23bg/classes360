"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Plus, Layers, Eye, MoreHorizontal } from "lucide-react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import ListWidget from "@/components/custom/ListWidget";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
    addBatchAttendance,
    addBatchNote,
    deleteBatch as deleteBatchThunk,
    fetchBatchDetails,
    fetchBatchesDashboard,
    saveBatch as saveBatchThunk,
} from "@/features/dashboard/dashboardSlice";

type Course = { id: string; name: string };
type Teacher = { id: string; name: string; subject?: string | null };
type Batch = {
    id: string;
    courseId: string;
    name: string;
    startDate?: string | null;
    schedule?: string | null;
    teacherId?: string | null;
};
type Student = { id: string; name: string; phone: string };
type BatchNote = { id: string; title: string; description?: string | null; fileUrl?: string | null; createdAt: string };
type BatchAttendance = { id: string; studentId: string; date: string; status: "PRESENT" | "ABSENT" };

type BatchForm = { courseId: string; name: string; startDate: string; schedule: string; teacherId: string };
const emptyForm: BatchForm = { courseId: "", name: "", startDate: "", schedule: "", teacherId: "" };
const PAGE_SIZE = 10;

export default function BatchesPage() {
    const dispatch = useAppDispatch();
    const batchesState = useAppSelector((state) => state.dashboard.batches.data);
    const loading = useAppSelector((state) => state.dashboard.batches.loading);
    const saving = useAppSelector((state) => state.dashboard.batches.mutation.loading);
    const savingNote = useAppSelector((state) => state.dashboard.batches.noteMutation.loading);
    const savingAttendance = useAppSelector((state) => state.dashboard.batches.attendanceMutation.loading);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [noteForm, setNoteForm] = useState({ title: "", description: "", fileUrl: "" });
    const [attendanceDate, setAttendanceDate] = useState("");
    const [attendanceStudentId, setAttendanceStudentId] = useState("");
    const [attendanceStatus, setAttendanceStatus] = useState<"PRESENT" | "ABSENT">("PRESENT");
    const [form, setForm] = useState<BatchForm>(emptyForm);
    const [page, setPage] = useState(1);
    const batches = batchesState?.rows ?? [];
    const courses = batchesState?.courses ?? [];
    const teachers = batchesState?.teachers ?? [];
    const students = batchesState?.students ?? [];
    const batchDetails = useAppSelector((state) => state.dashboard.batches.details.data);
    const batchNotes = batchDetails?.notes ?? [];
    const batchAttendance = batchDetails?.attendance ?? [];

    useEffect(() => {
        void dispatch(fetchBatchesDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedBatch?.id) return;
        void dispatch(fetchBatchDetails(selectedBatch.id));
    }, [dispatch, selectedBatch?.id]);

    useEffect(() => {
        setPage(1);
    }, [batches.length]);

    const paginatedBatches = batches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));
    const teacherMap = Object.fromEntries(teachers.map((t) => [t.id, t.name]));
    const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student.name])), [students]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (batch: Batch) => {
        setEditingId(batch.id);
        setForm({
            courseId: batch.courseId,
            name: batch.name,
            startDate: batch.startDate ? batch.startDate.slice(0, 10) : "",
            schedule: batch.schedule ?? "",
            teacherId: batch.teacherId ?? "",
        });
        setDialogOpen(true);
    };

    const saveBatch = async () => {
        if (!form.courseId || !form.name.trim()) {
            toast.error("Course and batch name are required");
            return;
        }
        try {
            const body: Record<string, unknown> = { courseId: form.courseId, name: form.name };
            if (form.startDate) body.startDate = form.startDate;
            if (form.schedule) body.schedule = form.schedule;
            if (form.teacherId) body.teacherId = form.teacherId;

            await dispatch(saveBatchThunk({ editingId, body })).unwrap();
            toast.success(editingId ? "Batch updated" : "Batch added");
            setDialogOpen(false);
            await dispatch(fetchBatchesDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const deleteBatch = async (id: string) => {
        try {
            await dispatch(deleteBatchThunk(id)).unwrap();
            toast.success("Batch deleted");
            await dispatch(fetchBatchesDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const loadBatchSidePanels = async (batch: Batch) => {
        setSelectedBatch(batch);
    };

    const openView = (batch: Batch) => {
        setNoteForm({ title: "", description: "", fileUrl: "" });
        setAttendanceDate("");
        setAttendanceStudentId("");
        setAttendanceStatus("PRESENT");
        setViewDialogOpen(true);
        void loadBatchSidePanels(batch);
    };

    const studentsInBatch = selectedBatch ? students.filter((student) => student.id === selectedBatch.id) : [];

    const saveBatchNote = async () => {
        if (!selectedBatch) return;
        if (!noteForm.title.trim()) {
            toast.error("Note title is required");
            return;
        }

        try {
            await dispatch(addBatchNote({
                batchId: selectedBatch.id,
                courseId: selectedBatch.courseId,
                body: {
                    title: noteForm.title,
                    description: noteForm.description || undefined,
                    fileUrl: noteForm.fileUrl || undefined,
                },
            })).unwrap();
            toast.success("Note added");
            setNoteForm({ title: "", description: "", fileUrl: "" });
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to add note");
        }
    };

    const saveAttendance = async () => {
        if (!selectedBatch) return;
        if (!attendanceStudentId || !attendanceDate) {
            toast.error("Student and date are required");
            return;
        }

        try {
            await dispatch(addBatchAttendance({
                batchId: selectedBatch.id,
                courseId: selectedBatch.courseId,
                body: {
                    studentId: attendanceStudentId,
                    date: attendanceDate,
                    status: attendanceStatus,
                },
            })).unwrap();
            toast.success("Attendance marked");
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to mark attendance");
        }
    };

    const columns = useMemo<Column<Batch>[]>(() => [
        {
            header: "Sr. No.",
            cell: (_batch, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Batch Name",
            accessor: "name",
            className: "font-medium max-w-[180px] truncate",
            hoverCard: true,
            hoverCardContent: (batch) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{batch.name}</p>
                    <p className="text-muted-foreground">Course: {courseMap[batch.courseId] ?? "-"}</p>
                    <p className="text-muted-foreground">Schedule: {batch.schedule || "-"}</p>
                    <p className="text-muted-foreground">Teacher: {batch.teacherId ? (teacherMap[batch.teacherId] ?? "-") : "-"}</p>
                </div>
            ),
            sortable: true,
        },
        {
            header: "Course",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (batch) => courseMap[batch.courseId] ?? "-",
            tooltipContent: (batch) => courseMap[batch.courseId] ?? "-",
        },
        {
            header: "Start Date",
            accessor: "startDate",
            cell: (batch) => batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "-",
            sortable: true,
        },
        {
            header: "Schedule",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (batch) => batch.schedule || "-",
            tooltipContent: (batch) => batch.schedule || "-",
        },
        {
            header: "Teacher",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (batch) => {
                const teacherName = batch.teacherId ? (teacherMap[batch.teacherId] ?? "-") : "-";
                return teacherName;
            },
            tooltipContent: (batch) => batch.teacherId ? (teacherMap[batch.teacherId] ?? "-") : "-",
        },
        {
            header: "Actions",
            type: "actions",
            className: "w-[120px]",
            cell: (batch) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openView(batch)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(batch)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => deleteBatch(batch.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [courseMap, deleteBatch, openView, page, teacherMap]);

    const noteColumns = useMemo<Column<BatchNote>[]>(() => [
        { header: "Title", accessor: "title" },
        { header: "Description", cell: (note) => note.description || "-" },
        { header: "Created", cell: (note) => new Date(note.createdAt).toLocaleDateString() },
    ], []);

    const attendanceColumns = useMemo<Column<BatchAttendance>[]>(() => [
        { header: "Date", cell: (row) => new Date(row.date).toLocaleDateString() },
        { header: "Student", cell: (row) => studentMap[row.studentId] ?? "-" },
        { header: "Status", accessor: "status" },
    ], [studentMap]);

    return (
        <>
            <ListWidget
                title="Batches"
                description={`${batches.length} total batches`}
                loading={loading}
                isEmpty={!loading && batches.length === 0}
                emptyMessage="No batches yet."
                actions={
                    <Button onClick={openCreate} disabled={courses.length === 0}>
                        <Plus className="mr-2 h-4 w-4" /> Add Batch
                    </Button>
                }
                footer={
                    <TablePaginationControls
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalItems={batches.length}
                        onPageChange={setPage}
                    />
                }
            >
                <div className="space-y-4 px-6 py-4">
                    <div className="flex items-center gap-2 text-2xl font-semibold">
                        <Layers className="h-6 w-6" />
                        <span>Batches</span>
                    </div>
                    {courses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Add courses first before creating batches.</p>
                    ) : null}
                    <TableWidget columns={columns} data={paginatedBatches} rowKey={(batch) => batch.id} />
                </div>
            </ListWidget>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Batch" : "Add Batch"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Course *</Label>
                            <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Batch Name *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Batch, Weekend Batch" minLength={2} maxLength={120} />
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Schedule</Label>
                            <Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="e.g. Mon-Fri 9AM-12PM" maxLength={120} />
                        </div>
                        <div className="space-y-2">
                            <Label>Teacher</Label>
                            <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                                <SelectTrigger><SelectValue placeholder="Assign teacher (optional)" /></SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}{t.subject ? ` — ${t.subject}` : ""}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveBatch} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingId ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batch Details</DialogTitle>
                    </DialogHeader>
                    {selectedBatch ? (
                        <div className="space-y-3 py-2 text-sm">
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Batch Name</span><span className="font-medium">{selectedBatch.name}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Course</span><span>{courseMap[selectedBatch.courseId] ?? "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Start Date</span><span>{selectedBatch.startDate ? new Date(selectedBatch.startDate).toLocaleDateString() : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Schedule</span><span>{selectedBatch.schedule || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Teacher</span><span>{selectedBatch.teacherId ? (teacherMap[selectedBatch.teacherId] ?? "-") : "-"}</span></div>

                            <div className="rounded border p-3 space-y-3">
                                <p className="font-medium">Notes</p>
                                <div className="grid gap-2 md:grid-cols-3">
                                    <Input placeholder="Title" value={noteForm.title} onChange={(e) => setNoteForm((prev) => ({ ...prev, title: e.target.value }))} />
                                    <Input placeholder="File URL (optional)" value={noteForm.fileUrl} onChange={(e) => setNoteForm((prev) => ({ ...prev, fileUrl: e.target.value }))} />
                                    <Button onClick={saveBatchNote} disabled={savingNote}>{savingNote ? "Saving..." : "Add Note"}</Button>
                                </div>
                                <Input placeholder="Description (optional)" value={noteForm.description} onChange={(e) => setNoteForm((prev) => ({ ...prev, description: e.target.value }))} />

                                <div className="rounded border overflow-x-auto">
                                    {batchNotes.length === 0 ? (
                                        <p className="p-4 text-center text-muted-foreground">No notes yet.</p>
                                    ) : (
                                        <TableWidget columns={noteColumns} data={batchNotes} rowKey={(note) => note.id} />
                                    )}
                                </div>
                            </div>

                            <div className="rounded border p-3 space-y-3">
                                <p className="font-medium">Attendance</p>
                                <div className="grid gap-2 md:grid-cols-4">
                                    <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                                    <Select value={attendanceStudentId} onValueChange={setAttendanceStudentId}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>
                                            {studentsInBatch.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={attendanceStatus} onValueChange={(value) => setAttendanceStatus(value as "PRESENT" | "ABSENT")}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRESENT">Present</SelectItem>
                                            <SelectItem value="ABSENT">Absent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={saveAttendance} disabled={savingAttendance}>{savingAttendance ? "Saving..." : "Mark"}</Button>
                                </div>

                                <div className="rounded border overflow-x-auto">
                                    {batchAttendance.length === 0 ? (
                                        <p className="p-4 text-center text-muted-foreground">No attendance records yet.</p>
                                    ) : (
                                        <TableWidget columns={attendanceColumns} data={batchAttendance} rowKey={(row) => row.id} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
