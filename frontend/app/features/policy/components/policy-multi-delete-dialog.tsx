// app/features/policy/components/policy-multi-delete-dialog.tsx

"use client";

import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeletePolicyMutation } from "../data/policyApi"; // ✅ Correct hook for policies

type PolicyMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function PolicyMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: PolicyMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePolicy] = useDeletePolicyMutation();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedItems = selectedRows.map((row) => row.original as any);

  const handleDelete = async () => {
    if (value.trim().toUpperCase() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("No policies selected.");
      return;
    }

    try {
      setIsDeleting(true);

      await toast.promise(
        Promise.all(
          selectedItems.map((item) => deletePolicy(item._id).unwrap())
        ),
        {
          loading: "Deleting selected policies...",
          success: () => {
            table.resetRowSelection();
            onOpenChange(false);
            return `Deleted ${selectedItems.length} polic${
              selectedItems.length > 1 ? "ies" : "y"
            } successfully.`;
          },
          error: "Failed to delete one or more policies.",
        }
      );
    } catch (error: any) {
      console.error("❌ Policy deletion failed:", error);
      toast.error("Something went wrong while deleting policies.");
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
          {selectedItems.length > 1 ? "Policies" : "Policy"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong>{selectedItems.length}</strong> polic
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
