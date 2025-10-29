// app/components/crud/CrudPagination.tsx

"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

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
  return (
    <Pagination>
      <PaginationContent className="flex justify-center gap-2 mt-4">
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

        <span className="text-sm text-muted-foreground px-2">
          Page {page} of {totalPages}
        </span>

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
