"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPublic } from "@/client/types.gen";
import { useTranslations } from "next-intl";

const createUserSchema = (t: any, isEditing: boolean = false) =>
  z.object({
    email: z.string().email(t("validation.emailInvalid")),
    full_name: z.string().min(1, t("validation.nameRequired")),
    password: isEditing
      ? z.string().optional().or(z.literal(""))
      : z.string().min(8, t("validation.passwordMinLength")),
    is_active: z.boolean().default(true),
    is_superuser: z.boolean().default(false),
  });

type UserFormData = z.infer<ReturnType<typeof createUserSchema>>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserPublic | null;
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading = false,
}: UserDialogProps) {
  const t = useTranslations();
  const isEditing = !!user;
  const userSchema = createUserSchema(t, isEditing);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      is_active: true,
      is_superuser: false,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        full_name: user.full_name || "",
        password: "",
        is_active: user.is_active,
        is_superuser: user.is_superuser,
      });
    } else {
      form.reset({
        email: "",
        full_name: "",
        password: "",
        is_active: true,
        is_superuser: false,
      });
    }
  }, [user, form]);

  const handleSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("user.editAccount") : t("user.addNewAccount")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("user.updateAccountInfo")
              : t("user.createNewAccount")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@example.com"
                      {...field}
                      disabled={isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("user.fullName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("user.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("common.password")}{" "}
                    {isEditing && t("user.passwordOptional")}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("common.active")}</FormLabel>
                      <FormDescription>
                        {t("dialog.userCanLogin")}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {isEditing && (
                <div className="flex flex-row items-start space-x-3 space-y-0">
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("table.role")}</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {user?.is_superuser ? t("role.admin") : t("role.user")}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading
                  ? isEditing
                    ? t("user.updating")
                    : t("user.creating")
                  : isEditing
                    ? t("common.save")
                    : t("common.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
