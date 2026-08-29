import type { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
