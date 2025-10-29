// app/features/category/CategoryFormPage.tsx
"use client";

import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
} from "./categoryApi";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { ImageIcon, UploadIcon, XIcon, AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface CategoryFormPageProps {
  mode?: "create" | "edit";
}

export default function CategoryFormPage({
  mode: forcedMode,
}: CategoryFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const mode = forcedMode ?? (id ? "edit" : "create");
  const { data } = useGetCategoryByIdQuery(id!, { skip: !id });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const { data: categories } = useGetCategoriesQuery({ page: 1, limit: 100 });

  const [form, setForm] = useState({
    name: "",
    description: "",
    parentCategory: "",
    isActive: true,
    isFeatured: false,
    showInMenu: false,
    seo: { metaTitle: "", metaDescription: "", metaKeywords: "" },
  });

  // File upload
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const previewUrl = files[0]?.preview || data?.data?.image || null;

  useEffect(() => {
    if (data?.data) {
      setForm({
        name: data.data.name,
        description: data.data.description || "",
        parentCategory: data.data.parentCategory || "",
        isActive: data.data.isActive,
        isFeatured: data.data.isFeatured,
        showInMenu: data.data.showInMenu,
        seo: {
          metaTitle: data.data.seo?.metaTitle || "",
          metaDescription: data.data.seo?.metaDescription || "",
          metaKeywords: (data.data.seo?.metaKeywords || []).join(", "),
        },
      });
    }
  }, [data]);

  // Handle text and SEO input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        seo: { ...prev.seo, [seoField]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Fixed handleSubmit with FormData support
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      if (form.parentCategory && form.parentCategory !== "none")
        formData.append("parentCategory", form.parentCategory);

      formData.append("isActive", String(form.isActive));
      formData.append("isFeatured", String(form.isFeatured));
      formData.append("showInMenu", String(form.showInMenu));

      formData.append("seo[metaTitle]", form.seo.metaTitle);
      formData.append("seo[metaDescription]", form.seo.metaDescription);
      formData.append("seo[metaKeywords]", form.seo.metaKeywords);

      if (files.length > 0) {
        formData.append("image", files[0].file);
      }

      if (mode === "create") {
        await createCategory(formData).unwrap();
        toast.success("✅ Category created successfully");
      } else {
        await updateCategory({ id, formData }).unwrap();
        toast.success("✅ Category updated successfully");
      }

      navigate("/admin/category");
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Something went wrong while saving category");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {mode === "edit" ? "Edit Category" : "Create Category"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Category Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Parent Category</Label>
            <Select
              value={form.parentCategory}
              onValueChange={(val) =>
                setForm((p) => ({ ...p, parentCategory: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories?.data?.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Enter category description"
            />
          </div>
        </div>

        <Separator />

        {/* IMAGE UPLOAD */}
        <div>
          <Label>Category Image</Label>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors data-[dragging=true]:bg-accent/50"
          >
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload image file"
            />
            {previewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img
                  src={previewUrl}
                  alt="Category"
                  className="mx-auto max-h-full rounded"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div className="mb-2 flex size-11 items-center justify-center rounded-full border bg-background">
                  <ImageIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">
                  Drop your image here
                </p>
                <p className="text-xs text-muted-foreground">
                  SVG, PNG, JPG or GIF (max. 2MB)
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={openFileDialog}
                  type="button"
                >
                  <UploadIcon className="size-4 opacity-60 mr-2" /> Select Image
                </Button>
              </div>
            )}

            {previewUrl && (
              <button
                type="button"
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full size-8 flex items-center justify-center"
                onClick={() => removeFile(files[0]?.id)}
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>

          {errors.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-2">
              <AlertCircleIcon className="size-3" />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* BOOLEAN SWITCHES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: "isActive", label: "Active" },
            { key: "isFeatured", label: "Featured" },
            { key: "showInMenu", label: "Show in Menu" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={(form as any)[key]}
                onCheckedChange={(val) =>
                  setForm((p) => ({ ...p, [key]: val }))
                }
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* SEO SECTION */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SEO Settings</h3>
          <Input
            name="seo.metaTitle"
            value={form.seo.metaTitle}
            onChange={handleChange}
            placeholder="Meta Title"
          />
          <Textarea
            name="seo.metaDescription"
            rows={3}
            value={form.seo.metaDescription}
            onChange={handleChange}
            placeholder="Meta Description"
          />
          <Input
            name="seo.metaKeywords"
            value={form.seo.metaKeywords}
            onChange={handleChange}
            placeholder="Meta Keywords (comma separated)"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/category")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === "edit" ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
