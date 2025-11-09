// app/features/category/components/category-multi-delete-dialog.tsx

"use client";

import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteCategoryMutation } from "~/features/category/data/categoryApi";

type CategoryMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function CategoryMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: CategoryMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCategory] = useDeleteCategoryMutation();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedItems = selectedRows.map((row) => row.original as any);

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("No items selected.");
      return;
    }

    try {
      setIsDeleting(true);
      toast.promise(
        Promise.all(
          selectedItems.map((item) => deleteCategory(item._id).unwrap())
        ),
        {
          loading: "Deleting selected categories...",
          success: () => {
            table.resetRowSelection();
            onOpenChange(false);
            return `Deleted ${selectedItems.length} categor${
              selectedItems.length > 1 ? "ies" : "y"
            } successfully.`;
          },
          error: "Failed to delete some categories.",
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || isDeleting}
      confirmText={
        isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete"
        )
      }
      destructive
      title={
        <span className="text-destructive font-semibold">
          <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} />{" "}
          Delete {selectedItems.length}{" "}
          {selectedItems.length > 1 ? "categories" : "category"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedItems.length}</strong>{" "}
            selected categor{selectedItems.length > 1 ? "ies" : "y"}? <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              disabled={isDeleting}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
    />
  );
}
