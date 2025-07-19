"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  projectsGetSampleByIndex,
  projectsConfirmLineItem,
  LineItemMessageRead,
} from "@/client";
import { processMessageContentForConfirm } from "./sample-utils";
import { SampleHeader } from "./sample-header";
import { ToolsSection } from "./tools-section";
import { MessageCard } from "./message-card";
import { SampleInfo } from "./sample-info";
import { ExpandedContentDialog } from "./expanded-content-dialog";
import { EditMessageDialog } from "./edit-message-dialog";
import toast from "react-hot-toast";

interface SamplePreviewProps {
  projectId: number;
  numSamples: number;
  isEnabled: boolean;
  initialSampleIndex?: number;
  onSampleChange?: (sampleIndex: number) => void;
}

export function SamplePreview({
  projectId,
  numSamples,
  isEnabled,
  initialSampleIndex,
  onSampleChange,
}: SamplePreviewProps) {
  const [currentSampleIndex, setCurrentSampleIndex] = useState(
    initialSampleIndex || 1,
  );

  // Update currentSampleIndex when initialSampleIndex changes
  useEffect(() => {
    if (initialSampleIndex && initialSampleIndex !== currentSampleIndex) {
      isUserInteraction.current = false;
      setIsSwitchingSample(true);
      setCurrentSampleIndex(initialSampleIndex);
      // Clear any expanded content when switching samples
      setExpandedContent(null);
      setEditingMessage(null);
      setIsEditDialogOpen(false);
    }
  }, [initialSampleIndex]);

  // Notify parent when sample changes (only when changed by user interaction)
  useEffect(() => {
    if (onSampleChange && currentSampleIndex && isUserInteraction.current) {
      // Add a small delay to prevent rapid calls
      const timeoutId = setTimeout(() => {
        onSampleChange(currentSampleIndex);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [currentSampleIndex, onSampleChange]);
  const [expandedContent, setExpandedContent] = useState<{
    type: "tools" | "conversation" | "message" | "raw";
    title: string;
    content: any;
  } | null>(null);
  const [editingMessage, setEditingMessage] =
    useState<LineItemMessageRead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSwitchingSample, setIsSwitchingSample] = useState(false);
  const { client, headers } = useApi();
  const queryClient = useQueryClient();
  const isUserInteraction = useRef(false);

  const {
    data: sampleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sample", projectId, currentSampleIndex],
    queryFn: () => {
      const result = projectsGetSampleByIndex({
        client,
        headers,
        path: { project_id: projectId, sample_idx: currentSampleIndex },
      });
      toast.success("Tải sample thành công");
      return result;
    },
    enabled:
      isEnabled && currentSampleIndex >= 1 && currentSampleIndex <= numSamples,
  });

  // Reset switching state when loading completes
  useEffect(() => {
    if (!isLoading && isSwitchingSample) {
      setIsSwitchingSample(false);
    }
  }, [isLoading, isSwitchingSample]);

  // Confirm line item mutation
  const confirmMutation = useMutation({
    mutationFn: (lineItemId: number) => {
      if (!sampleData?.data) {
        throw new Error("No sample data available");
      }

      const lineMessages =
        sampleData.data.line_messages?.map((message: LineItemMessageRead) => ({
          id: message.id,
          role: message.role,
          content: processMessageContentForConfirm(message),
        })) || [];

      return projectsConfirmLineItem({
        client,
        headers,
        path: {
          project_id: projectId,
          line_item_id: lineItemId,
        },
        body: {
          line_messages: lineMessages,
          tools: sampleData.data.tools || null,
          feedback: null,
          status: "CONFIRMED" as const,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch sample data
      queryClient.invalidateQueries({
        queryKey: ["sample", projectId, currentSampleIndex],
      });
      // Invalidate line items table
      queryClient.invalidateQueries({
        queryKey: ["line-items", projectId],
      });
      toast.success("Xác nhận sample thành công");
    },
  });

  // Approve line item mutation
  const approveMutation = useMutation({
    mutationFn: (lineItemId: number) => {
      if (!sampleData?.data) {
        throw new Error("No sample data available");
      }

      const lineMessages =
        sampleData.data.line_messages?.map((message: LineItemMessageRead) => ({
          id: message.id,
          role: message.role,
          content: processMessageContentForConfirm(message),
        })) || [];

      return projectsConfirmLineItem({
        client,
        headers,
        path: {
          project_id: projectId,
          line_item_id: lineItemId,
        },
        body: {
          line_messages: lineMessages,
          tools: sampleData.data.tools || null,
          feedback: null,
          status: "APPROVED" as const,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch sample data
      queryClient.invalidateQueries({
        queryKey: ["sample", projectId, currentSampleIndex],
      });
      // Invalidate line items table
      queryClient.invalidateQueries({
        queryKey: ["line-items", projectId],
      });
      toast.success("Phê duyệt sample thành công");
    },
  });

  const handlePrevious = () => {
    if (currentSampleIndex > 1) {
      isUserInteraction.current = true;
      setCurrentSampleIndex(currentSampleIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSampleIndex < numSamples) {
      isUserInteraction.current = true;
      setCurrentSampleIndex(currentSampleIndex + 1);
    }
  };

  const handleExpandTools = () => {
    if (sampleData?.data?.tools) {
      setExpandedContent({
        type: "tools",
        title: "Công cụ có sẵn",
        content: sampleData.data.tools,
      });
    }
  };

  const handleExpandConversation = () => {
    if (sampleData?.data?.line_messages) {
      setExpandedContent({
        type: "conversation",
        title: "Cuộc hội thoại",
        content: sampleData.data.line_messages,
      });
    }
  };

  const handleExpandMessage = (message: LineItemMessageRead) => {
    setExpandedContent({
      type: "message",
      title: `${message.role} #${message.line_message_index}`,
      content: message,
    });
  };

  const handleShowRawContent = (
    content: string,
    role: string,
    index: number,
  ) => {
    setExpandedContent({
      type: "raw",
      title: `Raw Content - ${role} #${index}`,
      content: content,
    });
  };

  const handleCloseDialog = () => {
    setExpandedContent(null);
  };

  const handleConfirm = () => {
    if (sampleData?.data?.id) {
      confirmMutation.mutate(sampleData.data.id);
    }
  };

  const handleApprove = () => {
    if (sampleData?.data?.id) {
      approveMutation.mutate(sampleData.data.id);
    }
  };

  const handleEditMessage = (message: LineItemMessageRead) => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedMessage = (updatedMessage: {
    id: number;
    role: string;
    thinkContent: string;
    originalContent: string;
  }) => {
    // Tạo content mới từ think và original
    let newContent = "";
    if (updatedMessage.thinkContent) {
      newContent = `<think>${updatedMessage.thinkContent}</think>`;
      if (updatedMessage.originalContent) {
        newContent += `\n${updatedMessage.originalContent}`;
      }
    } else {
      newContent = updatedMessage.originalContent;
    }

    // Cập nhật message trong sample data
    if (sampleData?.data?.line_messages) {
      const updatedMessages = sampleData.data.line_messages.map((msg) =>
        msg.id === updatedMessage.id
          ? { ...msg, role: updatedMessage.role, content: newContent }
          : msg,
      );

      // Cập nhật cache
      queryClient.setQueryData(["sample", projectId, currentSampleIndex], {
        ...sampleData,
        data: {
          ...sampleData.data,
          line_messages: updatedMessages,
        },
      });
    }

    setIsEditDialogOpen(false);
    setEditingMessage(null);
    toast.success("Đã cập nhật tin nhắn thành công");
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingMessage(null);
  };

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xem trước mẫu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Vui lòng đợi để xem các mẫu ...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-screen flex flex-col">
        <SampleHeader
          currentSampleIndex={currentSampleIndex}
          numSamples={numSamples}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onConfirm={handleConfirm}
          isConfirming={confirmMutation.isPending}
          onApprove={handleApprove}
          isApproving={approveMutation.isPending}
          isSwitching={isSwitchingSample}
        />
        <CardContent className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-8">
              Có lỗi xảy ra khi tải mẫu: {error.message}
            </div>
          )}

          {sampleData?.data && (
            <div className="space-y-4">
              {/* Tools Section */}
              <ToolsSection
                tools={sampleData.data.tools || []}
                onExpand={handleExpandTools}
              />

              {/* Messages Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Cuộc hội thoại</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandConversation}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Phóng to
                  </Button>
                </div>
                <div className="space-y-4">
                  {sampleData.data.line_messages?.map(
                    (message: LineItemMessageRead) => (
                      <MessageCard
                        key={message.id}
                        message={message}
                        onExpandMessage={handleExpandMessage}
                        onShowRawContent={handleShowRawContent}
                        onEditMessage={handleEditMessage}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Sample Info */}
              <SampleInfo
                id={sampleData.data.id}
                lineIndex={sampleData.data.line_index}
                messageCount={sampleData.data.line_messages?.length || 0}
                createdAt={sampleData.data.created_at?.toString() || ""}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Content Dialog */}
      <ExpandedContentDialog
        expandedContent={expandedContent}
        onClose={handleCloseDialog}
        onShowRawContent={handleShowRawContent}
      />

      {/* Edit Message Dialog */}
      <EditMessageDialog
        message={editingMessage}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEditedMessage}
      />
    </>
  );
}
