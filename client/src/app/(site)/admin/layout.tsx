import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
