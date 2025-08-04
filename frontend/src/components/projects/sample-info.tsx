"use client";

interface SampleInfoProps {
  id: number;
  lineIndex: number;
  messageCount: number;
  createdAt: string;
}

export function SampleInfo({
  id,
  lineIndex,
  messageCount,
  createdAt,
}: SampleInfoProps) {
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">ID mẫu:</span>
          <span className="ml-2">{id}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Index:</span>
          <span className="ml-2">{lineIndex}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Số tin nhắn:</span>
          <span className="ml-2">{messageCount}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Ngày tạo:</span>
          <span className="ml-2">
            {createdAt ? new Date(createdAt).toLocaleString("vi-VN") : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
