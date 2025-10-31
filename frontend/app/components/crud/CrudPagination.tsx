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
// The interface must include all props that the component will use or pass down.
interface CrudPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}
export function CrudPagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: CrudPaginationProps) {
  // Function to generate the list of page numbers to display
  const getPagesToShow = () => {
    const pages = [];
    const delta = 1; // How many pages to show around the current page
    if (totalPages > 0) pages.push(1);
    if (page > delta + 2) {
      pages.push("...");
    }
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    if (page < totalPages - delta - 1) {
      pages.push("...");
    }
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    return pages;
  };
  const pagesToShow = getPagesToShow();
  return (
    <div className="flex w-full items-center justify-between">
      {/* Right Aligned: Pagination controls */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
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
      </div>
    </div>
  );
}
