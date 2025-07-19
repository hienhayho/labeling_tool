"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isPublicRoute } from "@/lib/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = isPublicRoute(pathname);

  useEffect(() => {
    // Only handle redirects when not loading
    if (!isLoading) {
      if (!isAuthenticated && !isPublic) {
        // Redirect to login if not authenticated and trying to access private routes
        router.push("/");
      } else if (isAuthenticated && pathname === "/login") {
        // Redirect to dashboard if authenticated and on login page
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, isPublic, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show login page for unauthenticated users on public routes
  if (!isAuthenticated && isPublic) {
    return <>{children}</>;
  }

  // Show content for authenticated users
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading while redirecting to login
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
