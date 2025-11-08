// app/features/category/CategoryFormPage.tsx

"use client";

import { CrudForm, type FieldConfig } from "@/components/crud/CrudForm"; // ✅ Import FieldConfig type
import { useParams, useNavigate } from "react-router";
import {
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
} from "./categoryApi";
import { toast } from "sonner";

function formatCategoryData(category: any) {
  if (!category) return {};

  return {
    name: category.name || "",
    description: category.description || "",
    parentCategory:
      category.parentCategory?._id || category.parentCategory || "none",
    image: category.image || null,
    isActive: category.isActive ?? false,
    isFeatured: category.isFeatured ?? false,
    showInMenu: category.showInMenu ?? false,
    "seo[metaTitle]": category.seo?.metaTitle || "",
    "seo[metaDescription]": category.seo?.metaDescription || "",
    "seo[metaKeywords]": category.seo?.metaKeywords || "",
  };
}

interface CategoryFormPageProps {
  mode?: "create" | "edit";
}

export default function CategoryFormPage({
  mode: forcedMode,
}: CategoryFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const mode = forcedMode ?? (id ? "edit" : "create");

  // queries & mutations
  const { data } = useGetCategoryByIdQuery(id!, { skip: !id });
  const { data: categories } = useGetCategoriesQuery({ page: 1, limit: 100 });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  // ✅ Explicitly type your field configuration
  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Category Name",
      type: "text",
      placeholder: "Enter category name",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter category description",
    },
    {
      name: "parentCategory",
      label: "Parent Category",
      type: "select",
      placeholder: "Select parent category",
      options: [
        { value: "none", label: "None" },
        ...(categories?.data?.map((c: any) => ({
          value: c._id,
          label: c.name,
        })) ?? []),
      ],
    },
    { type: "image", name: "image", label: "Category Image" },
    { type: "section", sectionTitle: "Visibility" },
    { name: "isActive", label: "Active", type: "boolean" },
    { name: "isFeatured", label: "Featured", type: "boolean" },
    { name: "showInMenu", label: "Show in Menu", type: "boolean" },
    { type: "section", sectionTitle: "SEO Settings" },
    {
      name: "seo[metaTitle]",
      label: "Meta Title",
      type: "text",
      placeholder: "SEO title for this category",
    },
    {
      name: "seo[metaDescription]",
      label: "Meta Description",
      type: "textarea",
      placeholder: "SEO description",
    },
    {
      name: "seo[metaKeywords]",
      label: "Meta Keywords",
      type: "text",
      placeholder: "e.g. electronics, gadgets",
    },
  ];

  // handle create/update
  const handleSubmit = async (formData: FormData) => {
    try {
      if (mode === "create") {
        await createCategory(formData).unwrap();
        toast.success("✅ Category created successfully!");
      } else {
        await updateCategory({ id, formData }).unwrap();
        toast.success("✅ Category updated successfully!");
      }
      navigate("/admin/category");
    } catch (error) {
      toast.error("❌ Something went wrong while saving the category.");
    }
  };

  return (
    <CrudForm
      title={mode === "edit" ? "Edit Category" : "Create Category"}
      fields={fields}
      defaultValues={data ? formatCategoryData(data.data) : {}}
      mode={mode}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin/category")}
      submitLabel={mode === "edit" ? "Update Category" : "Create Category"}
    />
  );
}
