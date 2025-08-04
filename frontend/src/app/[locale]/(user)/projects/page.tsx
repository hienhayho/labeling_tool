"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { projectsDeleteProject, projectsGetOwnProjects } from "@/client";
import { useApi } from "@/hooks/use-api";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const getRedirectUrl = (
  isSuperuser: boolean,
  projectId: number,
  locale: string,
) => {
  if (isSuperuser) {
    return `/${locale}/projects/${projectId}`;
  }
  return `/${locale}/tasks/${projectId}`;
};

export default function ProjectsPage() {
  const t = useTranslations();
  const { client, headers } = useApi();
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const queryClient = useQueryClient();
  const [projectToDelete, setProjectToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsGetOwnProjects({ client, headers }),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await projectsDeleteProject({
        client,
        headers,
        path: { project_id: projectId },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t("project.deleteSuccess"));
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error(`${t("project.deleteError")}: ${error.message}`);
      setProjectToDelete(null);
    },
  });

  const handleDeleteProject = (projectId: number, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  const projects = projectsResponse?.data;

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t("navigation.projects")}</h1>
        <div className="text-red-500">
          {t("project.loadError")}: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">{t("navigation.projects")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {user?.is_superuser && (
          <CreateProjectDialog>
            <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-28 p-4">
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-600 mb-1">
                  {t("project.createProject")}
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  {t("project.createProjectToStart")}
                </p>
              </CardContent>
            </Card>
          </CreateProjectDialog>
        )}

        {/* Danh sách các dự án */}
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))
          : projects?.map((project) => (
              <Link
                key={project.id}
                href={getRedirectUrl(
                  user?.is_superuser ?? false,
                  project.id,
                  locale,
                )}
              >
                <Card className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-xs mb-3">
                      {project.description || t("project.noDescription")}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        ID: {project.id}
                      </span>
                      {user?.is_superuser && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteProject(project.id, project.name);
                          }}
                          disabled={deleteProjectMutation.isPending}
                        >
                          {deleteProjectMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          {t("common.delete")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {user?.is_superuser && !isLoading && projects?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">{t("project.noProjects")}</p>
          <CreateProjectDialog>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("project.createFirstProject")}
            </Button>
          </CreateProjectDialog>
        </div>
      )}

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={!!projectToDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("project.confirmDeleteProject")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("project.confirmDeleteProjectMessage")}{" "}
              <span className="font-semibold text-red-600">
                &ldquo;{projectToDelete?.name}&rdquo;
              </span>
              ? {t("dialog.deleteProjectWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteProjectMutation.isPending}
              onClick={() => {
                if (!deleteProjectMutation.isPending) {
                  setProjectToDelete(null);
                }
              }}
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteProjectMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.deleting")}
                </>
              ) : (
                t("project.deleteProject")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
