"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TableWidget, { Column } from "@/components/custom/TableWidget";

type TemplateDef = {
    key: string;
    title: string;
    columns: string[];
    sampleRow: Record<string, string>;
};

const templates: TemplateDef[] = [
    {
        key: "student-data",
        title: "Student Data Template",
        columns: ["Name", "Phone", "Email", "Course", "Batch", "Fees", "AdmissionDate"],
        sampleRow: {
            Name: "Aarav",
            Phone: "9876543210",
            Email: "aarav@example.com",
            Course: "NEET",
            Batch: "Morning",
            Fees: "55000",
            AdmissionDate: "2026-03-02",
        },
    },
    {
        key: "attendance",
        title: "Attendance Template",
        columns: ["StudentName", "Date", "Status", "Batch"],
        sampleRow: {
            StudentName: "Aarav",
            Date: "2026-03-02",
            Status: "Present",
            Batch: "Morning",
        },
    },
    {
        key: "fees",
        title: "Fees Template",
        columns: ["StudentName", "TotalFees", "Paid", "Remaining"],
        sampleRow: {
            StudentName: "Aarav",
            TotalFees: "55000",
            Paid: "25000",
            Remaining: "30000",
        },
    },
    {
        key: "leads",
        title: "Leads Template",
        columns: ["Name", "Phone", "Course", "Source", "Date"],
        sampleRow: {
            Name: "Riya",
            Phone: "9988776655",
            Course: "JEE",
            Source: "Instagram",
            Date: "2026-03-02",
        },
    },
];

const downloadCsv = (template: TemplateDef) => {
    const header = template.columns.join(",");
    const row = template.columns.map((col) => template.sampleRow[col] ?? "").join(",");
    const blob = new Blob([`${header}\n${row}\n`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.key}.csv`;
    link.click();

    URL.revokeObjectURL(url);
};

const downloadExcel = (template: TemplateDef) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([template.sampleRow], { header: template.columns });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, `${template.key}.xlsx`);
};

export default function ExcelTemplatesTool() {
    return (
        <div className="grid gap-4">
            {templates.map((template) => (
                <Card key={template.key}>
                    <CardHeader>
                        <CardTitle>{template.title}</CardTitle>
                        <CardDescription>Download CSV or Excel and use it directly in your institute workflow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TableWidget
                            columns={template.columns.map((column) => ({
                                header: column,
                                cell: () => template.sampleRow[column] ?? "",
                            } satisfies Column<Record<string, string>>))}
                            data={[template.sampleRow]}
                            rowKey={() => template.key}
                        />

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => downloadCsv(template)}>Download CSV</Button>
                            <Button onClick={() => downloadExcel(template)}>Download Excel</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
