// app/features/category/form.tsx

"use client";

import { CrudForm, type FieldConfig } from "@/components/forms/CrudForm";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "./data/categoryApi";
import { toast } from "sonner";

export default function CategoryForm({ category, isEdit = false }: any) {
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const fields: FieldConfig[] = [
    { name: "name", label: "Category Name", type: "text", required: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe this category",
    },
    { name: "isActive", label: "Active", type: "boolean" },
    { name: "isFeatured", label: "Featured", type: "boolean" },
    { name: "showInMenu", label: "Show in Menu", type: "boolean" },
    { name: "image", label: "Category Image", type: "image" },
  ];

  const handleSubmit = async (formData: FormData, actionType?: string) => {
    try {
      if (isEdit || id) {
        await updateCategory({ id: id || category._id, data: formData }).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully!");
        if (actionType === "create_another") return;
      }
      navigate("/admin/category");
    } catch {
      toast.error("Failed to save category.");
    }
  };

  return (
    <CrudForm
      title={isEdit ? "Edit Category" : "Create Category"}
      fields={fields}
      defaultValues={category || {}}
      mode={isEdit ? "edit" : "create"}
      entityLabel="Category"
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin/category")}
    />
  );
}
