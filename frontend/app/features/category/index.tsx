// app/features/category/index.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "~/features/category/categoryApi";
import { CrudDataTable } from "@/components/crud";
import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CirclePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";

export default function CategoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const { data, isLoading } = useGetCategoriesQuery({ page, limit });

  const categoryData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  const handleToggleActive = async (category: any) => {
    try {
      await updateCategory({
        id: category._id,
        isActive: !category.isActive,
      }).unwrap();
      toast.success(
        `Category "${category.name}" has been ${
          category.isActive ? "deactivated" : "activated"
        }.`
      );
    } catch (error) {
      toast.error("Failed to update category status.");
    }
  };

  // The function to perform the delete, passed to CrudDataTable
  const handleDelete = async (item: any) => {
    try {
      await deleteCategory(item._id).unwrap();
      toast.success("Category deleted successfully");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const columns: ColumnDef<any>[] = [
    // ... other columns (select, image, name, etc.)
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      // Updated the "Active" column with a sortable header
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Active
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Switch
          className="cursor-pointer"
          checked={row.original.isActive}
          onCheckedChange={() => handleToggleActive(row.original)}
          aria-label="Toggle category status"
        />
      ),
    },
    {
      accessorKey: "createdBy.name",
      header: ({ column }) => (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.createdBy?.name || "N/A",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(`/admin/category/edit/${category._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(category)
                }
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-0 space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => navigate("/admin/category/create")}>
          <CirclePlus /> Add Category
        </Button>
      </div>
      <CrudDataTable
        data={categoryData}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        pageSize={limit}
        onPageSizeChange={handlePageSizeChange}
        onDelete={handleDelete} // Pass the delete handler
        deleteItemNameKey="Record" // Specify the key for the item's name
      />
    </div>
  );
}
