"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { projectsGetProjectStatus } from "@/client";
import { useApi } from "@/hooks/use-api";
import { SamplesView } from "@/components/projects/samples-view";
import { ProjectUsers } from "@/components/projects/project-users";
import { DownloadDialog } from "@/components/projects/download-dialog";
import { useTranslations } from "next-intl";

export default function ProjectDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const { client, headers } = useApi();

  const {
    data: statusResponse,
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
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  const status = statusResponse?.data;

  // Parse progress from info
  const parseProgress = (info: any) => {
    if (!info || typeof info !== "object") return null;

    // Check if info has content that looks like progress
    const content = info.content || info.message || JSON.stringify(info);

    // Match pattern like "28.70% - 961/3349" or "50% - 100/200"
    const progressMatch = content.match(/(\d+\.?\d*)%\s*-\s*(\d+)\/(\d+)/);
    if (progressMatch) {
      const percentage = parseFloat(progressMatch[1]);
      const current = parseInt(progressMatch[2]);
      const total = parseInt(progressMatch[3]);
      return { percentage, current, total };
    }

    // Match just percentage like "45%"
    const percentageMatch = content.match(/(\d+\.?\d*)%/);
    if (percentageMatch) {
      const percentage = parseFloat(percentageMatch[1]);
      return { percentage, current: null, total: null };
    }

    return null;
  };

  const progress = status?.info ? parseProgress(status.info) : null;

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "FAILURE":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILURE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case "SUCCESS":
        return t("status.completed");
      case "PENDING":
        return t("status.processing");
      case "FAILURE":
        return t("project.statusError");
      default:
        return t("status.processing");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t("project.projectDetails")}</h1>
        </div>
        <div className="text-red-500">
          {t("project.loadDetailsError")}: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {t("project.projectDetails")} #{projectId}
          </h1>
        </div>
        {status?.state === "SUCCESS" && (
          <DownloadDialog projectId={projectId} projectName={status.name} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Status, Project Info, and Users */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t("progress.status")}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status.state)}
                    <Badge className={getStatusColor(status.state)}>
                      {getStatusText(status.state)}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {t("progress.title")}:
                        </span>
                        <span className="font-medium">
                          {progress.percentage.toFixed(1)}%
                          {progress.current && progress.total && (
                            <span className="text-gray-500 ml-1">
                              ({progress.current}/{progress.total})
                            </span>
                          )}
                        </span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                    </div>
                  )}

                  {status.info && !progress && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        {t("project.detailedInfo")}:
                      </h4>
                      <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
                        {JSON.stringify(status.info, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("project.loadingStatus")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("project.detailedInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      ID:
                    </label>
                    <p className="text-sm">{projectId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("common.name")}:
                    </label>
                    <p className="text-sm">
                      {status?.name || t("common.loading")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("common.description")}:
                    </label>
                    <p className="text-sm text-gray-600">
                      {status?.description || t("project.noDescription")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("project.numSamples")}:
                    </label>
                    <p className="text-sm font-semibold">
                      {status?.num_samples || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Users Card */}
          {status?.state === "SUCCESS" && (
            <ProjectUsers
              projectId={projectId}
              numTaskNotAssigned={status.num_task_not_assigned || 0}
              userTaskSummary={status.user_task_summary || []}
            />
          )}
        </div>

        {/* Right Column - Samples View */}
        <div className="lg:col-span-3">
          <SamplesView
            projectId={projectId}
            numSamples={status?.num_samples || 0}
            isEnabled={status?.state === "SUCCESS"}
          />
        </div>
      </div>
    </div>
  );
}
