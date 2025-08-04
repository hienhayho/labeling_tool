"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { projectsDownloadProject } from "@/client";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface DownloadDialogProps {
  projectId: number;
  projectName?: string;
}

const getStatusOptions = (t: any) => [
  { value: "UNLABELED" as const, label: t("status.pending") },
  { value: "CONFIRMED" as const, label: t("status.confirmed") },
  { value: "APPROVED" as const, label: t("status.completed") },
  { value: "REJECTED" as const, label: t("status.rejected") },
];

type StatusType = "UNLABELED" | "CONFIRMED" | "APPROVED" | "REJECTED";

function sanitizeFilename(input: string): string {
  let name = input;
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  name = name.replace(/[^a-zA-Z0-9\s-_]/g, "");

  name = name.trim().replace(/\s+/g, "-");

  if (name.length > 100) {
    name = name.substring(0, 100);
  }

  return name;
}

export function DownloadDialog({
  projectId,
  projectName,
}: DownloadDialogProps) {
  const t = useTranslations();
  const STATUS_OPTIONS = getStatusOptions(t);
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<StatusType[]>([
    "UNLABELED",
    "CONFIRMED",
    "APPROVED",
    "REJECTED",
  ]);
  const [fileName, setFileName] = useState(
    projectName
      ? `${sanitizeFilename(projectName)}_data`
      : `project_${projectId}_data`,
  );
  const { client, headers } = useApi();

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const sanitizedFileName = sanitizeFilename(fileName);
      const response = await projectsDownloadProject({
        client,
        headers,
        path: { project_id: projectId },
        body: {
          limit: limit ? parseInt(limit) : null,
          include_statuses: selectedStatuses,
          file_name: sanitizedFileName,
        },
      });

      // Create blob and download
      const blob = new Blob([response.data || ""], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizedFileName}.jsonl`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return response;
    },
    onSuccess: () => {
      toast.success(t("download.success"));
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`${t("download.error")}: ${error.message}`);
    },
  });

  const handleStatusToggle = (status: StatusType) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleSelectAll = () => {
    setSelectedStatuses(STATUS_OPTIONS.map((option) => option.value));
  };

  const handleSelectNone = () => {
    setSelectedStatuses([]);
  };

  const handleDownload = () => {
    if (selectedStatuses.length === 0) {
      toast.error(t("download.selectStatusError"));
      return;
    }
    if (!fileName.trim()) {
      toast.error(t("download.enterFileNameError"));
      return;
    }
    downloadMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t("download.downloadData")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("download.downloadProjectData")}</DialogTitle>
          <DialogDescription>
            {t("download.selectConfigDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">{t("download.limitOptional")}</Label>
            <Input
              id="limit"
              type="number"
              placeholder={t("download.leaveEmptyForAll")}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              {t("download.leaveEmptyNote")}
            </p>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("dialog.statusToDownload")}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {t("download.selectAll")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectNone}
                >
                  {t("download.deselectAll")}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedStatuses.includes(option.value)}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                  />
                  <Label htmlFor={option.value} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName">{t("file.fileName")}</Label>
            <div className="flex items-center">
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="rounded-r-none"
              />
              <div className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-500">
                .jsonl
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={downloadMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={
              downloadMutation.isPending ||
              selectedStatuses.length === 0 ||
              !fileName.trim()
            }
          >
            {downloadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("download.downloading")}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t("download.download")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
