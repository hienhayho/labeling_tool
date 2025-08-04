"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function ProgressDemo() {
  const t = useTranslations();
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [total] = useState(3349);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {
        const newCurrent = prev + Math.floor(Math.random() * 50) + 10;
        if (newCurrent >= total) {
          setProgress(100);
          clearInterval(interval);
          return total;
        }
        const newProgress = (newCurrent / total) * 100;
        setProgress(newProgress);
        return newCurrent;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [total]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Demo Progress Bar
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {t("progress.processing")}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t("progress.title")}:</span>
              <span className="font-medium">
                {progress.toFixed(1)}%
                <span className="text-gray-500 ml-1">
                  ({current}/{total})
                </span>
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="text-xs text-gray-500">
            {t("progress.sampleData")}: {progress.toFixed(1)}% - {current}/
            {total}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
