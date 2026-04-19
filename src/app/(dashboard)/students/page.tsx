"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Plus, Upload, CheckCircle2, AlertCircle, Eye, MoreHorizontal } from "lucide-react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import ListWidget from "@/components/custom/ListWidget";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
    assignStudentCourse,
    deleteStudent as deleteStudentThunk,
    fetchStudentAssignments,
    fetchStudentsDashboard,
    saveStudent as saveStudentThunk,
    updateStudentPortalCredentials,
    uploadStudentsCsv,
} from "@/features/dashboard/dashboardSlice";

type Course = { id: string; name: string; defaultFees?: number | null };
type Batch = { id: string; courseId: string; name: string };
type FeeSummary = { totalFees: number; totalPaid: number; totalPending: number };
type Student = {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    courseId?: string | null;
    batchId?: string | null;
    admissionDate?: string | null;
};

type StudentForm = { name: string; phone: string; email: string; courseId: string; batchId: string; admissionDate: string; fees: string };
const emptyForm: StudentForm = { name: "", phone: "", email: "", courseId: "", batchId: "", admissionDate: "", fees: "" };
type PortalCredentialForm = { username: string; email: string; password: string };
type UploadResult = {
    inserted: number;
    errors: Array<{ row: number; message: string }>;
};
type StudentAssignment = {
    id: string;
    courseId: string;
    batchId?: string | null;
    joinedAt: string;
    status: "ACTIVE" | "COMPLETED" | "DROPPED";
    courseName: string;
    batchName?: string | null;
    batchStartDate?: string | null;
};

const PAGE_SIZE = 10;

export default function StudentsPage() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const dashboardState = useAppSelector((state) => state.dashboard.students.data);
    const loading = useAppSelector((state) => state.dashboard.students.loading);
    const students = (dashboardState?.rows ?? []) as Student[];
    const courses = (dashboardState?.courses ?? []) as Course[];
    const batches = (dashboardState?.batches ?? []) as Batch[];
    const feeSummaries = (dashboardState?.feeSummaries ?? {}) as Record<string, FeeSummary>;
    const saving = useAppSelector((state) => state.dashboard.students.mutation.loading);
    const assigningCourse = useAppSelector((state) => state.dashboard.students.assignments.loading);
    const updatingPortalCredentials = useAppSelector((state) => state.dashboard.students.mutation.loading);
    const uploading = useAppSelector((state) => state.dashboard.students.upload.loading);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [form, setForm] = useState<StudentForm>(emptyForm);
    const [uploadFileName, setUploadFileName] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [portalCredentials, setPortalCredentials] = useState<PortalCredentialForm>({ username: "", email: "", password: "" });
    const [assignmentForm, setAssignmentForm] = useState<{ courseId: string; batchId: string }>({ courseId: "", batchId: "" });
    const [page, setPage] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const studentAssignments = useAppSelector((state) => state.dashboard.students.assignments.data);
    const loadingAssignments = useAppSelector((state) => state.dashboard.students.assignments.loading);

    useEffect(() => {
        void dispatch(fetchStudentsDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedStudent?.id) return;
        void dispatch(fetchStudentAssignments(selectedStudent.id));
    }, [dispatch, selectedStudent?.id]);

    useEffect(() => {
        const query = searchParams.get("query") ?? "";
        if (query && !searchQuery) {
            setSearchQuery(query);
        }
    }, [searchParams, searchQuery]);

    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
    const batchMap = Object.fromEntries(batches.map((b) => [b.id, b.name]));
    const filteredBatches = form.courseId ? batches.filter((b) => b.courseId === form.courseId) : batches;
    const assignmentBatches = assignmentForm.courseId
        ? batches.filter((b) => b.courseId === assignmentForm.courseId)
        : batches;
    const visibleStudents = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return students;

        return students.filter((student) => {
            const courseName = student.courseId ? (courseMap[student.courseId]?.name ?? "") : "";
            const batchName = student.batchId ? (batchMap[student.batchId] ?? "") : "";

            return [student.name, student.phone, student.email ?? "", courseName, batchName]
                .join(" ")
                .toLowerCase()
                .includes(q);
        });
    }, [students, searchQuery, courseMap, batchMap]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, students.length]);

    const paginatedStudents = useMemo(
        () => visibleStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [visibleStudents, page]
    );

    const handleCourseChange = (courseId: string) => {
        const course = courseMap[courseId];
        setForm({
            ...form,
            courseId,
            batchId: "",
            fees: course?.defaultFees ? course.defaultFees.toString() : "",
        });
    };

    function openCreate() {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    }

    useEffect(() => {
        if (searchParams.get("action") === "add") {
            openCreate();
        }
    }, [searchParams]);

    const openEdit = (student: Student) => {
        setEditingId(student.id);
        setForm({
            name: student.name,
            phone: student.phone,
            email: student.email ?? "",
            courseId: student.courseId ?? "",
            batchId: student.batchId ?? "",
            admissionDate: student.admissionDate ? student.admissionDate.slice(0, 10) : "",
            fees: "",
        });
        setDialogOpen(true);
    };

    const saveStudent = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error("Name and phone are required");
            return;
        }
        try {
            const body: Record<string, unknown> = { name: form.name, phone: form.phone };
            if (form.email) body.email = form.email;
            if (form.courseId) body.courseId = form.courseId;
            if (form.batchId) body.batchId = form.batchId;
            if (form.admissionDate) body.admissionDate = form.admissionDate;
            if (!editingId && form.fees) body.fees = parseFloat(form.fees);

            await dispatch(saveStudentThunk({ editingId, body })).unwrap();
            toast.success(editingId ? "Student updated" : "Student added");
            setDialogOpen(false);
            await dispatch(fetchStudentsDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await dispatch(deleteStudentThunk(id)).unwrap();
            toast.success("Student deleted");
            await dispatch(fetchStudentsDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const openView = (student: Student) => {
        setSelectedStudent(student);
        setPortalCredentials({
            username: student.phone,
            email: student.email ?? "",
            password: "",
        });
        setAssignmentForm({ courseId: "", batchId: "" });
        setViewDialogOpen(true);
    };

    const assignCourse = async () => {
        if (!selectedStudent) return;
        if (!assignmentForm.courseId) {
            toast.error("Select a course");
            return;
        }

        try {
            await dispatch(assignStudentCourse({
                studentId: selectedStudent.id,
                body: {
                    courseId: assignmentForm.courseId,
                    batchId: assignmentForm.batchId || undefined,
                },
            })).unwrap();
            setAssignmentForm({ courseId: "", batchId: "" });
            toast.success("Course assigned successfully");
            await dispatch(fetchStudentsDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to assign course");
        }
    };

    const updatePortalCredentials = async () => {
        if (!selectedStudent) return;
        if (!portalCredentials.password.trim()) {
            toast.error("Enter a new password to reset credentials");
            return;
        }

        try {
            await dispatch(updateStudentPortalCredentials({
                studentId: selectedStudent.id,
                body: portalCredentials,
            })).unwrap();
            toast.success("Student portal credentials updated");
            setPortalCredentials((prev) => ({ ...prev, password: "" }));
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to update portal credentials");
        }
    };

    const onUpload = async (file: File) => {
        setUploadFileName(file.name);
        setUploadResult(null);
        try {
            const data = await dispatch(uploadStudentsCsv(file)).unwrap();
            setUploadResult(data);
            toast.success(`${data.inserted} students imported`);
            await dispatch(fetchStudentsDashboard()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error during upload");
        }
    };

    const formatCurrency = (v: number) => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "-";

    const downloadSampleCsv = () => {
        const sample = "name,phone,email,course,batch,fees\nRahul Sharma,9876543210,rahul@example.com,NEET,Batch A,50000\nPriya Singh,9123456789,priya@example.com,JEE,Weekend Batch,42000\n";
        const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "students-sample.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const columns = useMemo<Column<Student>[]>(() => [
        {
            header: "Sr. No.",
            cell: (_student, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Name",
            accessor: "name",
            className: "font-medium max-w-[180px] truncate",
            hoverCard: true,
            hoverCardContent: (student) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-muted-foreground">Phone: {student.phone}</p>
                    <p className="text-muted-foreground">Email: {student.email || "-"}</p>
                    <p className="text-muted-foreground">Course: {student.courseId ? (courseMap[student.courseId]?.name ?? "-") : "-"}</p>
                </div>
            ),
            sortable: true,
        },
        {
            header: "Phone",
            accessor: "phone",
        },
        {
            header: "Course",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (student) => {
                const courseName = student.courseId ? (courseMap[student.courseId]?.name ?? "-") : "-";
                return courseName;
            },
            tooltipContent: (student) => student.courseId ? (courseMap[student.courseId]?.name ?? "-") : "-",
        },
        {
            header: "Batch",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (student) => {
                const batchName = student.batchId ? (batchMap[student.batchId] ?? "-") : "-";
                return batchName;
            },
            tooltipContent: (student) => student.batchId ? (batchMap[student.batchId] ?? "-") : "-",
        },
        {
            header: "Total Fees",
            className: "text-right",
            cell: (student) => formatCurrency(feeSummaries[student.id]?.totalFees ?? 0),
        },
        {
            header: "Paid",
            className: "text-right text-green-600",
            cell: (student) => formatCurrency(feeSummaries[student.id]?.totalPaid ?? 0),
        },
        {
            header: "Pending",
            className: "text-right text-red-600",
            cell: (student) => formatCurrency(feeSummaries[student.id]?.totalPending ?? 0),
        },
        {
            header: "Actions",
            type: "actions",
            className: "w-[120px]",
            cell: (student) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openView(student)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(student)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => deleteStudent(student.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [batchMap, courseMap, deleteStudent, feeSummaries, openEdit, openView, page]);

    const assignmentColumns = useMemo<Column<StudentAssignment>[]>(() => [
        {
            header: "Course",
            accessor: "courseName",
        },
        {
            header: "Batch",
            cell: (assignment) => assignment.batchName ?? "-",
        },
        {
            header: "Start Date",
            cell: (assignment) => assignment.batchStartDate ? new Date(assignment.batchStartDate).toLocaleDateString() : "-",
        },
        {
            header: "Status",
            accessor: "status",
        },
    ], []);

    return (
        <>
            <ListWidget
                title="Students"
                description={`${visibleStudents.length} shown • ${students.length} total students`}
                search={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search student, phone, course, batch"
                loading={loading}
                isEmpty={!loading && visibleStudents.length === 0}
                emptyMessage="No matching students found."
                actions={
                    <>
                        <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" /> Upload CSV
                        </Button>
                        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
                    </>
                }
                footer={
                    <TablePaginationControls
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalItems={visibleStudents.length}
                        onPageChange={setPage}
                    />
                }
            >
                <TableWidget columns={columns} data={paginatedStudents} rowKey={(student) => student.id} />
            </ListWidget>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" minLength={2} maxLength={80} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone *</Label>
                            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" inputMode="numeric" maxLength={14} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" maxLength={120} />
                        </div>
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select value={form.courseId} onValueChange={handleCourseChange}>
                                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Batch</Label>
                            <Select value={form.batchId} onValueChange={(v) => setForm({ ...form, batchId: v })} disabled={!form.courseId}>
                                <SelectTrigger><SelectValue placeholder={form.courseId ? "Select batch" : "Select course first"} /></SelectTrigger>
                                <SelectContent>
                                    {filteredBatches.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Admission Date</Label>
                            <Input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />
                        </div>
                        {!editingId ? (
                            <div className="space-y-2">
                                <Label>Fees (₹)</Label>
                                <Input type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} placeholder="Auto-filled from course" />
                                <p className="text-xs text-muted-foreground">Auto-filled from course default fees. A fee plan will be created automatically.</p>
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveStudent} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingId ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Students CSV</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Required columns: <span className="font-medium">name</span>, <span className="font-medium">phone</span>. Optional: email, course, batch, fees.
                        </p>
                        <Button variant="outline" size="sm" onClick={downloadSampleCsv}>Download Sample CSV</Button>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {uploadFileName ? uploadFileName : "Click to select a CSV file"}
                            </p>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onUpload(file);
                                }}
                            />
                        </div>

                        {uploading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                            </div>
                        ) : null}

                        {uploadResult ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">{uploadResult.inserted} students imported • {uploadResult.errors.length} failed</span>
                                </div>
                                {uploadResult.errors.length > 0 ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                            <span className="text-sm font-medium">{uploadResult.errors.length} row errors</span>
                                        </div>
                                        <ul className="text-xs text-muted-foreground space-y-1 pl-6 max-h-32 overflow-auto">
                                            {uploadResult.errors.map((error) => (
                                                <li key={`${error.row}-${error.message}`}>
                                                    Row {error.row}: {error.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">All rows imported successfully.</p>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {selectedStudent ? (
                        <div className="space-y-3 py-2 text-sm">
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedStudent.name}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Phone</span><span>{selectedStudent.phone || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Email</span><span>{selectedStudent.email || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Course</span><span>{selectedStudent.courseId ? (courseMap[selectedStudent.courseId]?.name ?? "-") : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Batch</span><span>{selectedStudent.batchId ? (batchMap[selectedStudent.batchId] ?? "-") : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Admission Date</span><span>{selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Total Fees</span><span>{formatCurrency(feeSummaries[selectedStudent.id]?.totalFees ?? 0)}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Paid</span><span className="text-green-600">{formatCurrency(feeSummaries[selectedStudent.id]?.totalPaid ?? 0)}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pending</span><span className="text-red-600">{formatCurrency(feeSummaries[selectedStudent.id]?.totalPending ?? 0)}</span></div>

                            <div className="mt-4 rounded border p-3 space-y-3">
                                <p className="font-medium">Courses and Batches</p>
                                <div className="grid gap-2 md:grid-cols-3">
                                    <Select
                                        value={assignmentForm.courseId}
                                        onValueChange={(value) => setAssignmentForm({ courseId: value, batchId: "" })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={assignmentForm.batchId}
                                        onValueChange={(value) => setAssignmentForm((prev) => ({ ...prev, batchId: value }))}
                                        disabled={!assignmentForm.courseId}
                                    >
                                        <SelectTrigger><SelectValue placeholder={assignmentForm.courseId ? "Select batch" : "Select course first"} /></SelectTrigger>
                                        <SelectContent>
                                            {assignmentBatches.map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button onClick={assignCourse} disabled={assigningCourse}>
                                        {assigningCourse ? "Assigning..." : "Assign Course"}
                                    </Button>
                                </div>

                                <div className="rounded border overflow-x-auto">
                                    {loadingAssignments ? (
                                        <p className="p-4 text-center text-muted-foreground">Loading assignments...</p>
                                    ) : studentAssignments.length === 0 ? (
                                        <p className="p-4 text-center text-muted-foreground">No assignments found.</p>
                                    ) : (
                                        <TableWidget
                                            columns={assignmentColumns}
                                            data={studentAssignments}
                                            rowKey={(assignment) => assignment.id}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded border p-3 space-y-2">
                                <p className="font-medium">Student Portal Credentials</p>
                                <p className="text-xs text-muted-foreground">Institute can manually set/reset student login credentials.</p>
                                <div className="grid gap-2 md:grid-cols-2">
                                    <Input
                                        placeholder="Username"
                                        value={portalCredentials.username}
                                        onChange={(event) => setPortalCredentials((prev) => ({ ...prev, username: event.target.value }))}
                                    />
                                    <Input
                                        placeholder="Email"
                                        value={portalCredentials.email}
                                        onChange={(event) => setPortalCredentials((prev) => ({ ...prev, email: event.target.value }))}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                        value={portalCredentials.password}
                                        onChange={(event) => setPortalCredentials((prev) => ({ ...prev, password: event.target.value }))}
                                    />
                                    <Button onClick={updatePortalCredentials} disabled={updatingPortalCredentials}>
                                        {updatingPortalCredentials ? "Saving..." : "Reset"}
                                    </Button>
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
