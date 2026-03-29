import { Check, X } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type StrategicRow = {
    area: string;
    onCampus: string;
    crm: string;
    manual: string;
};

const rows: StrategicRow[] = [
    {
        area: "Admission workflow",
        onCampus: "Built for enquiry-to-admission flow out of the box",
        crm: "Needs heavy customization for academic workflows",
        manual: "Manual updates and fragmented tracking",
    },
    {
        area: "WhatsApp usage",
        onCampus: "Integrated alerts and business number support",
        crm: "Requires connectors or third-party tools",
        manual: "Ad hoc chats without unified tracking",
    },
    {
        area: "Setup time",
        onCampus: "Go live quickly with institute-focused defaults",
        crm: "Long setup with pipelines and automation",
        manual: "Quick start but no scalable structure",
    },
    {
        area: "Ease of use",
        onCampus: "Simple, role-based workflow for teams",
        crm: "General-purpose UI with learning curve",
        manual: "Familiar but inconsistent process",
    },
    {
        area: "Scaling",
        onCampus: "Handles multi-user ownership and high volume",
        crm: "Scales but cost and complexity increase",
        manual: "Breaks with team growth and volume",
    },
];

export default function StrategicComparisonSection() {
    return (
        <section className="mt-16 space-y-5">
            <h3 className="text-2xl font-semibold">
                Why institutes switch to Classes360
            </h3>

            <div className="overflow-hidden rounded-lg border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[160px]">Category</TableHead>
                            <TableHead className="min-w-[220px] font-semibold text-primary">
                                Classes360
                            </TableHead>
                            <TableHead className="min-w-[220px]">
                                Generic CRM
                            </TableHead>
                            <TableHead className="min-w-[220px]">
                                Spreadsheet + WhatsApp
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.area}>
                                <TableCell className="font-medium align-top">
                                    {row.area}
                                </TableCell>

                                <TableCell className="bg-muted/30 max-w-[220px] align-top">
                                    <Cell type="positive" text={row.onCampus} />
                                </TableCell>

                                <TableCell className="max-w-[220px] align-top">
                                    <Cell type="neutral" text={row.crm} />
                                </TableCell>

                                <TableCell className="max-w-[220px] align-top">
                                    <Cell type="negative" text={row.manual} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}

function Cell({
    type,
    text,
}: {
    type: "positive" | "neutral" | "negative";
    text: string;
}) {
    return (
        <div className="flex items-start gap-2 text-sm leading-5">
            {type === "positive" && (
                <Check className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
            )}

            {type === "negative" && (
                <X className="mt-0.5 h-4 w-4 text-red-500 shrink-0" />
            )}

            {type === "neutral" && (
                <span className="mt-0.5 h-4 w-4 text-xs text-muted-foreground shrink-0">
                    •
                </span>
            )}

            <span
                className={`line-clamp-3 break-words ${type === "negative" ? "text-muted-foreground" : ""
                    }`}
            >
                {text}
            </span>
        </div>
    );
}