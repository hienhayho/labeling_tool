"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Users } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  usersReadUsers,
  projectsAssignTask,
  projectsModifyTaskAssignment,
  projectsDeleteUserTasks,
  UserPublic,
  UserTaskSummary,
} from "@/client";
import { useTranslations } from "next-intl";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssignedUsersTable } from "./assigned-users-table";
import { AssignNewUserForm } from "./assign-new-user-form";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";

interface ProjectUsersDialogProps {
  projectId: number;
  numTaskNotAssigned: number;
  userTaskSummary: UserTaskSummary[];
}

export function ProjectUsersDialog({
  projectId,
  numTaskNotAssigned,
  userTaskSummary,
}: ProjectUsersDialogProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    user_id: number;
    current_count: number;
  } | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<{
    user_id: number;
    full_name: string;
  } | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const { client, headers } = useApi();
  const queryClient = useQueryClient();

  // Fetch all users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      usersReadUsers({
        client,
        headers,
        query: { skip: 0, limit: 10000000 },
      }),
  });

  // Assign task mutation
  const assignTaskMutation = useMutation({
    mutationFn: (data: { user_id: number; num_samples: number }) => {
      setLoadingUserId(data.user_id);
      return projectsAssignTask({
        client,
        headers,
        path: { project_id: projectId },
        body: data,
      });
    },
    onSuccess: async () => {
      setIsRefetching(true);
      // Invalidate and refetch project status
      await queryClient.invalidateQueries({
        queryKey: ["project-status", projectId],
      });
      // Wait for parent component to update
      setTimeout(() => setIsRefetching(false), 500);
    },
    onSettled: () => {
      setLoadingUserId(null);
    },
  });

  // Modify task mutation
  const modifyTaskMutation = useMutation({
    mutationFn: (data: { user_id: number; new_num_samples: number }) => {
      setLoadingUserId(data.user_id);
      return projectsModifyTaskAssignment({
        client,
        headers,
        path: { project_id: projectId },
        body: data,
      });
    },
    onSuccess: async () => {
      setIsRefetching(true);
      // Invalidate and refetch project status
      await queryClient.invalidateQueries({
        queryKey: ["project-status", projectId],
      });
      setEditingUser(null);
      // Wait for parent component to update
      setTimeout(() => setIsRefetching(false), 500);
    },
    onSettled: () => {
      setLoadingUserId(null);
    },
  });

  // Delete tasks mutation
  const deleteTasksMutation = useMutation({
    mutationFn: (user_id: number) => {
      setLoadingUserId(user_id);
      return projectsDeleteUserTasks({
        client,
        headers,
        path: { project_id: projectId },
        body: { user_id },
      });
    },
    onSuccess: async () => {
      setIsRefetching(true);
      // Invalidate and refetch project status
      await queryClient.invalidateQueries({
        queryKey: ["project-status", projectId],
      });
      setDeletingUser(null);
      // Wait for parent component to update
      setTimeout(() => setIsRefetching(false), 500);
    },
    onSettled: () => {
      setLoadingUserId(null);
    },
  });

  const handleAssignTask = (userId: number, numSamples: number) => {
    assignTaskMutation.mutate({
      user_id: userId,
      num_samples: numSamples,
    });
  };

  const handleModifyTask = (userId: number, newNumSamples: number) => {
    modifyTaskMutation.mutate({
      user_id: userId,
      new_num_samples: newNumSamples,
    });
  };

  const handleDeleteTasks = (userId: number) => {
    deleteTasksMutation.mutate(userId);
  };

  const getAvailableUsers = () => {
    if (!usersData?.data?.data) return [];

    // Filter out users who are already assigned to this project
    const assignedUserIds = userTaskSummary.map((user) => user.user_id);
    return usersData.data.data.filter(
      (user: UserPublic) => !assignedUserIds.includes(user.id),
    );
  };

  const availableUsers = getAvailableUsers();

  return (
    <TooltipProvider>
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {t("project.manageUsers")} ({userTaskSummary.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t("project.projectUsers")}</DialogTitle>
            </DialogHeader>

            {/* Loading overlay */}
            {isRefetching && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {t("project.updatingData")}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-5 gap-6 mt-4">
              <AssignedUsersTable
                userTaskSummary={userTaskSummary}
                numTaskNotAssigned={numTaskNotAssigned}
                loadingUserId={loadingUserId}
                onEditUser={(user) => setEditingUser(user)}
                onDeleteUser={(user) => setDeletingUser(user)}
              />

              <AssignNewUserForm
                availableUsers={availableUsers}
                numTaskNotAssigned={numTaskNotAssigned}
                isAssigning={assignTaskMutation.isPending}
                onAssignTask={handleAssignTask}
              />
            </div>
          </DialogContent>
        </Dialog>

        <EditTaskDialog
          editingUser={editingUser}
          userTaskSummary={userTaskSummary}
          numTaskNotAssigned={numTaskNotAssigned}
          isModifying={modifyTaskMutation.isPending}
          onClose={() => setEditingUser(null)}
          onModifyTask={handleModifyTask}
        />

        <DeleteTaskDialog
          deletingUser={deletingUser}
          isDeleting={deleteTasksMutation.isPending}
          onClose={() => setDeletingUser(null)}
          onDeleteTasks={handleDeleteTasks}
        />
      </>
    </TooltipProvider>
  );
}
