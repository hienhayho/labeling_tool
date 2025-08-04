"use client";

interface MessageContentProps {
  role: string;
  content: string;
}

export function MessageContent({ role, content }: MessageContentProps) {
  if (role === "tool_call" || role === "tool_response") {
    return (
      <div className="bg-gray-100 p-3 rounded">
        <pre className="text-xs whitespace-pre-wrap break-words font-sans">
          {content}
        </pre>
      </div>
    );
  }

  // Extract and display think content
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  const thinkContent = thinkMatch ? thinkMatch[1].trim() : null;
  const regularContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();

  return (
    <div className="space-y-3">
      {thinkContent && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-xs font-medium text-blue-700">Suy nghĩ</span>
          </div>
          <div className="text-sm text-blue-800 whitespace-pre-wrap">
            {thinkContent}
          </div>
        </div>
      )}
      {regularContent && (
        <div className="whitespace-pre-wrap text-sm">{regularContent}</div>
      )}
    </div>
  );
}
