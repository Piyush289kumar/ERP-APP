// app/components/crud/CrudPagination.tsx
"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RowsPerPageDropdownMenu } from "./RowsPerPageDropdownMenu";

interface CrudPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CrudPagination({
  page,
  totalPages,
  onPageChange,
}: CrudPaginationProps) {
  // Function to generate the list of page numbers to display
  const getPagesToShow = () => {
    const pages = [];
    const delta = 2; // How many pages to show around the current page

    // Always show the first page
    if (totalPages > 0) pages.push(1);

    // Add an ellipsis if there's a gap after the first page
    if (page > delta + 2) {
      pages.push("...");
    }

    // Add the pages around the current page
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Add an ellipsis if there's a gap before the last page
    if (page < totalPages - delta - 1) {
      pages.push("...");
    }

    // Always show the last page if it's not already included
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pagesToShow = getPagesToShow();

  return (
    <Pagination>
      <PaginationContent>
        <RowsPerPageDropdownMenu />
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {pagesToShow.map((p, index) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={page === p}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p as number);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            className={
              page === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
