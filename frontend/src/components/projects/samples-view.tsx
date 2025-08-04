"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LineItemsTable } from "./line-items-table";
import { SamplePreview } from "./sample-preview";

interface SamplesViewProps {
  projectId: number;
  numSamples: number;
  isEnabled: boolean;
}

export function SamplesView({
  projectId,
  numSamples,
  isEnabled,
}: SamplesViewProps) {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<"table" | "preview">("table");
  const [selectedSample, setSelectedSample] = useState<any>(null);

  const handleViewSample = (lineItem: any) => {
    setSelectedSample(lineItem);
    setViewMode("preview");
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setSelectedSample(null);
  };

  if (viewMode === "preview" && selectedSample) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToTable}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("samples.backToList")}
          </Button>
          <h2 className="text-lg font-semibold">
            {t("samples.viewSample")} #{selectedSample.line_index}
          </h2>
        </div>
        <SamplePreview
          projectId={projectId}
          numSamples={numSamples}
          isEnabled={isEnabled}
          initialSampleIndex={selectedSample.line_index}
        />
      </div>
    );
  }

  return (
    <LineItemsTable projectId={projectId} onViewSample={handleViewSample} />
  );
}
