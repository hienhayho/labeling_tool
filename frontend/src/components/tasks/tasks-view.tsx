"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { projectsGetProjectStatus, projectsGetLineItems } from "@/client";
import { LineItemsTable } from "@/components/projects/line-items-table";
import { SamplePreview } from "@/components/projects/sample-preview";

interface TasksViewProps {
  projectId: number;
  numSamples: number;
  isEnabled: boolean;
}

export function TasksView({
  projectId,
  numSamples,
  isEnabled,
}: TasksViewProps) {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(1);
  const { client, headers } = useApi();

  // Fetch project status to get basic info
  const { data: projectStatusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["project-status", projectId],
    queryFn: () =>
      projectsGetProjectStatus({
        client,
        headers,
        path: { project_id: projectId },
      }),
  });

  // Fetch first page of line items to get the first sample
  const { data: lineItemsData, isLoading: isLoadingLineItems } = useQuery({
    queryKey: ["line-items", projectId, 1, 10],
    queryFn: () =>
      projectsGetLineItems({
        client,
        headers,
        path: { project_id: projectId },
        query: { page: 1, limit: 10 },
      }),
  });

  // Set initial selected sample when data is loaded (only if no sample is selected yet)
  useEffect(() => {
    if (
      lineItemsData?.data?.data &&
      lineItemsData.data.data.length > 0 &&
      selectedSampleIndex === 1
    ) {
      setSelectedSampleIndex(lineItemsData.data.data[0].line_index);
    }
  }, [lineItemsData, selectedSampleIndex]);

  const handleSelectSample = (lineItem: any) => {
    setSelectedSampleIndex(lineItem.line_index);
  };

  const handleSampleChange = (sampleIndex: number) => {
    setSelectedSampleIndex(sampleIndex);
  };

  if (isLoadingStatus || isLoadingLineItems) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dự án chưa sẵn sàng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Dự án chưa được kích hoạt. Vui lòng đợi để bắt đầu làm việc.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      <div className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <LineItemsTable
              projectId={projectId}
              onViewSample={handleSelectSample}
              selectedSampleIndex={selectedSampleIndex}
            />
          </div>
        </div>
      </div>

      <div className="h-full overflow-y-auto">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <SamplePreview
              projectId={projectId}
              numSamples={numSamples}
              isEnabled={isEnabled}
              initialSampleIndex={selectedSampleIndex}
              onSampleChange={handleSampleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
