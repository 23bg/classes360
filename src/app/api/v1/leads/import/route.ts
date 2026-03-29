import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { leadService } from "@/server/leadsApi";
import { toAppError } from "@/lib/utils/error";

type ParsedRow = {
    name?: string;
    email?: string;
    phone?: string;
    course?: string;
    source?: string;
    city?: string;
    message?: string;
};

const SAMPLE_ROWS: ParsedRow[] = [
    {
        name: "Rahul Sharma",
        email: "rahul@email.com",
        phone: "9876543210",
        course: "JEE",
        source: "Website",
        city: "Pune",
    },
    {
        name: "Priya Patil",
        email: "priya@email.com",
        phone: "9123456780",
        course: "NEET",
        source: "Walk-in",
        city: "Nashik",
    },
];

function normalizeRows(rows: Record<string, unknown>[]): ParsedRow[] {
    return rows.map((row) => {
        const normalized = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.toLowerCase().trim(), value])
        );

        return {
            name: typeof normalized.name === "string" ? normalized.name : undefined,
            email: typeof normalized.email === "string" ? normalized.email : undefined,
            phone: typeof normalized.phone === "string" || typeof normalized.phone === "number"
                ? String(normalized.phone)
                : undefined,
            course: typeof normalized.course === "string" ? normalized.course : undefined,
            source: typeof normalized.source === "string" ? normalized.source : undefined,
            city: typeof normalized.city === "string" ? normalized.city : undefined,
            message: typeof normalized.message === "string" ? normalized.message : undefined,
        };
    });
}

function parseCsv(buffer: Buffer): ParsedRow[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
    return normalizeRows(rows);
}

function parseXlsx(buffer: Buffer): ParsedRow[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
    return normalizeRows(rows);
}

function parseJson(buffer: Buffer): ParsedRow[] {
    const decoded = buffer.toString("utf-8");
    const parsed = JSON.parse(decoded) as unknown;
    if (!Array.isArray(parsed)) {
        return [];
    }

    const rows = parsed.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null);
    return normalizeRows(rows);
}

function sampleCsvContent() {
    return "name,email,phone,course,source,city\nRahul Sharma,rahul@email.com,9876543210,JEE,Website,Pune\nPriya Patil,priya@email.com,9123456780,NEET,Walk-in,Nashik\n";
}

function sampleJsonContent() {
    return JSON.stringify(SAMPLE_ROWS, null, 2);
}

export async function GET(req: NextRequest) {
    try {
        const format = (req.nextUrl.searchParams.get("format") ?? "csv").toLowerCase();

        if (format === "csv") {
            return new NextResponse(sampleCsvContent(), {
                status: 200,
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": "attachment; filename=lead-import-sample.csv",
                },
            });
        }

        if (format === "json") {
            return new NextResponse(sampleJsonContent(), {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Content-Disposition": "attachment; filename=lead-import-sample.json",
                },
            });
        }

        const worksheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        const fileBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=lead-import-sample.xlsx",
            },
        });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const dryRun = String(formData.get("dryRun") ?? "false").toLowerCase() === "true";

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: { code: "FILE_REQUIRED", message: "Upload file is required" } },
                { status: 400 }
            );
        }

        const fileName = file.name.toLowerCase();
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        let rows: ParsedRow[] = [];
        if (fileName.endsWith(".csv")) {
            rows = parseCsv(fileBuffer);
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            rows = parseXlsx(fileBuffer);
        } else if (fileName.endsWith(".json")) {
            rows = parseJson(fileBuffer);
        } else {
            return NextResponse.json(
                { success: false, error: { code: "UNSUPPORTED_FILE_TYPE", message: "Only .xlsx, .csv, .json are supported" } },
                { status: 400 }
            );
        }

        const data = await leadService.importLeads(session.instituteId, rows, {
            createdBy: session.userId,
            dryRun,
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}


