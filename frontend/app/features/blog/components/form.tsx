// app/features/blog/components/form.tsx

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
import { ImageIcon, UploadIcon, XIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGetBlogBySlugQuery,
} from "../data/blogApi";
import { useGetCategoriesQuery } from "~/features/category/data/categoryApi";
import { RichTextEditor } from "~/components/crud/RichTextEditor";
import { Combobox } from "@/components/crud/Combobox";

// ✅ Validation helper
const validate = (values: any) => {
  const errors: Record<string, string> = {};
  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.short_description.trim())
    errors.short_description = "Short description is required.";
  if (!values.description.trim())
    errors.description = "Description is required.";
  return errors;
};

export default function BlogForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const slug = id; // ✅ Alias to keep rest of your code unchanged

  const isEdit = mode === "edit" || !!slug;

  // ✅ API Hooks
  const { data: blogData, isLoading: loadingBlog } = useGetBlogBySlugQuery(
    slug ?? "",
    {
      skip: !isEdit,
    }
  );

  const { data: categoryData } = useGetCategoriesQuery({ page: 1, limit: 100 });
  const [createBlog] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();

  // ✅ Local State
  const [values, setValues] = useState({
    title: "",
    category: "",
    short_description: "",
    description: "",
    thumbnail: null as string | null,
    gallery_images: [] as string[],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
    isActive: true,
    isFeature: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Prefill for Edit Mode
  // ✅ Prefill for Edit Mode
  useEffect(() => {
    if (blogData?.data) {
      const b = blogData.data;

      setValues({
        title: b.title || "",
        category:
          typeof b.category === "object" && b.category !== null
            ? (b.category as any)._id
            : (b.category as string) || "",
        short_description: b.short_description || "",
        description: b.description || "",
        thumbnail: b.thumbnail || null,
        gallery_images: b.gallery_images || [],
        seo: {
          metaTitle: b.seo?.metaTitle || "",
          metaDescription: b.seo?.metaDescription || "",
          metaKeywords: Array.isArray(b.seo?.metaKeywords)
            ? b.seo.metaKeywords.join(", ")
            : b.seo?.metaKeywords || "",
        },
        isActive: b.isActive ?? true,
        isFeature: b.isFeature ?? false,
      });

      // ✅ Prevent auto-replacement of old images by clearing temp uploads
      if (b.thumbnail) {
        thumbHandlers.clearFiles(); // clears any temporary thumbnail uploads
      }
      if (b.gallery_images?.length) {
        galleryHandlers.clearFiles(); // clears any temporary gallery uploads
      }
    }
  }, [blogData]);

  // ✅ File Upload Hooks
  const [
    { files: thumbFiles, isDragging: thumbDrag, errors: thumbErrors },
    thumbHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 3 * 1024 * 1024 });

  const [
    { files: galleryFiles, isDragging: galleryDrag, errors: galleryErrors },
    galleryHandlers,
  ] = useFileUpload({
    accept: "image/*",
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  });

  const thumbPreview = thumbFiles?.[0]?.preview || values.thumbnail || null;
  const galleryPreviews = [
    ...(values.gallery_images || []), // Existing images from DB
    ...galleryFiles.map((f) => f.preview), // Newly uploaded images
  ];

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Remove gallery image (works for both existing and new)
  const handleRemoveGalleryImage = (src: string) => {
    if (values.gallery_images.includes(src)) {
      // Existing image (Cloudinary URL)
      setValues((prev) => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((img) => img !== src),
      }));
    } else {
      // New uploaded image
      const fileToRemove = galleryFiles.find((f) => f.preview === src);
      if (fileToRemove) galleryHandlers.removeFile(fileToRemove.id);
    }
  };

  // ✅ Submit Handler
  const handleSubmit = async (e: React.FormEvent, actionType = "save") => {
    e.preventDefault();

    const newErrors = validate(values);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title.trim());
      formData.append("short_description", values.short_description.trim());
      formData.append("description", values.description.trim());
      formData.append("isActive", String(values.isActive));
      formData.append("isFeature", String(values.isFeature));
      if (values.category) formData.append("category", values.category);

      if (thumbFiles.length > 0)
        formData.append("thumbnail", thumbFiles[0].file as Blob);
      if (galleryFiles.length > 0)
        galleryFiles.forEach((file) =>
          formData.append("gallery_images", file.file as Blob)
        );

      formData.append("seo[metaTitle]", values.seo.metaTitle);
      formData.append("seo[metaDescription]", values.seo.metaDescription);
      formData.append("seo[metaKeywords]", values.seo.metaKeywords);

      if (isEdit && slug) {
        await updateBlog({ slug: slug!, formData }).unwrap();

        toast.success("Blog updated successfully!");
      } else if (isEdit && !slug) {
        toast.error("Missing blog slug for update.");
      } else {
        await createBlog(formData).unwrap();
        toast.success("Blog created successfully!");

        if (actionType === "create_another") {
          setValues({
            title: "",
            category: "",
            short_description: "",
            description: "",
            thumbnail: null,
            gallery_images: [],
            seo: { metaTitle: "", metaDescription: "", metaKeywords: "" },
            isActive: true,
            isFeature: false,
          });
          setErrors({});
          return;
        }
      }

      navigate("/admin/blog");
    } catch (err: any) {
      const server = err?.data ?? {};
      if (server?.errors) {
        setErrors((prev) => ({ ...prev, ...server.errors }));
        toast.error(
          server.message ||
            "Validation failed. Please fix the highlighted fields."
        );
      } else if (server?.message) {
        toast.error(server.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBlog && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading blog details...
        </span>
      </div>
    );
  }

  const categoryOptions =
    categoryData?.data?.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  // ✅ UI
  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Blog" : "Create Blog"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing blog details below."
            : "Fill out the form to create a new blog post."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Enter blog details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="mb-2">Title</Label>
                  <Input
                    value={values.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter blog title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label className="mb-2">Category</Label>
                  <Combobox
                    options={categoryOptions}
                    value={values.category}
                    onChange={(v) => handleChange("category", v)}
                    placeholder="Select category..."
                  />
                </div>

                {/* Short Description */}
                <div>
                  <Textarea
                    value={values.short_description}
                    onChange={(e) =>
                      handleChange("short_description", e.target.value)
                    }
                    placeholder="Enter short description..."
                    className={errors.short_description ? "border-red-500" : ""}
                  />
                  {errors.short_description && (
                    <p className="text-xs text-red-500">
                      {errors.short_description}
                    </p>
                  )}
                </div>

                {/* Rich Description */}
                <div>
                  <RichTextEditor
                    value={values.description}
                    onChange={(v) => handleChange("description", v)}
                    error={errors.description}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO SECTION */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2">Meta Title</Label>
                  <Input
                    value={values.seo.metaTitle}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaTitle: e.target.value },
                      }))
                    }
                    placeholder="Enter meta title"
                  />
                </div>
                <div>
                  <Label className="mb-2">Meta Description</Label>
                  <Textarea
                    value={values.seo.metaDescription}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaDescription: e.target.value },
                      }))
                    }
                    placeholder="Enter meta description"
                  />
                </div>
                <div>
                  <Label className="mb-2">
                    Meta Keywords (comma separated)
                  </Label>
                  <Input
                    value={values.seo.metaKeywords}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaKeywords: e.target.value },
                      }))
                    }
                    placeholder="keyword1, keyword2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label className="mb-2">Active</Label>
                  <Switch
                    checked={values.isActive}
                    onCheckedChange={(v) => handleChange("isActive", v)}
                  />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label className="mb-2">Featured</Label>
                  <Switch
                    checked={values.isFeature}
                    onCheckedChange={(v) => handleChange("isFeature", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={thumbHandlers.handleDragEnter}
                  onDragLeave={thumbHandlers.handleDragLeave}
                  onDragOver={thumbHandlers.handleDragOver}
                  onDrop={thumbHandlers.handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${
                    thumbDrag ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <input
                    {...thumbHandlers.getInputProps()}
                    className="sr-only"
                  />
                  {thumbPreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={thumbPreview}
                        alt="Preview"
                        className="object-cover h-full w-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (thumbFiles.length > 0)
                            thumbHandlers.removeFile(thumbFiles[0].id);
                          setValues((p) => ({ ...p, thumbnail: null }));
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <ImageIcon className="h-6 w-6 opacity-70 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop or select a thumbnail
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={thumbHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                    </div>
                  )}
                </div>
                {thumbErrors[0] && (
                  <p className="text-xs text-red-500 mt-1">{thumbErrors[0]}</p>
                )}
              </CardContent>
            </Card>

            {/* Gallery Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Gallery Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={galleryHandlers.handleDragEnter}
                  onDragLeave={galleryHandlers.handleDragLeave}
                  onDragOver={galleryHandlers.handleDragOver}
                  onDrop={galleryHandlers.handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${
                    galleryDrag ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <input
                    {...galleryHandlers.getInputProps()}
                    className="sr-only"
                  />
                  {galleryPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {galleryPreviews.map((src, i) => (
                        <div key={i} className="relative">
                          <img
                            src={src}
                            alt={`Gallery ${i}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(src)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <ImageIcon className="h-6 w-6 opacity-70 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop or select gallery images
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={galleryHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Images
                      </Button>
                    </div>
                  )}
                </div>
                {galleryErrors[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {galleryErrors[0]}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Buttons */}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
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
            onClick={() => navigate("/admin/blog")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
