"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineItemAuditLogRead, LineItemMessageAuditLogRead } from "@/client";
import { useTranslations } from "next-intl";
import {
  User,
  Clock,
  Globe,
  Monitor,
  FileText,
  Edit,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { HighlightedDiff, JsonDiff } from "./audit-log-utils";

interface AuditLogCardProps {
  log: LineItemAuditLogRead | LineItemMessageAuditLogRead;
  isLineItemLog: boolean;
}

export function AuditLogCard({ log, isLineItemLog }: AuditLogCardProps) {
  const t = useTranslations();

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <FileText className="h-4 w-4" />;
      case "UPDATE":
      case "STATUS_CHANGE":
        return <Edit className="h-4 w-4" />;
      case "DELETE":
        return <Trash className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
      case "STATUS_CHANGE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderChanges = () => {
    const changes = [];

    if (isLineItemLog) {
      const lineItemLog = log as LineItemAuditLogRead;

      // Status change
      if (lineItemLog.old_status || lineItemLog.new_status) {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "UNLABELED":
              return "text-gray-600 bg-gray-100";
            case "CONFIRMED":
              return "text-blue-700 bg-blue-100";
            case "APPROVED":
              return "text-green-700 bg-green-100";
            case "REJECTED":
              return "text-red-700 bg-red-100";
            default:
              return "text-gray-600 bg-gray-100";
          }
        };

        changes.push(
          <div key="status" className="mb-2">
            <span className="font-semibold">{t("audit.status")}:</span>
            <div className="inline-flex items-center gap-2 ml-2">
              {lineItemLog.old_status && (
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(lineItemLog.old_status)}`}
                >
                  {t(`status.${lineItemLog.old_status.toLowerCase()}`)}
                </span>
              )}
              {lineItemLog.old_status && lineItemLog.new_status && (
                <span className="mx-1">→</span>
              )}
              {lineItemLog.new_status && (
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(lineItemLog.new_status)}`}
                >
                  {t(`status.${lineItemLog.new_status.toLowerCase()}`)}
                </span>
              )}
            </div>
          </div>,
        );
      }

      // Feedback change
      if (lineItemLog.old_feedback || lineItemLog.new_feedback) {
        changes.push(
          <div key="feedback" className="mb-2">
            <span className="font-semibold">{t("audit.feedback")}:</span>
            <div className="ml-4 mt-1">
              <HighlightedDiff
                oldText={lineItemLog.old_feedback}
                newText={lineItemLog.new_feedback}
              />
            </div>
          </div>,
        );
      }

      // Tools change
      if (lineItemLog.old_tools || lineItemLog.new_tools) {
        changes.push(
          <div key="tools" className="mb-4">
            <div className="font-semibold mb-2">{t("audit.tools")}:</div>
            <JsonDiff
              oldJson={lineItemLog.old_tools}
              newJson={lineItemLog.new_tools}
            />
          </div>,
        );
      }
    } else {
      const messageLog = log as LineItemMessageAuditLogRead;

      // Role change
      if (messageLog.old_role || messageLog.new_role) {
        changes.push(
          <div key="role" className="mb-2">
            <span className="font-semibold">{t("audit.role")}:</span>
            {messageLog.old_role && (
              <span className="text-gray-600"> {messageLog.old_role}</span>
            )}
            {messageLog.old_role && messageLog.new_role && (
              <span className="mx-2">→</span>
            )}
            {messageLog.new_role && (
              <span className="text-green-600"> {messageLog.new_role}</span>
            )}
          </div>,
        );
      }

      // Content change
      if (messageLog.old_content || messageLog.new_content) {
        changes.push(
          <div key="content" className="mb-2">
            <span className="font-semibold">{t("audit.content")}:</span>
            <div className="ml-4 mt-1">
              <details open className="group">
                <summary className="cursor-pointer text-blue-600 text-sm font-medium mb-2">
                  {t("audit.showChanges")}
                </summary>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-y-auto">
                  <HighlightedDiff
                    oldText={messageLog.old_content}
                    newText={messageLog.new_content}
                  />
                </div>
              </details>
            </div>
          </div>,
        );
      }
    }

    return changes;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getActionIcon(log.action)}
            <Badge className={getActionColor(log.action)}>
              {t(`audit.action.${log.action.toLowerCase()}`)}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {format(new Date(log.timestamp), "PPpp")}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {renderChanges()}

          {/* Metadata */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex flex-wrap gap-4">
              {log.user_id && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {t("audit.userId")}: {log.user_id}
                </div>
              )}
              {log.ip_address && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {log.ip_address}
                </div>
              )}
              {log.user_agent && (
                <div className="flex items-center gap-1" title={log.user_agent}>
                  <Monitor className="h-3 w-3" />
                  <span className="truncate max-w-xs">{log.user_agent}</span>
                </div>
              )}
            </div>
            {log.additional_data &&
              Object.keys(log.additional_data).length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">
                    {t("audit.additionalData")}
                  </summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify(log.additional_data, null, 2)}
                  </pre>
                </details>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
