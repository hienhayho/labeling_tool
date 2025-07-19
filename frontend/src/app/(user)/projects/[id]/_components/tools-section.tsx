"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Maximize2 } from "lucide-react";

interface ToolsSectionProps {
  tools: any[];
  onExpand: () => void;
}

export function ToolsSection({ tools, onExpand }: ToolsSectionProps) {
  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Công cụ có sẵn</h3>
        <Button variant="outline" size="sm" onClick={onExpand}>
          <Maximize2 className="h-4 w-4 mr-2" />
          Phóng to
        </Button>
      </div>
      <div className="space-y-2">
        {tools.map((tool: any, index: number) => (
          <Card key={index} className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  {tool.type}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {tool.function?.name || "Unknown Function"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {tool.function?.description || "No description"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
