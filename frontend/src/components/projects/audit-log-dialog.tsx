"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { AuditLogCard } from "./audit-log-card";
import {
  LineItemAuditLogRead,
  LineItemMessageAuditLogRead,
  projectsGetLineItemAuditLogsRoute,
  projectsGetLineItemMessageAuditLogsRoute,
} from "@/client";
import { useTranslations } from "next-intl";
import { RefreshCw, Loader2 } from "lucide-react";

interface AuditLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  lineItemId: number;
}

export function AuditLogDialog({
  isOpen,
  onClose,
  projectId,
  lineItemId,
}: AuditLogDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"line-item" | "messages">(
    "line-item",
  );
  const { client, headers } = useApi();
  const t = useTranslations();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch line item audit logs
  const {
    data: lineItemLogs,
    isLoading: isLoadingLineItem,
    refetch: refetchLineItem,
  } = useQuery({
    queryKey: ["audit-logs", "line-item", projectId, lineItemId, currentPage],
    queryFn: () =>
      projectsGetLineItemAuditLogsRoute({
        client,
        headers,
        path: { project_id: projectId },
        query: {
          line_item_id: lineItemId,
          page: currentPage,
          limit: 10,
        },
      }),
    enabled: isOpen && activeTab === "line-item",
  });

  // Fetch line item message audit logs
  const {
    data: messageLogs,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["audit-logs", "messages", projectId, lineItemId, currentPage],
    queryFn: () =>
      projectsGetLineItemMessageAuditLogsRoute({
        client,
        headers,
        path: { project_id: projectId },
        query: {
          line_item_id: lineItemId,
          page: currentPage,
          limit: 10,
        },
      }),
    enabled: isOpen && activeTab === "messages",
  });

  // Reset page when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Auto-refresh when dialog opens or tab changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (activeTab === "line-item") {
          refetchLineItem();
        } else {
          refetchMessages();
        }
      }, 100); // Small delay to ensure state is updated
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, refetchLineItem, refetchMessages]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "line-item") {
        await refetchLineItem();
      } else {
        await refetchMessages();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLineItemAuditLog = (log: any): log is LineItemAuditLogRead => {
    return "old_status" in log || "new_status" in log;
  };

  const currentLogs =
    activeTab === "line-item" ? lineItemLogs?.data : messageLogs?.data;
  const isLoading =
    activeTab === "line-item" ? isLoadingLineItem : isLoadingMessages;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <div className="flex items-center justify-between gap-2">
              <span>{t("audit.dialogTitle")}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="line-item">
              {t("audit.lineItemLogs")}
            </TabsTrigger>
            <TabsTrigger value="messages">{t("audit.messageLogs")}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="h-[500px] overflow-y-auto pr-4">
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-around justify-between">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="pt-2 border-t">
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading &&
                currentLogs?.data &&
                currentLogs.data.length > 0 && (
                  <div className="space-y-4">
                    {currentLogs.data.map((log) => (
                      <AuditLogCard
                        key={log.id}
                        log={log}
                        isLineItemLog={isLineItemAuditLog(log)}
                      />
                    ))}
                  </div>
                )}

              {!isLoading &&
                (!currentLogs?.data || currentLogs.data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    {t("audit.noLogs")}
                  </div>
                )}
            </div>

            {/* Pagination */}
            {currentLogs && currentLogs.total_pages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t("common.previous")}
                </Button>
                <span className="text-sm text-gray-600">
                  {t("common.pageOf", {
                    current: currentPage,
                    total: currentLogs.total_pages,
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= currentLogs.total_pages}
                >
                  {t("common.next")}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
