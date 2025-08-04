import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth as useAuthContext } from "@/contexts/auth-context";
import { toast } from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import type {
  BodyLoginLoginAccessToken,
  UserCreate,
  Token,
} from "@/client/types.gen";

export default function useAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuthContext();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: BodyLoginLoginAccessToken) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log(
        "process.env.NEXT_PUBLIC_API_URL",
        process.env.NEXT_PUBLIC_API_URL,
      );
      const response = await fetch(`${baseUrl}/api/v1/login/access-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      return response.json() as Promise<Token>;
    },
    onSuccess: (data: Token) => {
      login(data);
      router.push(`/${locale}/dashboard`);
      toast.success(t("auth.loginSuccess"));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  // Signup mutation
  const signUpMutation = useMutation({
    mutationFn: async (userData: UserCreate) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Signup failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("auth.signupSuccess"));
      router.push(`/${locale}/login`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Signup failed");
    },
  });

  // Google login handler
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const redirectUrl = `${baseUrl}/api/v1/google/login`;

    // Redirect to backend Google login endpoint
    window.location.href = redirectUrl;
  };

  return {
    loginMutation,
    signUpMutation,
    handleGoogleLogin,
    isGoogleLoading,
  };
}
