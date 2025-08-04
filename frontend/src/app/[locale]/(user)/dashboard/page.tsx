"use client";

import { useAuth } from "@/contexts/auth-context";
import DashboardAdminPage from "@/components/dashboard/admin";
import DashboardUserPage from "@/components/dashboard/user";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.is_superuser) {
    return <DashboardAdminPage />;
  }
  return <DashboardUserPage />;
}
