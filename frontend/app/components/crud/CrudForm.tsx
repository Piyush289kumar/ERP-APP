// app/components/crud/CrudForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function CrudForm({
  fields,
  defaultValues = {},
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Save",
}: {
  fields: any[];
  defaultValues?: Record<string, any>;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const [values, setValues] = useState(defaultValues);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>

          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              required={field.required}
              value={values[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ) : field.type === "boolean" ? (
            <div className="flex items-center space-x-2">
              <Switch
                checked={values[field.name] || false}
                onCheckedChange={(checked) => handleChange(field.name, checked)}
              />
              <Label htmlFor={field.name}>Enabled</Label>
            </div>
          ) : (
            <Input
              id={field.name}
              required={field.required}
              value={values[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
