"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Download, Loader2, PhoneCall, Upload, MoreHorizontal, Phone, Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import ListWidget from "@/components/custom/ListWidget";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
    confirmLeadImport,
    downloadLeadImportTemplate,
    fetchLeadTimeline,
    fetchLeads,
    previewLeadImport,
    saveLeadDetails,
    updateLeadStatus,
} from "@/features/dashboard/dashboardSlice";

type Lead = {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    course?: string | null;
    source?: string | null;
    status: string;
    message?: string | null;
    followUpAt?: string | null;
    createdAt: string;
};

type LeadActivity = {
    activityType: string;
    title: string;
    description?: string;
    createdAt: string;
};

type LeadImportSummary = {
    totalRows: number;
    validRows: number;
    failedRows: number;
    duplicateRows: number;
    imported: number;
    errors: Array<{ row: number; message: string }>;
    duplicates: Array<{ row: number; phone: string }>;
    preview: Array<{
        name: string;
        email?: string;
        phone: string;
        course?: string;
        source?: string;
        city?: string;
    }>;
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "ADMITTED", "DROPPED"] as const;
const STATUS_COLORS: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CONTACTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    ADMITTED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    DROPPED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const PAGE_SIZE = 10;

export default function LeadsPage() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const [status, setStatus] = useState("all");
    const [query, setQuery] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [notes, setNotes] = useState("");
    const [followUpAt, setFollowUpAt] = useState("");
    const [page, setPage] = useState(1);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
    const [importSummary, setImportSummary] = useState<LeadImportSummary | null>(null);

    useEffect(() => {
        const q = searchParams.get("query") ?? "";
        if (q && !query) {
            setQuery(q);
        }
    }, [searchParams, query]);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (status && status !== "all") params.set("status", status);
        if (query) params.set("query", query);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return params.toString();
    }, [status, query, from, to]);

    const leads = useAppSelector((state) => state.dashboard.leads.data);
    const loading = useAppSelector((state) => state.dashboard.leads.loading);
    const timeline = useAppSelector((state) => state.dashboard.leads.timeline.data);
    const timelineLoading = useAppSelector((state) => state.dashboard.leads.timeline.loading);
    const savingDetails = useAppSelector((state) => state.dashboard.leads.mutation.loading);
    const previewImporting = useAppSelector((state) => state.dashboard.leads.import.loading);
    const confirmImporting = useAppSelector((state) => state.dashboard.leads.import.loading);
    const importing = previewImporting || confirmImporting;

    useEffect(() => {
        void dispatch(fetchLeads(queryString));
    }, [dispatch, queryString]);

    useEffect(() => {
        if (!editingLead?.id) return;
        void dispatch(fetchLeadTimeline(editingLead.id));
    }, [dispatch, editingLead?.id]);

    useEffect(() => {
        setPage(1);
    }, [status, query, from, to, leads.length]);

    const paginatedLeads = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const updateStatus = async (leadId: string, nextStatus: string) => {
        try {
            await dispatch(updateLeadStatus({ leadId, nextStatus })).unwrap();
            toast.success(`Lead marked as ${nextStatus}`);
            await dispatch(fetchLeads(queryString)).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const openDetails = (lead: Lead) => {
        setEditingLead(lead);
        setNotes(lead.message ?? "");
        setFollowUpAt(lead.followUpAt ? lead.followUpAt.slice(0, 10) : "");
    };

    const saveDetails = async () => {
        if (!editingLead) return;

        try {
            await dispatch(saveLeadDetails({ leadId: editingLead.id, message: notes || null, followUpAt: followUpAt || null })).unwrap();
            toast.success("Lead details updated");
            setEditingLead(null);
            await dispatch(fetchLeads(queryString)).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const downloadSampleTemplate = async (format: "csv" | "xlsx" | "json") => {
        try {
            const response = await dispatch(downloadLeadImportTemplate(format)).unwrap();
            const blobUrl = window.URL.createObjectURL(response.blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `lead-import-sample.${format}`;
            link.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            toast.error("Failed to download sample template");
        }
    };

    const previewImport = async () => {
        if (!selectedImportFile) {
            toast.error("Select a file first");
            return;
        }

        try {
            const summary = await dispatch(previewLeadImport(selectedImportFile)).unwrap();
            setImportSummary(summary);
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to preview import");
        }
    };

    const confirmImport = async () => {
        if (!selectedImportFile) {
            toast.error("Select a file first");
            return;
        }

        try {
            const summary = await dispatch(confirmLeadImport(selectedImportFile)).unwrap();
            setImportSummary(summary);
            toast.success(`${summary.imported} leads imported successfully`);
            await dispatch(fetchLeads(queryString)).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Import failed");
        }
    };

    const columns = useMemo<Column<Lead>[]>(() => [
        {
            header: "Sr. No.",
            align: "center",
            cell: (_lead, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            header: "Name",
            accessor: "name",
            className: "font-medium max-w-[180px] truncate",
            hoverCard: true,
            hoverCardContent: (lead) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-muted-foreground text-xs"><Phone /><p className="text-xs">{lead.phone || "-"}</p></p>
                    <p className="text-muted-foreground text-xs"><Mail /><p className="text-xs">{lead.email || "-"}</p></p>
                </div>
            ),
            sortable: true,
        },

        {
            header: "Course",
            className: "max-w-[180px] truncate",
            tooltip: true,
            cell: (lead) => lead.course?.slice(0, 20) + "..." || "-",
            tooltipContent: (lead) => lead.course || "-",
        },
        {
            header: "Status",
            accessor: "status",
            cell: (lead) => (
                <Badge variant="secondary" className={STATUS_COLORS[lead.status] ?? ""}>
                    {lead.status}
                </Badge>
            ),
            sortable: true,
        },
        {
            header: "Follow-up",
            accessor: "followUpAt",
            className: "text-xs text-muted-foreground",
            cell: (lead) => lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString() : "-",
            sortable: true,
        },
        {
            header: "Notes",
            className: "max-w-[220px] truncate text-xs text-muted-foreground",
            tooltip: true,
            cell: (lead) => lead.message?.slice(0, 20) + "..." || "-",
            tooltipContent: (lead) => lead.message || "-",
        },
        {
            header: "Date",
            accessor: "createdAt",
            className: "text-xs text-muted-foreground",
            cell: (lead) => new Date(lead.createdAt).toLocaleDateString(),
            sortable: true,
        },
        {
            header: "Action",
            type: "actions",
            cell: (lead) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetails(lead)}>Notes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { window.location.href = `tel:${lead.phone}`; }}>
                            Call
                        </DropdownMenuItem>
                        {STATUS_OPTIONS.map((item) => (
                            <DropdownMenuItem key={item} onClick={() => updateStatus(lead.id, item)}>
                                Mark as {item}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [openDetails, page, updateStatus]);

    const importPreviewColumns = useMemo<Column<LeadImportSummary["preview"][number]>[]>(() => [
        { header: "Name", accessor: "name" },
        { header: "Course", cell: (row) => row.course || "-" },
        { header: "Source", cell: (row) => row.source || "-" },
        { header: "City", cell: (row) => row.city || "-" },
    ], []);

    return (
        <>
            <ListWidget
                title="Leads"
                description={`${leads.length} total leads`}
                search={query}
                onSearchChange={setQuery}
                searchPlaceholder="Search name or phone"
                loading={loading}
                isEmpty={!loading && leads.length === 0}
                emptyMessage="No leads yet. Share your institute page to start collecting enquiries."
                actions={
                    <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Import Leads
                    </Button>
                }
                footer={
                    <TablePaginationControls
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalItems={leads.length}
                        onPageChange={setPage}
                    />
                }
            >
                <div >
                    {/* <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-4">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        {STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                                <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                                <Button onClick={loadLeads} variant="outline">Refresh</Button>
                            </div>
                        </CardContent>
                    </Card> */}

                    {isMobile ? (
                        <div className="space-y-3">
                            {paginatedLeads.map((lead) => (
                                <Card key={lead.id}>
                                    <CardContent className="space-y-3 pt-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold">{lead.name}</p>
                                                <p className="text-xs text-muted-foreground">{lead.phone}</p>
                                            </div>
                                            <Badge variant="secondary" className={STATUS_COLORS[lead.status] ?? ""}>
                                                {lead.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <p className="text-muted-foreground">Course</p>
                                            <p>{lead.course || "-"}</p>
                                            <p className="text-muted-foreground">Follow-up</p>
                                            <p>{lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString() : "-"}</p>
                                        </div>

                                        <p className="line-clamp-2 text-xs text-muted-foreground">{lead.message || "No notes added."}</p>

                                        <div className="space-y-2">
                                            <Select value={lead.status} onValueChange={(value) => updateStatus(lead.id, value)}>
                                                <SelectTrigger className="h-9 w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                                </SelectContent>
                                            </Select>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openDetails(lead)}>Details</Button>
                                                <Button asChild size="sm">
                                                    <a href={`tel:${lead.phone}`}>
                                                        <PhoneCall className="mr-1 h-4 w-4" />
                                                        Call
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <TableWidget columns={columns} data={paginatedLeads} rowKey={(lead) => lead.id} />
                    )}
                </div>
            </ListWidget>

            <Dialog open={Boolean(editingLead)} onOpenChange={(open) => !open && setEditingLead(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lead Notes & Follow-up</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-1">
                        <div className="space-y-2">
                            <Label>Follow-up Date</Label>
                            <Input type="date" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Called parent, interested in NEET, follow-up on Sunday..." maxLength={1024} />
                        </div>

                        <div className="space-y-2">
                            <Label>Activity Timeline</Label>
                            <div className="rounded border p-3 max-h-48 overflow-auto space-y-2">
                                {timelineLoading ? (
                                    <p className="text-xs text-muted-foreground">Loading timeline...</p>
                                ) : timeline.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No activity history available.</p>
                                ) : (
                                    timeline.map((item, index) => (
                                        <div key={`${item.activityType}-${item.createdAt}-${index}`} className="text-xs border-b last:border-0 pb-2 last:pb-0">
                                            <p className="font-medium">{item.title}</p>
                                            {item.description ? <p className="text-muted-foreground">{item.description}</p> : null}
                                            <p className="text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingLead(null)}>Cancel</Button>
                        <Button onClick={saveDetails} disabled={savingDetails}>{savingDetails ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Import Leads</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded border p-4 space-y-3">
                            <p className="text-sm font-medium">1. Upload file (.xlsx, .csv, .json)</p>
                            <Input
                                type="file"
                                accept=".xlsx,.xls,.csv,.json"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setSelectedImportFile(file);
                                    setImportSummary(null);
                                }}
                            />
                            {selectedImportFile ? (
                                <p className="text-xs text-muted-foreground">Selected: {selectedImportFile.name}</p>
                            ) : null}
                        </div>

                        <div className="rounded border p-4 space-y-3">
                            <p className="text-sm font-medium">2. Download sample template</p>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => downloadSampleTemplate("xlsx")}>
                                    <Download className="mr-2 h-4 w-4" /> Sample Excel
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => downloadSampleTemplate("csv")}>
                                    <Download className="mr-2 h-4 w-4" /> Sample CSV
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => downloadSampleTemplate("json")}>
                                    <Download className="mr-2 h-4 w-4" /> Sample JSON
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={previewImport} disabled={!selectedImportFile || importing}>
                                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Preview Import
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmImport}
                                disabled={!selectedImportFile || importing || !importSummary || importSummary.validRows === 0}
                            >
                                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirm Import
                            </Button>
                        </div>

                        {importSummary ? (
                            <div className="rounded border p-4 space-y-3">
                                <p className="text-sm font-medium">3. Preview and validate</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    <div className="rounded border p-2">Total: {importSummary.totalRows}</div>
                                    <div className="rounded border p-2 text-green-600">Valid: {importSummary.validRows}</div>
                                    <div className="rounded border p-2 text-red-600">Failed: {importSummary.failedRows}</div>
                                    <div className="rounded border p-2 text-amber-600">Duplicates: {importSummary.duplicateRows}</div>
                                </div>

                                {importSummary.errors.length > 0 ? (
                                    <div className="rounded border border-red-200 bg-red-50 p-3 text-xs space-y-1">
                                        <p className="font-medium text-red-700 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Validation errors</p>
                                        {importSummary.errors.slice(0, 8).map((item) => (
                                            <p key={`${item.row}-${item.message}`} className="text-red-700">Row {item.row}: {item.message}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded border border-green-200 bg-green-50 p-3 text-xs text-green-700 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> No validation errors found.
                                    </div>
                                )}

                                <div className="rounded border overflow-x-auto max-h-60">
                                    <TableWidget
                                        columns={importPreviewColumns}
                                        data={importSummary.preview}
                                        rowKey={(row, index) => `${row.phone}-${index}`}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
