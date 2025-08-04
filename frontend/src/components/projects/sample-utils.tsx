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

export function getRoleText(role: string, t?: any) {
  if (!t) {
    // Fallback to English if no translation function provided
    switch (role.toLowerCase()) {
      case "user":
        return "User";
      case "assistant":
        return "Assistant";
      case "system":
        return "System";
      case "tool_call":
        return "Tool Call";
      case "tool_response":
        return "Tool Response";
      default:
        return role;
    }
  }

  switch (role.toLowerCase()) {
    case "user":
      return t("role.user");
    case "assistant":
      return t("role.assistant");
    case "system":
      return t("role.system");
    case "tool_call":
      return t("role.toolCall");
    case "tool_response":
      return t("role.toolResponse");
    default:
      return role;
  }
}

/**
 * Process content from message to create content for confirm
 * Combine think section with original content, separated by \n
 */
export function processMessageContentForConfirm(
  message: LineItemMessageRead,
): string {
  const content = message.content;

  // Find think section in content
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);

  if (thinkMatch) {
    // Has think section, combine think + original content
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
    // No think section, return original content
    return content;
  }
}
