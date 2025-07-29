import { createClient } from "@/client/client/client";

// Create API client with base configuration
export const apiClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
