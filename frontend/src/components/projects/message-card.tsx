"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Code, Edit } from "lucide-react";
import { MessageContent } from "./message-content";
import { LineItemMessageRead } from "@/client";
import { getRoleIcon, getRoleColor, getRoleText } from "./sample-utils";

interface MessageCardProps {
  message: LineItemMessageRead;
  onExpandMessage: (message: LineItemMessageRead) => void;
  onShowRawContent: (content: string, role: string, index: number) => void;
  onEditMessage: (message: LineItemMessageRead) => void;
}

export function MessageCard({
  message,
  onExpandMessage,
  onShowRawContent,
  onEditMessage,
}: MessageCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getRoleIcon(message.role)}
              <Badge className={getRoleColor(message.role)}>
                {getRoleText(message.role)}
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
                onClick={() => onEditMessage(message)}
                title="Chỉnh sửa"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onExpandMessage(message)}
                title="Phóng to"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
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
                title="Xem raw content"
              >
                <Code className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <MessageContent role={message.role} content={message.content} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
