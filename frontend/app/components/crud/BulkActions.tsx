// app/components/crud/BulkAction.tsx

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
import { motion, AnimatePresence } from "framer-motion";
import { CategoryMultiDeleteDialog } from "~/features/category/components/category-multi-delete-dialog";

export function BulkActions<TData>({
  table,
  entityName = "item",
}: {
  table: Table<TData>;
  entityName?: string;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    const rerender = () => {
      const count = table.getFilteredSelectedRowModel().rows.length;
      setSelectedCount(count);
      setIsVisible(count >= 2);
    };
    const interval = setInterval(rerender, 150);
    rerender();
    return () => clearInterval(interval);
  }, [table]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between
            rounded-xl bg-white/90 shadow-lg border border-gray-200 px-4 py-3 backdrop-blur-md dark:bg-gray-900/80 w-[25%] max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">
                {selectedCount} {entityName}
                {selectedCount > 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
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

      {/* Keep using your existing MultiDeleteDialog */}
      <CategoryMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  );
}
