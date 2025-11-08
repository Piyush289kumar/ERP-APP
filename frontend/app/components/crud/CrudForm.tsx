// app/components/crud/CrudForm.tsx

"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, UploadIcon, XIcon, AlertCircleIcon } from "lucide-react";
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

interface CrudFormProps {
  title?: string;
  fields: FieldConfig[];
  defaultValues?: Record<string, any>;
  onSubmit: (formData: FormData) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  mode?: "create" | "edit";
}

export function CrudForm({
  title,
  fields,
  defaultValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  mode = "create",
}: CrudFormProps) {
  const [values, setValues] = useState<Record<string, any>>(defaultValues);

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
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const previewUrl = files?.[0]?.preview || values?.image || null;

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    try {
      for (const key in values) {
        const val = values[key];

        // Skip parentCategory if it's "none"
        if (key === "parentCategory" && (val === "none" || val === ""))
          continue;

        if (val !== undefined && val !== null) {
          if (typeof val === "object") {
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

      await onSubmit(formData);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // ---- UI RENDER ---- //
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      {title && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <div className="flex gap-3">
            {onCancel && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" form="crud-form">
              {mode === "edit" ? "Update" : submitLabel}
            </Button>
          </div>
        </div>
      )}

      {/* Form Content */}
      <Card className="shadow-sm border border-border/50">
        <CardContent>
          <form
            id="crud-form"
            onSubmit={handleSubmit}
            className="space-y-10 py-6"
          >
            {fields.map((field, i) => {
              if (field.type === "section") {
                return (
                  <div key={i} className="space-y-2">
                    <Separator />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      {field.sectionTitle}
                    </h3>
                  </div>
                );
              }

              if (field.type === "text" || field.type === "textarea") {
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.type === "text" ? (
                        <Input
                          id={field.name}
                          placeholder={field.placeholder}
                          value={values[field.name ?? ""] || ""}
                          onChange={(e) =>
                            handleChange(field.name!, e.target.value)
                          }
                          required={field.required}
                        />
                      ) : (
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
                    </div>
                  </div>
                );
              }

              if (field.type === "boolean") {
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border border-border rounded-xl p-4 hover:bg-accent/40 transition"
                  >
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <Switch
                      id={field.name}
                      checked={!!values[field.name!]}
                      onCheckedChange={(checked) =>
                        handleChange(field.name!, checked)
                      }
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Select
                        value={values[field.name!] || ""}
                        onValueChange={(val) => handleChange(field.name!, val)}
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
                    </div>
                  </div>
                );
              }

              if (field.type === "image") {
                return (
                  <div key={i} className="space-y-3">
                    <Label>{field.label}</Label>
                    <div
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-6 transition-all ${
                        isDragging
                          ? "bg-accent/30 border-primary"
                          : "border-border"
                      }`}
                    >
                      <input {...getInputProps()} className="sr-only" />
                      {previewUrl ? (
                        <div className="relative w-full h-56 flex items-center justify-center">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-full rounded-xl object-cover"
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
                  </div>
                );
              }

              return null;
            })}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
