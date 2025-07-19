"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { projectsGetProjectStatus } from "@/client";
import { TasksView } from "./_components";
import { useAuth } from "@/contexts/auth-context";

export default function TasksPage() {
  const params = useParams();
  const projectId = parseInt(params.project_id as string);
  const { client, headers } = useApi();
  const { user } = useAuth();
  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project-status", projectId],
    queryFn: () =>
      projectsGetProjectStatus({
        client,
        headers,
        path: { project_id: projectId },
      }),
  });

  const taskSummary = projectData?.data?.user_task_summary;
  let numSamples = 0;
  if (taskSummary) {
    numSamples =
      taskSummary.find((task) => task.user_id === user?.id)?.task_count || 0;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 text-center py-8">
              Có lỗi xảy ra khi tải dự án: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!projectData?.data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy dự án</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              Dự án không tồn tại hoặc bạn không có quyền truy cập.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{projectData.data.name}</h1>
      </div>

      <TasksView
        projectId={projectId}
        numSamples={numSamples}
        isEnabled={true}
      />
    </div>
  );
}
