"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { usersReadUsers, projectsAssignTask } from "@/client";

interface ProjectUsersProps {
  projectId: number;
  numTaskNotAssigned: number;
  userTaskSummary: any[];
}

export function ProjectUsers({
  projectId,
  numTaskNotAssigned,
  userTaskSummary,
}: ProjectUsersProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [numSamples, setNumSamples] = useState(1);
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
    mutationFn: (data: { user_id: number; num_samples: number }) =>
      projectsAssignTask({
        client,
        headers,
        path: { project_id: projectId },
        body: data,
      }),
    onSuccess: () => {
      // Invalidate and refetch project status
      queryClient.invalidateQueries({
        queryKey: ["project-status", projectId],
      });
      setIsAssignDialogOpen(false);
      setSelectedUserId(null);
      setNumSamples(1);
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

  const getAvailableUsers = () => {
    if (!usersData?.data?.data) return [];

    // Filter out users who are already assigned to this project
    const assignedUserIds = userTaskSummary.map((user) => user.user_id);
    return usersData.data.data.filter(
      (user: any) => !assignedUserIds.includes(user.id),
    );
  };

  const availableUsers = getAvailableUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Users đang thực hiện</span>
          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" disabled={availableUsers.length === 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm user
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign task cho user</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Chọn user:
                  </label>
                  <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedUserId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Số lượng mẫu: {numSamples}
                  </label>
                  <Slider
                    value={[numSamples]}
                    onValueChange={(value) => setNumSamples(value[0])}
                    min={1}
                    max={numTaskNotAssigned}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Tối đa: {numTaskNotAssigned} mẫu
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAssignTask}
                    disabled={
                      !selectedUserId ||
                      numSamples <= 0 ||
                      assignTaskMutation.isPending
                    }
                  >
                    {assignTaskMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Assign Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userTaskSummary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có user nào được assign task
          </div>
        ) : (
          <div className="space-y-3">
            {userTaskSummary.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <Badge variant="secondary">{user.task_count} mẫu</Badge>
              </div>
            ))}
          </div>
        )}

        {numTaskNotAssigned > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Còn {numTaskNotAssigned} mẫu chưa được assign
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
