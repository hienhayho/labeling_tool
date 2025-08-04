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
  projectsUpdateLineItemMessage,
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
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

interface SamplePreviewProps {
  projectId: number;
  numSamples: number;
  isEnabled: boolean;
  initialSampleIndex?: number;
  onSampleChange?: (sampleIndex: number) => void;
}

const renderMessage = (
  message: LineItemMessageRead,
  isSuperuser: boolean,
  onExpandMessage: (message: LineItemMessageRead) => void,
  onShowRawContent: (content: string, role: string, index: number) => void,
  onEditMessage: (message: LineItemMessageRead) => void,
) => {
  if (message.role === "system") {
    if (!isSuperuser) {
      return null;
    }
  }
  return (
    <MessageCard
      key={message.id}
      message={message}
      onExpandMessage={onExpandMessage}
      onShowRawContent={onShowRawContent}
      onEditMessage={onEditMessage}
    />
  );
};

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
  const { user } = useAuth();
  const t = useTranslations();

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
      toast.success(t("samples.loadSuccess"));
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
      toast.success(t("sample.confirmSuccess"));
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
      toast.success(t("sample.approveSuccess"));
    },
  });

  // Approve line item mutation
  const rejectMutation = useMutation({
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
          status: "REJECTED" as const,
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
      toast.success(t("sample.rejectSuccess"));
    },
  });

  // Update line item message mutation
  const updateMessageMutation = useMutation({
    mutationFn: (data: {
      messageId: number;
      role: string;
      content: string;
    }) => {
      return projectsUpdateLineItemMessage({
        client,
        headers,
        path: {
          project_id: projectId,
          line_item_message_id: data.messageId,
        },
        body: {
          role: data.role,
          content: data.content,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch sample data
      queryClient.invalidateQueries({
        queryKey: ["sample", projectId, currentSampleIndex],
      });
      toast.success(t("message.updateSuccess"));
    },
    onError: (error) => {
      toast.error(t("message.updateError"));
      console.error("Error updating message:", error);
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
        title: t("sample.availableTools"),
        content: sampleData.data.tools,
      });
    }
  };

  const handleExpandConversation = () => {
    if (sampleData?.data?.line_messages) {
      setExpandedContent({
        type: "conversation",
        title: t("sample.conversation"),
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

  const handleReject = () => {
    if (sampleData?.data?.id) {
      rejectMutation.mutate(sampleData.data.id);
    }
  };

  const handleEditMessage = (message: LineItemMessageRead) => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedMessage = async (updatedMessage: {
    id: number;
    role: string;
    thinkContent: string;
    originalContent: string;
  }) => {
    // Create new content from think and original
    let newContent = "";
    if (updatedMessage.thinkContent) {
      newContent = `<think>${updatedMessage.thinkContent}</think>`;
      if (updatedMessage.originalContent) {
        newContent += `\n${updatedMessage.originalContent}`;
      }
    } else {
      newContent = updatedMessage.originalContent;
    }

    // Call API to update the message
    updateMessageMutation.mutate({
      messageId: updatedMessage.id,
      role: updatedMessage.role,
      content: newContent,
    });

    setIsEditDialogOpen(false);
    setEditingMessage(null);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingMessage(null);
  };

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("samples.preview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            {t("sample.waitToView")}
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
          status={sampleData?.data?.status ?? "UNLABELED"}
          onConfirm={handleConfirm}
          isConfirming={confirmMutation.isPending}
          onApprove={handleApprove}
          isApproving={approveMutation.isPending}
          onReject={handleReject}
          isRejecting={rejectMutation.isPending}
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
              {t("sample.loadError")}: {error.message}
            </div>
          )}

          {sampleData?.data && (
            <div className="space-y-4">
              {/* Tools Section - Only for superusers */}
              {user?.is_superuser && (
                <ToolsSection
                  tools={sampleData.data.tools || []}
                  onExpand={handleExpandTools}
                />
              )}

              {/* Messages Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {t("sample.conversation")}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandConversation}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    {t("message.expand")}
                  </Button>
                </div>
                <div className="space-y-4">
                  {sampleData.data.line_messages?.map(
                    (message: LineItemMessageRead) =>
                      renderMessage(
                        message,
                        user?.is_superuser || false,
                        handleExpandMessage,
                        handleShowRawContent,
                        handleEditMessage,
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
