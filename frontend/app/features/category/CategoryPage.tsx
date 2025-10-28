// app/feature/category/CategoryPage.tsx

import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { useGetCategoriesQuery } from "./categoryApi";
import { openModal } from "~/features/category/categorySlice";
import CategoryTable from "./components/CategoryTable";
import CategoryForm from "./components/CategoryForm";

export default function CategoryPage() {
  const dispatch = useDispatch();
  const { modalOpen } = useSelector((state: any) => state.category);
  const { data, isLoading } = useGetCategoriesQuery({});

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => dispatch(openModal())}>+ Add Category</Button>
      </div>

      <CategoryTable categories={data?.data || []} loading={isLoading} />

      {modalOpen && <CategoryForm />}
    </div>
  );
}
