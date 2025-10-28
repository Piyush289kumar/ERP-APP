// app/features/category/components/Form.tsx


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "../categoryApi";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Form({
  mode,
  category,
  onCancel,
}: {
  mode: "create" | "edit";
  category?: any;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  useEffect(() => {
    if (category) setFormData(category);
  }, [category]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (mode === "edit") {
        await updateCategory({ id: category._id, ...formData }).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully!");
      }
      onCancel();
    } catch (err) {
      toast.error("Failed to save category");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{mode === "edit" ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
