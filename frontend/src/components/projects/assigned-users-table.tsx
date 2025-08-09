"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { UserTaskSummary } from "@/client";
import { useTranslations } from "next-intl";
import { capitalize } from "@/lib/utils";

interface AssignedUsersTableProps {
  userTaskSummary: UserTaskSummary[];
  numTaskNotAssigned: number;
  loadingUserId: number | null;
  onEditUser: (user: { user_id: number; current_count: number }) => void;
  onDeleteUser: (user: { user_id: number; full_name: string }) => void;
}

export function AssignedUsersTable({
  userTaskSummary,
  numTaskNotAssigned,
  loadingUserId,
  onEditUser,
  onDeleteUser,
}: AssignedUsersTableProps) {
  const t = useTranslations();

  return (
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
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {loadingUserId === user.user_id ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        <Badge variant="secondary">{user.task_count}</Badge>
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
                                onEditUser({
                                  user_id: user.user_id,
                                  current_count: user.task_count,
                                });
                              }}
                              disabled={loadingUserId === user.user_id}
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
                                onDeleteUser({
                                  user_id: user.user_id,
                                  full_name: user.full_name,
                                });
                              }}
                              disabled={loadingUserId === user.user_id}
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
  );
}
