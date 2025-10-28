// app/features/category/components/Table.tsx

import { Button } from "@/components/ui/button";
import { Loader2, SquarePen, Trash } from "lucide-react";

export default function Table({
  categories,
  loading,
  onEdit,
  onDelete,
}: {
  categories: any[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
      </div>
    );

  if (!categories.length)
    return (
      <p className="text-gray-500 text-center py-8">No categories found.</p>
    );

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Description
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td className="px-6 py-4">{cat.name}</td>
              <td className="px-6 py-4 text-gray-600">{cat.description}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(cat._id)}
                >
                  <SquarePen size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(cat._id)}
                >
                  <Trash size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
