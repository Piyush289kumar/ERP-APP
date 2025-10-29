// app/features/category/index.tsx

"use client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "./categoryApi";
import { CrudTable, CrudPagination } from "@/components/crud";
import React from "react";

export default function CategoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const { data, isLoading, refetch } = useGetCategoriesQuery({ page });
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDelete = async (row: any) => {
    try {
      await deleteCategory(row._id).unwrap();
      toast.success("Category deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => navigate("/admin/category/create")}>
          + Add Category
        </Button>
      </div>

      <CrudTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        onEdit={(row) => navigate(`/admin/category/edit/${row._id}`)}
        onDelete={handleDelete}
      />

      {data?.total && (
        <CrudPagination
          page={page}
          totalPages={Math.ceil(data.total / 20)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
