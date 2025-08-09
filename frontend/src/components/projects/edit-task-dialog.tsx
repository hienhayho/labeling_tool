"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { UserTaskSummary } from "@/client";
import { useTranslations } from "next-intl";

interface EditTaskDialogProps {
  editingUser: {
    user_id: number;
    current_count: number;
  } | null;
  userTaskSummary: UserTaskSummary[];
  numTaskNotAssigned: number;
  isModifying: boolean;
  onClose: () => void;
  onModifyTask: (userId: number, newNumSamples: number) => void;
}

export function EditTaskDialog({
  editingUser,
  userTaskSummary,
  numTaskNotAssigned,
  isModifying,
  onClose,
  onModifyTask,
}: EditTaskDialogProps) {
  const t = useTranslations();
  const [newTaskCount, setNewTaskCount] = useState(0);

  useEffect(() => {
    if (editingUser) {
      setNewTaskCount(editingUser.current_count);
    }
  }, [editingUser]);

  const handleModifyTask = () => {
    if (editingUser && newTaskCount >= 0) {
      onModifyTask(editingUser.user_id, newTaskCount);
    }
  };

  const maxTasks = editingUser
    ? editingUser.current_count + numTaskNotAssigned
    : 0;

  return (
    <Dialog open={!!editingUser} onOpenChange={(open) => !open && onClose()}>
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
                  userTaskSummary.find((u) => u.user_id === editingUser.user_id)
                    ?.full_name
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
                    const clampedValue = Math.max(0, Math.min(value, maxTasks));
                    setNewTaskCount(clampedValue);
                  }}
                  min={0}
                  max={maxTasks}
                  className="w-24"
                />
                <Slider
                  value={[newTaskCount]}
                  onValueChange={(value) => setNewTaskCount(value[0])}
                  min={0}
                  max={maxTasks}
                  step={1}
                  className="flex-1"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t("project.maximum")}: {maxTasks}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isModifying}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleModifyTask}
                disabled={
                  newTaskCount === editingUser.current_count || isModifying
                }
              >
                {isModifying ? (
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
  );
}
