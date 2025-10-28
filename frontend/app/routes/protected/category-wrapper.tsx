// app/routes/protected/category-wrapper.tsx

import { ProtectedRoute } from "~/components/ProtectedRoute";
import CategoryPage from "~/features/category/CategoryPage";

export default function UserWrapper() {
  return (
    <ProtectedRoute>
      <CategoryPage />
    </ProtectedRoute>
  );
}
