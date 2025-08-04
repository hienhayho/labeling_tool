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
import { vi, enUS } from "date-fns/locale";
import { UserPublic } from "@/client/types.gen";
import { useTranslations, useLocale } from "next-intl";

interface UsersTableProps {
  users: UserPublic[];
  isLoading: boolean;
  onEdit: (user: UserPublic) => void;
  onDelete: (user: UserPublic) => void;
}

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
    <div className="rounded-md border">
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
                  {user.is_active ? t("status.active") : t("status.inactive")}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={user.is_superuser ? "destructive" : "outline"}>
                  {user.is_superuser ? t("role.admin") : t("role.user")}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {user.last_login_time
                  ? format(new Date(user.last_login_time), "dd/MM/yyyy HH:mm", {
                      locale: locale === "vi" ? vi : enUS,
                    })
                  : t("user.neverLoggedIn")}
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
  );
}
