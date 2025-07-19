import { CheckCircle, User, Bot, Wrench } from "lucide-react";
import { LineItemMessageRead } from "@/client";

export function getRoleIcon(role: string) {
  switch (role.toLowerCase()) {
    case "user":
      return <User className="h-4 w-4" />;
    case "assistant":
      return <Bot className="h-4 w-4" />;
    case "system":
      return <CheckCircle className="h-4 w-4" />;
    case "tool_call":
    case "tool_response":
      return <Wrench className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
}

export function getRoleColor(role: string) {
  switch (role.toLowerCase()) {
    case "user":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "assistant":
      return "bg-green-100 text-green-800 border-green-200";
    case "system":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "tool_call":
    case "tool_response":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getRoleText(role: string) {
  switch (role.toLowerCase()) {
    case "user":
      return "Người dùng";
    case "assistant":
      return "Trợ lý";
    case "system":
      return "Hệ thống";
    case "tool_call":
      return "Gọi công cụ";
    case "tool_response":
      return "Phản hồi công cụ";
    default:
      return role;
  }
}

/**
 * Xử lý content từ message để tạo ra content cho confirm
 * Kết hợp phần think (suy luận) với content gốc, cách nhau bởi \n
 */
export function processMessageContentForConfirm(
  message: LineItemMessageRead,
): string {
  const content = message.content;

  // Tìm phần think trong content
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);

  if (thinkMatch) {
    // Có phần think, kết hợp think + content gốc
    const thinkContent = `<think>${thinkMatch[1].trim()}</think>`;
    const originalContent = content
      .replace(/<think>[\s\S]*?<\/think>/, "")
      .trim();

    if (originalContent) {
      return `${thinkContent}\n${originalContent}`;
    } else {
      return thinkContent;
    }
  } else {
    // Không có phần think, trả về content gốc
    return content;
  }
}
