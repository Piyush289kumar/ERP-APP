// app/components/crud/CategoryForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, UploadIcon, XIcon, AlertCircleIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";

export type FieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "select"
  | "image"
  | "section";

export interface FieldConfig {
  name?: string;
  label?: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  sectionTitle?: string;
}

interface CategoryFormProps {
  title?: string;
  fields: FieldConfig[];
  defaultValues?: Record<string, any>;
  onSubmit: (formData: FormData, actionType?: string) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  mode?: "create" | "edit";
}

export function CategoryForm({
  title,
  fields,
  defaultValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  mode = "create",
}: CategoryFormProps) {
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

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

  const handleSubmit = async (
    e: React.FormEvent,
    actionType: string = "save"
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    try {
      for (const key in values) {
        const val = values[key];
        if (key === "parentCategory" && (val === "none" || val === "")) continue;
        if (val !== undefined && val !== null) {
          if (typeof val === "object" && !Array.isArray(val)) {
            for (const subKey in val) {
              formData.append(`${key}[${subKey}]`, val[subKey]);
            }
          } else {
            formData.append(key, String(val));
          }
        }
      }

      if (files.length > 0 && files[0].file instanceof Blob) {
        formData.append("image", files[0].file as Blob, files[0].file.name);
      }

      await onSubmit(formData, actionType);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      {title && (
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "edit"
              ? "Update existing record information below."
              : "Fill out the form to create a new record."}
          </p>
        </header>
      )}

      {/* Form Layout */}
      <form id="crud-form" onSubmit={(e) => handleSubmit(e, "save")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info */}
            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>
                  Core details about this category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields
                  .filter(
                    (f) =>
                      ["text", "textarea", "select"].includes(f.type) &&
                      !f.name?.startsWith("seo[")
                  )
                  .map((field, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.type === "text" && (
                        <Input
                          id={field.name}
                          placeholder={field.placeholder}
                          value={values[field.name ?? ""] || ""}
                          onChange={(e) =>
                            handleChange(field.name!, e.target.value)
                          }
                          required={field.required}
                        />
                      )}
                      {field.type === "textarea" && (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          rows={3}
                          value={values[field.name ?? ""] || ""}
                          onChange={(e) =>
                            handleChange(field.name!, e.target.value)
                          }
                        />
                      )}
                      {field.type === "select" && (
                        <Select
                          value={values[field.name!] || ""}
                          onValueChange={(val) =>
                            handleChange(field.name!, val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={field.placeholder || "Select option"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your category for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields
                  .filter((f) => f.name?.startsWith("seo["))
                  .map((field, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          rows={3}
                          value={values[field.name ?? ""] || ""}
                          onChange={(e) =>
                            handleChange(field.name!, e.target.value)
                          }
                        />
                      ) : (
                        <Input
                          id={field.name}
                          placeholder={field.placeholder}
                          value={values[field.name ?? ""] || ""}
                          onChange={(e) =>
                            handleChange(field.name!, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* Visibility */}
            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>
                  Toggle category display options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields
                  .filter((f) => f.type === "boolean")
                  .map((field, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-border rounded-lg p-3 hover:bg-accent/40 transition"
                    >
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Switch
                        id={field.name}
                        checked={!!values[field.name!]}
                        onCheckedChange={(checked) =>
                          handleChange(field.name!, checked)
                        }
                      />
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
                <CardDescription>
                  Upload or change category thumbnail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-6 transition ${
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
                        onClick={() => removeFile(files[0]?.id)}
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full border border-muted-foreground mb-3">
                        <ImageIcon className="w-5 h-5 opacity-60" />
                      </div>
                      <p className="text-sm font-medium">
                        Drop your image here or
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        type="button"
                        onClick={openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supported: PNG, JPG, WEBP, GIF — up to 2MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircleIcon className="h-3 w-3" />
                    <span>{errors[0]}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Buttons */}
        {/* <Separator className="my-8" /> */}
        <div className="lg:col-span-3 flex justify-start border-border pt-6">
          <div className="flex gap-3">
            {mode === "edit" ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary text-white hover:opacity-90"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary text-white hover:opacity-90"
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

            {onCancel && (
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={onCancel}
                className="rounded-lg"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
