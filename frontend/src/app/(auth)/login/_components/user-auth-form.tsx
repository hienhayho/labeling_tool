"use client";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { BodyLoginLoginAccessToken } from "@/client/types.gen";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export default function UserAuthForm() {
  const [loading, startTransition] = useTransition();

  const { loginMutation } = useAuth();

  const defaultValues = {
    username: "",
    password: "",
  };

  const form = useForm<BodyLoginLoginAccessToken>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: BodyLoginLoginAccessToken) => {
    startTransition(async () => {
      try {
        await loginMutation.mutateAsync(data);
      } catch {
        // error is handled by useAuth hook
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    disabled={loading}
                    className={cn(
                      "bg-gray-50 dark:bg-gray-800",
                      "border-gray-200 dark:border-gray-700",
                      "text-gray-900 dark:text-gray-100",
                      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                      "focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/30",
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 dark:text-red-400" />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Mật khẩu
                    </FormLabel>
                    <Link
                      className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200"
                      href="/forgot-password"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={loading}
                      className={cn(
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-200 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        "focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/30",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <Button
            disabled={loading}
            className={cn(
              "w-full",
              "bg-orange-500 hover:bg-orange-600",
              "text-white",
              "transition-colors duration-200",
            )}
            type="submit"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>
      </Form>
    </div>
  );
}
