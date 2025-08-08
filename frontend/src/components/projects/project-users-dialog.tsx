"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Loader2, Search, Users, Edit2, Trash2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  usersReadUsers,
  projectsAssignTask,
  projectsModifyTaskAssignment,
  projectsDeleteUserTasks,
  UserPublic,
} from "@/client";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capitalize } from "@/lib/utils";

interface ProjectUsersDialogProps {
  projectId: number;
  numTaskNotAssigned: number;
  userTaskSummary: any[];
}

export function ProjectUsersDialog({
  projectId,
  numTaskNotAssigned,
  userTaskSummary,
}: ProjectUsersDialogProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [numSamples, setNumSamples] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<{
    user_id: number;
    current_count: number;
  } | null>(null);
  const [newTaskCount, setNewTaskCount] = useState(0);
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
      setSelectedUserId(null);
      setNumSamples(1);
      setSearchQuery("");
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
      setNewTaskCount(0);
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

  const handleAssignTask = () => {
    if (selectedUserId && numSamples > 0) {
      assignTaskMutation.mutate({
        user_id: selectedUserId,
        num_samples: numSamples,
      });
    }
  };

  const handleModifyTask = () => {
    if (editingUser && newTaskCount >= 0) {
      modifyTaskMutation.mutate({
        user_id: editingUser.user_id,
        new_num_samples: newTaskCount,
      });
    }
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

  // Filter users based on search query
  const filteredUsers = availableUsers.filter((user: UserPublic) => {
    const query = searchQuery.toLowerCase();
    const fullName = (user.full_name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

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
              {/* Left side - Assigned Users Table */}
              <div className="col-span-3 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    {t("project.assignedUsers")} ({userTaskSummary.length})
                  </h3>
                  {numTaskNotAssigned > 0 && (
                    <div className="text-sm text-muted-foreground mb-3">
                      {t("project.remainingSamples", {
                        count: numTaskNotAssigned,
                      })}
                    </div>
                  )}
                </div>

                {userTaskSummary.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border rounded-lg">
                    {t("project.noUserAssigned")}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[280px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead className="font-bold w-1/2">
                              {t("table.user")}
                            </TableHead>
                            <TableHead className="text-center font-bold w-1/5">
                              {capitalize(t("samples.samples"))}
                            </TableHead>
                            <TableHead className="text-center font-bold w-3/10">
                              {t("table.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userTaskSummary.map((user) => (
                            <TableRow key={user.user_id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {user.full_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {loadingUserId === user.user_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                  <Badge variant="secondary">
                                    {user.task_count}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingUser({
                                            user_id: user.user_id,
                                            current_count: user.task_count,
                                          });
                                          setNewTaskCount(user.task_count);
                                        }}
                                        disabled={
                                          loadingUserId === user.user_id
                                        }
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{t("project.editTaskAssignment")}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setDeletingUser({
                                            user_id: user.user_id,
                                            full_name: user.full_name,
                                          });
                                        }}
                                        disabled={
                                          loadingUserId === user.user_id
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{t("project.deleteUnlabeledTasks")}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Assign New User Form */}
              <div className="col-span-2 space-y-4 border-l pl-6">
                <h3 className="text-sm font-semibold">
                  {t("project.assignNewUser")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("project.selectUser")}:
                    </label>
                    <Select
                      value={selectedUserId?.toString() || ""}
                      onValueChange={(value) => {
                        setSelectedUserId(parseInt(value));
                      }}
                      disabled={availableUsers.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableUsers.length === 0
                              ? t("project.noAvailableUsers")
                              : t("project.selectUserPlaceholder")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={t("common.search")}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 h-9"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredUsers.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                              {t("common.noResults")}
                            </div>
                          ) : (
                            filteredUsers.map((user: any) => (
                              <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.full_name || user.email}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("project.numSamples")}:
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={numSamples}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const clampedValue = Math.max(
                            1,
                            Math.min(value, numTaskNotAssigned || 1),
                          );
                          setNumSamples(clampedValue);
                        }}
                        min={1}
                        max={numTaskNotAssigned || 1}
                        className="w-24"
                        disabled={numTaskNotAssigned === 0}
                      />
                      <Slider
                        value={[numSamples]}
                        onValueChange={(value) => setNumSamples(value[0])}
                        min={1}
                        max={numTaskNotAssigned || 1}
                        step={1}
                        className="flex-1"
                        disabled={numTaskNotAssigned === 0}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t("project.maximum")}: {numTaskNotAssigned}{" "}
                      {t("samples.samples")}
                    </div>
                  </div>

                  <Button
                    onClick={handleAssignTask}
                    disabled={
                      !selectedUserId ||
                      numSamples <= 0 ||
                      assignTaskMutation.isPending ||
                      numTaskNotAssigned === 0
                    }
                    className="w-full"
                  >
                    {assignTaskMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("project.assigning")}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("project.assignTask")}
                      </>
                    )}
                  </Button>

                  {availableUsers.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center p-4 bg-gray-50 rounded-lg">
                      {t("project.allUsersAssigned")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Assignment Dialog */}
        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("project.modifyTaskAssignment")}</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {t("project.modifyingTasksFor")}:{" "}
                  <span className="font-medium">
                    {
                      userTaskSummary.find(
                        (u) => u.user_id === editingUser.user_id,
                      )?.full_name
                    }
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("project.currentTasks")}: {editingUser.current_count}
                  </label>
                  <label className="text-sm font-medium mb-2 block">
                    {t("project.newTaskCount")}:
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={newTaskCount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const clampedValue = Math.max(
                          0,
                          Math.min(
                            value,
                            editingUser.current_count + numTaskNotAssigned,
                          ),
                        );
                        setNewTaskCount(clampedValue);
                      }}
                      min={0}
                      max={editingUser.current_count + numTaskNotAssigned}
                      className="w-24"
                    />
                    <Slider
                      value={[newTaskCount]}
                      onValueChange={(value) => setNewTaskCount(value[0])}
                      min={0}
                      max={editingUser.current_count + numTaskNotAssigned}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t("project.maximum")}:{" "}
                    {editingUser.current_count + numTaskNotAssigned}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                    disabled={modifyTaskMutation.isPending}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleModifyTask}
                    disabled={
                      newTaskCount === editingUser.current_count ||
                      modifyTaskMutation.isPending
                    }
                  >
                    {modifyTaskMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("project.modifying")}
                      </>
                    ) : (
                      t("project.modifyTasks")
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingUser}
          onOpenChange={(open) => {
            // Only allow closing if not currently deleting
            if (!deleteTasksMutation.isPending && !open) {
              setDeletingUser(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("project.deleteUserTasks")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("project.confirmDeleteTasksMessage", {
                  userName: deletingUser?.full_name || "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteTasksMutation.isPending}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingUser) {
                    deleteTasksMutation.mutate(deletingUser.user_id);
                  }
                }}
                disabled={deleteTasksMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteTasksMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("common.deleting")}
                  </>
                ) : (
                  t("common.delete")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}
