// app/features/gallery/components/gallery-multi-delete-dialog.tsx

"use client";

import { useEffect, useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteGalleryMutation } from "../data/galleryApi"; // ✅ Correct hook for galleries

type GalleryMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function GalleryMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: GalleryMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteGallery] = useDeleteGalleryMutation();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedItems = selectedRows.map((row) => row.original as any);

  // ✅ Reset input + deletion state when dialog opens or closes
  useEffect(() => {
    if (!open) {
      setValue("");
      setIsDeleting(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (value.trim().toUpperCase() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("No galleries selected.");
      return;
    }

    try {
      setIsDeleting(true);

      await toast.promise(
        Promise.all(
          selectedItems.map((item) => deleteGallery(item._id).unwrap())
        ),
        {
          loading: "Deleting selected galleries...",
          success: () => {
            table.resetRowSelection();
            onOpenChange(false);
            return `Deleted ${selectedItems.length} gallery${
              selectedItems.length > 1 ? "ies" : "y"
            } successfully.`;
          },
          error: "Failed to delete one or more galleries.",
        }
      );
    } catch (error: any) {
      console.error("❌ Gallery deletion failed:", error);
      toast.error("Something went wrong while deleting galleries.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim().toUpperCase() !== CONFIRM_WORD || isDeleting}
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
        <span className="text-destructive font-semibold flex items-center">
          <AlertTriangle className="stroke-destructive me-2" size={18} />
          Delete {selectedItems.length}{" "}
          {selectedItems.length > 1 ? "Galleries" : "Gallery"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong>{selectedItems.length}</strong> gallery
            {selectedItems.length > 1 ? "ies" : "y"}? <br />
            This action <strong>cannot</strong> be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>
              Type{" "}
              <strong className="text-destructive">"{CONFIRM_WORD}"</strong> to
              confirm:
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              disabled={isDeleting}
            />
          </Label>

          <Alert variant="destructive" className="border-destructive/40">
            <AlertTitle>⚠️ Warning!</AlertTitle>
            <AlertDescription>
              Please be careful — this operation is irreversible.
            </AlertDescription>
          </Alert>
        </div>
      }
    />
  );
}
