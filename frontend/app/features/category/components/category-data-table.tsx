// app/components/crud/category-data-table.tsx

"use client";
import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  GitCompare,
  Loader2,
  TriangleAlertIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryPagination } from "./category-pagination";
import { RowsPerPageDropdownMenu } from "./row-per-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { toast } from "sonner";

// Define props for the generic data table
interface CategoryDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchKey: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void; // Define the function signature
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onDelete?: (item: TData) => Promise<void>;
  deleteItemNameKey?: keyof TData;
  onTableReady?: (table: any) => void;
}

export function CategoryDataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchKey,
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  onDelete,
  deleteItemNameKey = "record" as keyof TData,
  onTableReady,
}: CategoryDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // State for delete confirmation dialog

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<TData | null>(null);

  // Function to open the dialog, will be passed via meta
  const openDeleteDialog = (item: TData) => {
    if (!onDelete) return; // Don't open if no handler is provided
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const [isDeleting, setIsDeleting] = React.useState(false); // ✅ Add loading state

  // ✅ Function to confirm and execute deletion with loading toast
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !onDelete) return;

    // Capture category name for better UX
    const name = (itemToDelete as any)[deleteItemNameKey] || "this category";

    setIsDeleting(true); // start local spinner

    // Use sonner.promise for better feedback
    await toast.promise(onDelete(itemToDelete), {
      loading: `Deleting ${name}...`,
      success: `${name} deleted successfully!`,
      error: `Failed to delete ${name}.`,
    });

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: totalPages,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      openDeleteDialog,
    },
  });

  // ✅ Notify parent once table is ready
  React.useEffect(() => {
    if (onTableReady) onTableReady(table);
  }, [table, onTableReady]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter by ${searchKey}...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              View <GitCompare />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state with skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // No results state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        {/* Left: Selected row count */}
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {/* Center: Rows per page dropdown */}
        <div className="flex justify-center">
          {/* 2. Pass the props down */}
          <RowsPerPageDropdownMenu
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
        {/* Right: Pagination controls */}
        <div className="flex justify-end">
          <CategoryPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            // prevent closing while deleting
            setItemToDelete(null);
          }
          setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
              <TriangleAlertIcon className="text-destructive size-6" />
            </div>

            <AlertDialogTitle>
              Delete this category:{" "}
              <span className="font-semibold text-destructive">
                {itemToDelete
                  ? ((itemToDelete as any)[deleteItemNameKey] ?? "Unknown")
                  : "Unknown"}
              </span>
              ?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center text-muted-foreground">
              You are about to delete this category permanently.
              <br />
              This action <strong>cannot</strong> be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting} // ✅ prevent cancel during deletion
              onClick={() => setItemToDelete(null)}
              className="cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive text-white cursor-pointer min-w-[120px] justify-center"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
