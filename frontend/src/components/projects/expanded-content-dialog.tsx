"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";
import { MessageContent } from "./message-content";
import { LineItemMessageRead } from "@/client";
import { getRoleIcon, getRoleColor, getRoleText } from "./sample-utils";
import { useTranslations } from "next-intl";

interface ExpandedContentDialogProps {
  expandedContent: {
    type: "tools" | "conversation" | "message" | "raw";
    title: string;
    content: any;
  } | null;
  onClose: () => void;
  onShowRawContent: (content: string, role: string, index: number) => void;
}

export function ExpandedContentDialog({
  expandedContent,
  onClose,
  onShowRawContent,
}: ExpandedContentDialogProps) {
  const t = useTranslations();
  if (!expandedContent) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-none max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expandedContent.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {expandedContent.type === "tools" && (
            <div className="space-y-4">
              {expandedContent.content.map((tool: any, index: number) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1 flex-shrink-0">
                        {tool.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm break-words">
                          {tool.function?.name || "Unknown Function"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 break-words">
                          {tool.function?.description || "No description"}
                        </p>
                        {tool.function?.parameters && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">
                              Parameters:
                            </h5>
                            <div className="bg-gray-100 p-3 rounded">
                              <pre className="text-xs whitespace-pre-wrap break-words font-sans">
                                {JSON.stringify(
                                  tool.function.parameters,
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          </div>
                        )}
                        {tool.function?.output && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">
                              Output:
                            </h5>
                            <div className="bg-gray-100 p-3 rounded">
                              <pre className="text-xs whitespace-pre-wrap break-words font-sans">
                                {JSON.stringify(tool.function.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {expandedContent.type === "conversation" && (
            <div className="space-y-4">
              {expandedContent.content.map((message: LineItemMessageRead) => (
                <Card key={message.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(message.role)}
                          <Badge className={getRoleColor(message.role)}>
                            {getRoleText(message.role, t)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            #{message.line_message_index}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              onShowRawContent(
                                message.content,
                                message.role,
                                message.line_message_index,
                              )
                            }
                          >
                            <Code className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <MessageContent
                          role={message.role}
                          content={message.content}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {expandedContent.type === "message" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getRoleIcon(expandedContent.content.role)}
                  <Badge className={getRoleColor(expandedContent.content.role)}>
                    {getRoleText(expandedContent.content.role, t)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    #{expandedContent.content.line_message_index}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onShowRawContent(
                      expandedContent.content.content,
                      expandedContent.content.role,
                      expandedContent.content.line_message_index,
                    )
                  }
                >
                  <Code className="h-4 w-4 mr-2" />
                  {t("message.rawContent")}
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <MessageContent
                  role={expandedContent.content.role}
                  content={expandedContent.content.content}
                />
              </div>
            </div>
          )}

          {expandedContent.type === "raw" && (
            <div>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    {t("message.originalContent")}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {t("message.rawContent")}
                  </Badge>
                </div>
                <div className="bg-white border rounded p-3">
                  <pre className="text-xs whitespace-pre-wrap break-words text-gray-800 font-sans">
                    {expandedContent.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
