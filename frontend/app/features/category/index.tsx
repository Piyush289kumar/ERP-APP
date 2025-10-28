// app/features/category/index.tsx

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useGetCategoriesQuery, useDeleteCategoryMutation } from "./categoryApi";
import Table from "./components/Table";
// import Pagination from "./components/Pagination";
import { toast } from "sonner";
import { Pagination } from "~/components/ui/pagination";

export default function CategoryPage() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetCategoriesQuery({});
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => navigate("/admin/category/create")}>+ Add Category</Button>
      </div>

      <Table
        categories={data?.data || []}
        loading={isLoading}
        onEdit={(id) => navigate(`/admin/category/edit/${id}`)}
        onDelete={handleDelete}
      />

      <Pagination />
    </div>
  );
}
