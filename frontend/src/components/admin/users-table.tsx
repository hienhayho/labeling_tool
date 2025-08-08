"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { vi, enUS, jaHira, zhCN, frCA } from "date-fns/locale";
import { UserPublic } from "@/client/types.gen";
import { useTranslations, useLocale } from "next-intl";

interface UsersTableProps {
  users: UserPublic[];
  isLoading: boolean;
  onEdit: (user: UserPublic) => void;
  onDelete: (user: UserPublic) => void;
}

const localeMap = {
  vi: vi,
  en: enUS,
  ja: jaHira,
  zh: zhCN,
  fr: frCA,
};

export function UsersTable({
  users,
  isLoading,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const t = useTranslations();
  const locale = useLocale();
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block relative">
        <div className="rounded-md border overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                    {t("table.user")}
                  </TableHead>
                  <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                    {t("table.email")}
                  </TableHead>
                  <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                    {t("table.status")}
                  </TableHead>
                  <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                    {t("table.role")}
                  </TableHead>
                  <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                    {t("table.lastLogin")}
                  </TableHead>
                  <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.full_name
                              ? user.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || t("user.noName")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{user.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active
                          ? t("status.active")
                          : t("status.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={user.is_superuser ? "destructive" : "outline"}
                      >
                        {user.is_superuser ? t("role.admin") : t("role.user")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.last_login_time ? (
                        <span className="text-sm text-cyan-500 font-bold">
                          {format(
                            new Date(user.last_login_time),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: locale === "vi" ? vi : enUS,
                            },
                          )}
                        </span>
                      ) : (
                        t("user.neverLoggedIn")
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(user)}
                          className="cursor-pointer"
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(user)}
                          className="cursor-pointer"
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user.full_name || t("user.noName")}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  {t("table.status")}:
                </span>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? t("status.active") : t("status.inactive")}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  {t("table.role")}:
                </span>
                <Badge variant={user.is_superuser ? "destructive" : "outline"}>
                  {user.is_superuser ? t("role.admin") : t("role.user")}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  {t("table.lastLogin")}:
                </span>
                <span className="text-sm text-gray-900">
                  {user.last_login_time
                    ? format(new Date(user.last_login_time), "dd/MM/yyyy", {
                        locale: localeMap[locale as keyof typeof localeMap],
                      })
                    : t("user.neverLoggedIn")}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="flex-1 cursor-pointer"
              >
                {t("common.edit")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(user)}
                className="flex-1 cursor-pointer"
              >
                {t("common.delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
