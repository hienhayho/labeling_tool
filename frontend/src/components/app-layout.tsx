"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { isPublicRoute } from "@/lib/routes";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const isPublic = isPublicRoute(pathname);

  // Show loading state to prevent flash
  if (isLoading && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show simple layout for public routes
  if (isPublic || !isAuthenticated) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Show full layout with sidebar for authenticated users
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="p-4">
          <SidebarTrigger className="mb-4" />
          <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
