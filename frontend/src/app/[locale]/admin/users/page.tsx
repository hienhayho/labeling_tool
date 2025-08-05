"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { UsersTable } from "@/components/admin/users-table";
import { UserDialog } from "@/components/admin/user-dialog";
import { useApi } from "@/hooks/use-api";
import { UserPublic, UserCreate, UserUpdate } from "@/client/types.gen";
import {
  usersReadUsers,
  usersCreateUser,
  usersUpdateUser,
  usersDeleteUser,
} from "@/client/sdk.gen";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserPublic | null>(null);

  const { client, headers } = useApi();
  const queryClient = useQueryClient();

  const skip = (page - 1) * limit;

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", skip, limit],
    queryFn: () => usersReadUsers({ client, headers, query: { skip, limit } }),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: UserCreate) =>
      usersCreateUser({ client, headers, body: userData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDialogOpen(false);
      toast.success(t("user.createSuccess"));
    },
    onError: (error: any) => {
      toast.error(error.message || t("user.createError"));
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: number;
      userData: UserUpdate;
    }) =>
      usersUpdateUser({
        client,
        headers,
        path: { user_id: userId },
        body: userData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDialogOpen(false);
      setSelectedUser(null);
      toast.success(t("user.updateSuccess"));
    },
    onError: (error: any) => {
      toast.error(error.message || t("user.updateError"));
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      usersDeleteUser({ client, headers, path: { user_id: userId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success(t("user.deleteSuccess"));
    },
    onError: (error: any) => {
      toast.error(error.message || t("user.deleteError"));
    },
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: UserPublic) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = (user: UserPublic) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const handleSubmitUser = (data: any) => {
    if (selectedUser) {
      // Update user
      const updateData: UserUpdate = {
        email: data.email,
        full_name: data.full_name,
        is_active: data.is_active,
        is_superuser: data.is_superuser,
      };

      if (data.password) {
        updateData.password = data.password;
      }

      updateUserMutation.mutate({
        userId: selectedUser.id,
        userData: updateData,
      });
    } else {
      // Create user
      const createData: UserCreate = {
        email: data.email,
        full_name: data.full_name,
        password: data.password || "",
        is_active: data.is_active,
        is_superuser: data.is_superuser,
      };

      createUserMutation.mutate(createData);
    }
  };

  const totalPages = usersData?.data
    ? Math.ceil(usersData.data.count / limit)
    : 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">
            {t("user.loadError")}
          </h3>
          <p className="text-gray-600 mt-2">{t("user.loadErrorMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="container mx-auto p-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("user.title")}
          </h1>
          <p className="text-muted-foreground">{t("user.subtitle")}</p>
        </div>
        <Button onClick={handleAddUser} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          {t("user.addAccount")}
        </Button>
      </div>

      <div className="space-y-4 container mx-auto p-10">
        <UsersTable
          users={usersData?.data?.data || []}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {t("user.showing")} {skip + 1} -{" "}
              {Math.min(skip + limit, usersData?.data?.count || 0)}{" "}
              {t("user.of")} {usersData?.data?.count || 0} {t("user.users")}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {t("user.page")} {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmitUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          deleteDialogOpen ? "block" : "hidden"
        }`}
        onClick={() => setDeleteDialogOpen(false)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">
            {t("user.confirmDelete")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("user.confirmDeletePrompt")}{" "}
            <span className="font-semibold">
              {userToDelete?.full_name || userToDelete?.email}
            </span>
            ? {t("user.confirmDeleteWarning")}
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending
                ? t("common.deleting")
                : t("common.delete")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
