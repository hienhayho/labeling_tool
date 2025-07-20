"use client";

import { useAuth } from "@/contexts/auth-context";
import DashboardAdminPage from "./_components/admin";
import DashboardUserPage from "./_components/user";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.is_superuser) {
    return <DashboardAdminPage />;
  }
  return <DashboardUserPage />;
}
