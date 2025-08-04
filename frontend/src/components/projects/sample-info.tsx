"use client";

import { useTranslations } from "next-intl";

interface SampleInfoProps {
  id: number;
  lineIndex: number;
  messageCount: number;
  createdAt: string;
}

export function SampleInfo({
  id,
  lineIndex,
  messageCount,
  createdAt,
}: SampleInfoProps) {
  const t = useTranslations();
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">
            {t("sample.sampleId")}:
          </span>
          <span className="ml-2">{id}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">
            {t("sample.index")}:
          </span>
          <span className="ml-2">{lineIndex}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">
            {t("samples.numMessages")}:
          </span>
          <span className="ml-2">{messageCount}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">
            {t("table.createdAt")}:
          </span>
          <span className="ml-2">
            {createdAt ? new Date(createdAt).toLocaleString("vi-VN") : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
