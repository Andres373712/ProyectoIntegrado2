"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/auth/AuthProvider";

function ProtectedRoute({ children }) {
  const router = useRouter();
  const { token, isAdmin, listo } = useAuth();

  useEffect(() => {
    if (!listo) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [listo, token, isAdmin, router]);

  if (!listo || !token || !isAdmin) return null;

  return children;
}

export default ProtectedRoute;
