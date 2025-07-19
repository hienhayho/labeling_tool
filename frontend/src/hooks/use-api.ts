import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";

export function useApi() {
  const { token } = useAuth();

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    client: apiClient,
    headers: getAuthHeaders(),
  };
}
