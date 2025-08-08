"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { usersUpdateUserMe, usersUpdatePasswordMe } from "@/client/sdk.gen";
import type { UserUpdateMe, UpdatePassword } from "@/client/types.gen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const { client, headers } = useApi();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserUpdateMe) => {
      const response = await usersUpdateUserMe({
        client,
        headers,
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(t("settings.profile.updateSuccess"));
    },
    onError: (error: any) => {
      const message = error.message || t("common.error");
      toast.error(message);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: UpdatePassword) => {
      const response = await usersUpdatePasswordMe({
        client,
        headers,
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t("settings.password.updateSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || t("common.error");
      toast.error(message);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: { full_name?: string; email?: string } = {};
    if (fullName !== user?.full_name) updates.full_name = fullName;
    if (email !== user?.email) updates.email = email;

    if (Object.keys(updates).length > 0) {
      updateProfileMutation.mutate(updates);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error(t("settings.password.fieldsRequired"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("settings.password.passwordsNotMatch"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("settings.password.passwordTooShort"));
      return;
    }

    updatePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <div className="container mx-auto p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground mb-8">{t("settings.subtitle")}</p>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("user.fullName")}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("settings.profile.fullNamePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("settings.profile.emailPlaceholder")}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.password.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {t("settings.password.currentPassword")}
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t(
                      "settings.password.currentPasswordPlaceholder",
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    {t("settings.password.newPassword")}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("settings.password.newPasswordPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("settings.password.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t(
                      "settings.password.confirmPasswordPlaceholder",
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("settings.password.updateButton")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
