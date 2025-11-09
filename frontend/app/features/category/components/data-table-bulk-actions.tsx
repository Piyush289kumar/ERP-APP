// app/features/category/components/data-table-bulk-action.tsx


"use client";

import React, { useEffect, useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryMultiDeleteDialog } from "~/features/category/components/category-multi-delete-dialog";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

/**
 * ✅ Floating Bulk Action Bar that only appears when 2+ rows are selected
 * ✨ Now includes smooth bottom-up and reverse-down animation
 */
export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  // ✅ Detect row selection changes
  useEffect(() => {
    const rerender = () => {
      const count = table.getFilteredSelectedRowModel().rows.length;
      setSelectedCount(count);
      setIsVisible(count >= 2);
    };

    // Polling selection state (React Table has no event for this)
    const interval = setInterval(rerender, 150);
    rerender();

    return () => clearInterval(interval);
  }, [table]);

  return (
    <>
      {/* ✅ Smooth Animated Toolbar */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 80 }} // start below the screen
            animate={{ opacity: 1, y: 0 }} // slide up
            exit={{ opacity: 0, y: 80 }} // slide down
            transition={{
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between
            rounded-xl bg-white/90 shadow-lg border border-gray-200 px-4 py-3
            backdrop-blur-md dark:bg-gray-900/80 w-[25%] max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">
                {selectedCount} categor{selectedCount > 1 ? "ies" : "y"} selected
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1"
                    aria-label="Delete selected categories"
                    title="Delete selected categories"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bulk Delete</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.resetRowSelection()}
                    title="Clear selection"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear selection</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 Confirm Delete Dialog */}
      <CategoryMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  );
}
