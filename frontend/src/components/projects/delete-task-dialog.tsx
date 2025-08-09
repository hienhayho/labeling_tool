"use client";

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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeleteTaskDialogProps {
  deletingUser: {
    user_id: number;
    full_name: string;
  } | null;
  isDeleting: boolean;
  onClose: () => void;
  onDeleteTasks: (userId: number) => void;
}

export function DeleteTaskDialog({
  deletingUser,
  isDeleting,
  onClose,
  onDeleteTasks,
}: DeleteTaskDialogProps) {
  const t = useTranslations();

  return (
    <AlertDialog
      open={!!deletingUser}
      onOpenChange={(open) => {
        // Only allow closing if not currently deleting
        if (!isDeleting && !open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("project.deleteUserTasks")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("project.confirmDeleteTasksMessage", {
              userName: deletingUser?.full_name || "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (deletingUser) {
                onDeleteTasks(deletingUser.user_id);
              }
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
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
  );
}
