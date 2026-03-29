// "use client";

// import { ReactNode, useMemo, useState } from "react";
// import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";

// export type Column<T> = {
//     header: string;
//     accessor?: keyof T;
//     cell?: (row: T, index: number) => ReactNode;
//     className?: string;
//     sortable?: boolean;
//     type?: "text" | "badge" | "date" | "actions";
//     tooltip?: boolean;
//     hoverCard?: boolean;
//     sortValue?: (row: T, index: number) => string | number | boolean | Date | null | undefined;
//     tooltipContent?: (row: T, index: number) => ReactNode;
//     hoverCardContent?: (row: T, index: number) => ReactNode;
// };

// type SortDirection = "asc" | "desc";

// type TableWidgetProps<T> = {
//     columns: Column<T>[];
//     data: T[];
//     className?: string;
//     rowKey?: (row: T, index: number) => string;
// };

// export default function TableWidget<T>({
//     columns,
//     data,
//     className,
//     rowKey,
// }: TableWidgetProps<T>) {
//     const [sort, setSort] = useState<{ key: keyof T; direction: SortDirection } | null>(null);

//     const sortedData = useMemo(() => {
//         if (!sort) return data;

//         const sortColumn = columns.find((column) => column.header === sort.key);
//         if (!sortColumn) return data;

//         return [...data].sort((a, b) => {
//             const aIndex = data.indexOf(a);
//             const bIndex = data.indexOf(b);
//             const aVal = sortColumn.sortValue
//                 ? sortColumn.sortValue(a, aIndex)
//                 : sortColumn.accessor
//                     ? a[sortColumn.accessor]
//                     : null;
//             const bVal = sortColumn.sortValue
//                 ? sortColumn.sortValue(b, bIndex)
//                 : sortColumn.accessor
//                     ? b[sortColumn.accessor]
//                     : null;

//             if (aVal == null && bVal == null) return 0;
//             if (aVal == null) return sort.direction === "asc" ? -1 : 1;
//             if (bVal == null) return sort.direction === "asc" ? 1 : -1;
//             if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
//             if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [columns, data, sort]);

//     const toggleSort = (column: Column<T>) => {
//         if (column.type === "actions" || column.sortable === false) return;

//         const sortKey = column.header;
//         setSort((current) => {
//             if (!current || current.key !== sortKey) {
//                 return { key: sortKey as keyof T, direction: "asc" };
//             }

//             if (current.direction === "asc") {
//                 return { key: sortKey as keyof T, direction: "desc" };
//             }

//             return null;
//         });
//     };

//     const getSortIcon = (column: Column<T>) => {
//         if (column.type === "actions" || column.sortable === false) return null;
//         if (!sort || sort.key !== column.header) return <ArrowUpDown className="h-3.5 w-3.5" />;
//         return sort.direction === "asc"
//             ? <ArrowUp className="h-3.5 w-3.5" />
//             : <ArrowDown className="h-3.5 w-3.5" />;
//     };

//     const renderCellContent = (column: Column<T>, row: T, index: number) => {
//         const baseContent = column.cell
//             ? column.cell(row, index)
//             : column.accessor
//                 ? (row[column.accessor] as ReactNode) ?? null
//                 : null;

//         const wrappedContent = (
//             <span className="inline-flex min-w-0 items-center">
//                 {baseContent}
//             </span>
//         );

//         if (column.hoverCard) {
//             return (
//                 <HoverCard>
//                     <HoverCardTrigger asChild>
//                         <span className="inline-flex min-w-0 cursor-pointer">{wrappedContent}</span>
//                     </HoverCardTrigger>
//                     <HoverCardContent>
//                         {column.hoverCardContent ? column.hoverCardContent(row, index) : baseContent}
//                     </HoverCardContent>
//                 </HoverCard>
//             );
//         }

//         if (column.tooltip) {
//             return (
//                 <Tooltip>
//                     <TooltipTrigger asChild>
//                         <span className="inline-flex min-w-0 cursor-help">{wrappedContent}</span>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                         {column.tooltipContent ? column.tooltipContent(row, index) : baseContent}
//                     </TooltipContent>
//                 </Tooltip>
//             );
//         }

//         return baseContent;
//     };

//     return (
//         <TooltipProvider>
//             <div className={cn("overflow-x-auto", className)}>
//                 <Table>
//                     <TableHeader>
//                         <TableRow>
//                             {columns.map((column) => (
//                                 <TableHead key={column.header} className={column.className}>
//                                     {column.type !== "actions" && column.sortable !== false ? (
//                                         <Button
//                                             type="button"
//                                             variant="ghost"
//                                             size="sm"
//                                             className="-ml-3 h-8 gap-1 px-3 font-medium"
//                                             onClick={() => toggleSort(column)}
//                                         >
//                                             <span>{column.header}</span>
//                                             {getSortIcon(column)}
//                                         </Button>
//                                     ) : (
//                                         column.header
//                                     )}
//                                 </TableHead>
//                             ))}
//                         </TableRow>
//                     </TableHeader>

//                     <TableBody>
//                         {sortedData.map((row, index) => (
//                             <TableRow key={rowKey ? rowKey(row, index) : index}>
//                                 {columns.map((column) => (
//                                     <TableCell key={column.header} className={column.className}>
//                                         {renderCellContent(column, row, index)}
//                                     </TableCell>
//                                 ))}
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </div>
//         </TooltipProvider>
//     );
// }


"use client";

import { ReactNode, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */

type Align = "left" | "center" | "right";
type SortDirection = "asc" | "desc";

export type Column<T> = {
    header: string;
    accessor?: keyof T;
    cell?: (row: T, index: number) => ReactNode;

    align?: Align;
    className?: string;

    sortable?: boolean;
    type?: "text" | "badge" | "date" | "actions";

    tooltip?: boolean;
    hoverCard?: boolean;

    sortValue?: (
        row: T,
        index: number
    ) => string | number | boolean | Date | null | undefined;

    tooltipContent?: (row: T, index: number) => ReactNode;
    hoverCardContent?: (row: T, index: number) => ReactNode;
};

type TableWidgetProps<T> = {
    columns: Column<T>[];
    data: T[];
    className?: string;
    rowKey?: (row: T, index: number) => string;
};

/* ================= HELPERS ================= */

const getAlignmentClass = (align?: Align) => {
    switch (align) {
        case "center":
            return "text-center";
        case "right":
            return "text-right";
        default:
            return "text-left";
    }
};

const getJustifyClass = (align?: Align) => {
    switch (align) {
        case "center":
            return "justify-center w-full";
        case "right":
            return "justify-end w-full";
        default:
            return "justify-start";
    }
};

/* ================= COMPONENT ================= */

export default function TableWidget<T>({
    columns,
    data,
    className,
    rowKey,
}: TableWidgetProps<T>) {
    const [sort, setSort] = useState<{
        accessor: keyof T;
        direction: SortDirection;
    } | null>(null);

    /* ================= SORT ================= */

    const sortedData = useMemo(() => {
        if (!sort) return data;

        const column = columns.find((col) => col.accessor === sort.accessor);
        if (!column) return data;

        return [...data].sort((a, b) => {
            const aIndex = data.indexOf(a);
            const bIndex = data.indexOf(b);

            const aVal = column.sortValue
                ? column.sortValue(a, aIndex)
                : column.accessor
                    ? a[column.accessor]
                    : null;

            const bVal = column.sortValue
                ? column.sortValue(b, bIndex)
                : column.accessor
                    ? b[column.accessor]
                    : null;

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sort.direction === "asc" ? -1 : 1;
            if (bVal == null) return sort.direction === "asc" ? 1 : -1;

            if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;

            return 0;
        });
    }, [columns, data, sort]);

    const toggleSort = (column: Column<T>) => {
        if (!column.accessor || column.type === "actions" || column.sortable === false) return;

        setSort((current) => {
            if (!current || current.accessor !== column.accessor) {
                return { accessor: column.accessor!, direction: "asc" };
            }

            if (current.direction === "asc") {
                return { accessor: column.accessor!, direction: "desc" };
            }

            return null;
        });
    };

    const getSortIcon = (column: Column<T>) => {
        if (!column.accessor || column.type === "actions" || column.sortable === false) return null;

        if (!sort || sort.accessor !== column.accessor) {
            return <ArrowUpDown className="h-3.5 w-3.5" />;
        }

        return sort.direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
        ) : (
            <ArrowDown className="h-3.5 w-3.5" />
        );
    };

    /* ================= CELL RENDER ================= */

    const renderCellContent = (column: Column<T>, row: T, index: number) => {
        const baseContent = column.cell
            ? column.cell(row, index)
            : column.accessor
                ? (row[column.accessor] as ReactNode) ?? null
                : null;

        const alignedWrapper = (
            <span
                className={cn(
                    "inline-flex min-w-0 w-full",
                    getJustifyClass(column.align)
                )}
            >
                {baseContent}
            </span>
        );

        if (column.hoverCard) {
            return (
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <span className="cursor-pointer w-full">{alignedWrapper}</span>
                    </HoverCardTrigger>
                    <HoverCardContent>
                        {column.hoverCardContent
                            ? column.hoverCardContent(row, index)
                            : baseContent}
                    </HoverCardContent>
                </HoverCard>
            );
        }

        if (column.tooltip) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-help w-full">{alignedWrapper}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        {column.tooltipContent
                            ? column.tooltipContent(row, index)
                            : baseContent}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return alignedWrapper;
    };

    /* ================= RENDER ================= */

    return (
        <TooltipProvider>
            <div className={cn("overflow-x-auto", className)}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.header}
                                    className={cn(
                                        getAlignmentClass(column.align),
                                        column.className
                                    )}
                                >
                                    {column.type !== "actions" && column.sortable !== false ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSort(column)}
                                            className={cn(
                                                "-ml-3 h-8 gap-1 px-3 font-medium flex",
                                                getJustifyClass(column.align)
                                            )}
                                        >
                                            <span>{column.header}</span>
                                            {getSortIcon(column)}
                                        </Button>
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {sortedData.map((row, index) => (
                            <TableRow key={rowKey ? rowKey(row, index) : index}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.header}
                                        className={cn(
                                            getAlignmentClass(column.align),
                                            column.className
                                        )}
                                    >
                                        {renderCellContent(column, row, index)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}