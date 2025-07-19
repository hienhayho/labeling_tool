"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { usersReadUserMe } from "@/client/sdk.gen";
import type { UserPublic, Token } from "@/client/types.gen";

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  login: (token: Token) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMounted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Handle hydration and load token from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Get user data when token is available
  const { data: userData, error } = useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) return null;
      const response = await usersReadUserMe({
        client: apiClient,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token && isMounted,
    retry: false,
  });

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (!isMounted) return;

    if (userData) {
      setUser(userData);
      setIsLoading(false);
    } else if (error) {
      handleLogout();
    } else if (token && !userData && !error) {
      // Still loading
      setIsLoading(true);
    } else if (!token) {
      setIsLoading(false);
    }
  }, [userData, error, token, isMounted, handleLogout]);

  const login = (tokenData: Token) => {
    const accessToken = tokenData.access_token;
    setToken(accessToken);
    localStorage.setItem("access_token", accessToken);

    if (tokenData.refresh_token) {
      localStorage.setItem("refresh_token", tokenData.refresh_token);
    }
  };

  const logout = () => {
    handleLogout();
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading: isLoading || !isMounted,
    isAuthenticated: !!user && !!token,
    isMounted,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
