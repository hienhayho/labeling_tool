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

const ROLE_OPTIONS = [
  { value: "user", label: "Người dùng" },
  { value: "assistant", label: "Trợ lý" },
  { value: "system", label: "Hệ thống" },
  { value: "tool_call", label: "Gọi công cụ" },
  { value: "tool_response", label: "Phản hồi công cụ" },
];

export function EditMessageDialog({
  message,
  isOpen,
  onClose,
  onSave,
}: EditMessageDialogProps) {
  const [role, setRole] = useState("");
  const [thinkContent, setThinkContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    if (message) {
      setRole(message.role);

      // Tách think content và original content
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

    // Tạo content mới từ think và original
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
          <DialogTitle>Chỉnh sửa tin nhắn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
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
            <Label htmlFor="think-content">Phần suy luận (Think)</Label>
            <Textarea
              id="think-content"
              placeholder="Nhập phần suy luận..."
              value={thinkContent}
              onChange={(e) => setThinkContent(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Phần suy luận sẽ được đặt trong thẻ &lt;think&gt;...&lt;/think&gt;
            </p>
          </div>

          {/* Original Content */}
          <div className="space-y-2">
            <Label htmlFor="original-content">Nội dung chính</Label>
            <Textarea
              id="original-content"
              placeholder="Nhập nội dung chính..."
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              rows={6}
              className="text-sm"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Xem trước nội dung</Label>
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
                originalContent || "Chưa có nội dung"
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
