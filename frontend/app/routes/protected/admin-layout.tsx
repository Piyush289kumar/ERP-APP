// import AdminLayout from "@/app/admin/layout";

import AdminLayout from "~/admin/layout";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
