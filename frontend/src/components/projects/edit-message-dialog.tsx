"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItemMessageRead } from "@/client";
import { useTranslations } from "next-intl";

interface EditMessageDialogProps {
  message: LineItemMessageRead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMessage: {
    id: number;
    role: string;
    thinkContent: string;
    originalContent: string;
  }) => void;
}

const getRoleOptions = (t: any) => [
  { value: "user", label: t("role.user") },
  { value: "assistant", label: t("role.assistant") },
  { value: "system", label: t("role.system") },
  { value: "tool_call", label: t("role.toolCall") },
  { value: "tool_response", label: t("role.toolResponse") },
];

export function EditMessageDialog({
  message,
  isOpen,
  onClose,
  onSave,
}: EditMessageDialogProps) {
  const t = useTranslations();
  const ROLE_OPTIONS = getRoleOptions(t);
  const [role, setRole] = useState("");
  const [thinkContent, setThinkContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    if (message) {
      setRole(message.role);

      // Split think content and original content
      const content = message.content;
      const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);

      if (thinkMatch) {
        setThinkContent(thinkMatch[1].trim());
        setOriginalContent(
          content.replace(/<think>[\s\S]*?<\/think>/, "").trim(),
        );
      } else {
        setThinkContent("");
        setOriginalContent(content);
      }
    }
  }, [message]);

  const handleSave = () => {
    if (!message) return;

    // Create new content from think and original
    let newContent = "";
    if (thinkContent.trim()) {
      newContent = `<think>${thinkContent.trim()}</think>`;
      if (originalContent.trim()) {
        newContent += `\n${originalContent.trim()}`;
      }
    } else {
      newContent = originalContent.trim();
    }

    onSave({
      id: message.id,
      role,
      thinkContent: thinkContent.trim(),
      originalContent: originalContent.trim(),
    });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialog.editMessage")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">{t("role.role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder={t("role.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Think Content */}
          <div className="space-y-2">
            <Label htmlFor="think-content">{t("message.thinkContent")}</Label>
            <Textarea
              id="think-content"
              placeholder={t("message.enterThinkContent")}
              value={thinkContent}
              onChange={(e) => setThinkContent(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              {t.rich("message.thinkContentNote", {
                think: (chunks) => (
                  <code className="text-blue-600">
                    &lt;think&gt;{chunks}&lt;/think&gt;
                  </code>
                ),
              })}
            </p>
          </div>

          {/* Original Content */}
          <div className="space-y-2">
            <Label htmlFor="original-content">{t("message.mainContent")}</Label>
            <Textarea
              id="original-content"
              placeholder={t("message.enterMainContent")}
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              rows={6}
              className="text-sm"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t("message.preview")}</Label>
            <div className="p-3 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">
              {thinkContent.trim() ? (
                <>
                  <span className="text-blue-600">&lt;think&gt;</span>
                  {thinkContent}
                  <span className="text-blue-600">&lt;/think&gt;</span>
                  {originalContent.trim() && (
                    <>
                      <br />
                      {originalContent}
                    </>
                  )}
                </>
              ) : (
                originalContent || t("message.noContent")
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("message.saveChanges")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
