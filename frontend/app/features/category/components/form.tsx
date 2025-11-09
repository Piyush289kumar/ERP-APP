// app/features/category/components/form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ImageIcon,
  UploadIcon,
  XIcon,
  AlertCircleIcon,
  Loader2,
} from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoryByIdQuery,
} from "../data/categoryApi";

export default function CategoryForm({ mode = "create" }: { mode?: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === "edit" || !!id;

  // ✅ Fetch category only when editing
  const { data: categoryData, isLoading: loadingCategory } =
    useGetCategoryByIdQuery(id, { skip: !isEdit });

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [values, setValues] = useState({
    name: "",
    description: "",
    isActive: true,
    isFeatured: false,
    showInMenu: false,
    image: null,
  });

  // ✅ Populate form when category data loads
  useEffect(() => {
    if (categoryData?.data) {
      const category = categoryData.data;
      setValues({
        name: category.name || "",
        description: category.description || "",
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
        showInMenu: category.showInMenu ?? false,
        image: category.image || null,
      });
    }
  }, [categoryData]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif",
    maxSize: 2 * 1024 * 1024,
  });

  const previewUrl = files?.[0]?.preview || values?.image || null;

  const handleChange = (name: string, value: any) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent, actionType: string = "save") => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    try {
      for (const key in values) {
        const val = values[key as keyof typeof values];
        if (val !== undefined && val !== null) {
          formData.append(key, String(val));
        }
      }

      if (files.length > 0 && files[0].file instanceof Blob) {
        formData.append("image", files[0].file as Blob, files[0].file.name);
      } else if (!values.image) {
        formData.append("removeImage", "true");
      }

      if (isEdit) {
        await updateCategory({ id, formData }).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully!");
        if (actionType === "create_another") {
          setValues({
            name: "",
            description: "",
            isActive: true,
            isFeatured: false,
            showInMenu: false,
            image: null,
          });
          return;
        }
      }

      navigate("/admin/category");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Show loader for edit mode
  if (loadingCategory && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading category details...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isEdit ? "Edit Category" : "Create Category"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit
            ? "Update existing category details below."
            : "Fill out the form to create a new category."}
        </p>
      </header>

      <form id="category-form" onSubmit={(e) => handleSubmit(e, "create")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Basic category details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={values.name}
                    placeholder="Enter category name"
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Enter short description"
                    value={values.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "isActive", label: "Active" },
                  { name: "isFeatured", label: "Featured" },
                  { name: "showInMenu", label: "Show in Menu" },
                ].map((field) => (
                  <div
                    key={field.name}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Switch
                      id={field.name}
                      checked={!!values[field.name as keyof typeof values]}
                      onCheckedChange={(checked) =>
                        handleChange(field.name, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition ${
                    isDragging ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <input {...getInputProps()} className="sr-only" />
                  {previewUrl ? (
                    <div className="relative w-full h-56 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-full rounded-lg object-cover shadow-sm"
                      />
                      <button
                        type="button"
                        className="absolute top-3 right-3 bg-black/70 text-white rounded-full p-2"
                        onClick={() => {
                          if (files.length > 0) removeFile(files[0]?.id);
                          setValues((prev) => ({ ...prev, image: null }));
                        }}
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <ImageIcon className="h-8 w-8 mb-2 opacity-70" />
                      <p className="text-sm">Drop your image here or</p>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={openFileDialog}
                        className="mt-2"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                    </div>
                  )}
                </div>
                {errors.length > 0 && (
                  <div className="text-xs text-destructive mt-1 flex gap-1 items-center">
                    <AlertCircleIcon className="h-3 w-3" />
                    <span>{errors[0]}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 pt-6">
          {isEdit ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "create")}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "create_another")}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create & Create Another"
                )}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate("/admin/category")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
