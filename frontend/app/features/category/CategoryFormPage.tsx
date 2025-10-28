// app/features/category/CategoryFormPage.tsx

import { useParams, useNavigate } from "react-router";
import { useGetCategoryByIdQuery } from "./categoryApi";
import Form from "./components/Form";

interface CategoryFormPageProps {
  mode?: "create" | "edit";
}

export default function CategoryFormPage({
  mode: forcedMode,
}: CategoryFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useGetCategoryByIdQuery(id!, { skip: !id });

  const mode = forcedMode ?? (id ? "edit" : "create");
  const category = data?.data;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {mode === "edit" ? "Edit Category" : "Create Category"}
      </h1>

      <Form
        mode={mode}
        category={category}
        onCancel={() => navigate("/admin/category")}
      />
    </div>
  );
}
