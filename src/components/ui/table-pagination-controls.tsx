"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type TablePaginationControlsProps = {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    className?: string;
};

export function TablePaginationControls({
    page,
    pageSize,
    totalItems,
    onPageChange,
    className,
}: TablePaginationControlsProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (totalItems <= pageSize) {
        return null;
    }

    const previousDisabled = page <= 1;
    const nextDisabled = page >= totalPages;

    return (
        <div className={className}>
            <div className="mb-2 text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
            </div>
            <Pagination className="justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                if (!previousDisabled) {
                                    onPageChange(page - 1);
                                }
                            }}
                            aria-disabled={previousDisabled}
                            className={previousDisabled ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <span className="px-3 text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                if (!nextDisabled) {
                                    onPageChange(page + 1);
                                }
                            }}
                            aria-disabled={nextDisabled}
                            className={nextDisabled ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
