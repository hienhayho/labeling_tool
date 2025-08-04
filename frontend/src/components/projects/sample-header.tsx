"use client";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";

interface SampleHeaderProps {
  currentSampleIndex: number;
  numSamples: number;
  onPrevious: () => void;
  onNext: () => void;
  status: string;
  onConfirm?: () => void;
  isConfirming?: boolean;
  onApprove?: () => void;
  isApproving?: boolean;
  onReject?: () => void;
  isRejecting?: boolean;
  isSwitching?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "UNLABELED":
      return <Badge variant="secondary">Chờ xử lý</Badge>;
    case "CONFIRMED":
      return <Badge variant="default">Hoàn thành</Badge>;
    case "APPROVED":
      return <Badge variant="success">Đã duyệt</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
};

export function SampleHeader({
  currentSampleIndex,
  numSamples,
  onPrevious,
  onNext,
  status,
  onConfirm,
  isConfirming,
  onApprove,
  isApproving,
  onReject,
  isRejecting,
  isSwitching,
}: SampleHeaderProps) {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser || false;
  return (
    <CardHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Xem trước mẫu</span>
          {getStatusBadge(status)}
        </div>
        <div className="flex items-center gap-2">
          {onConfirm && (
            <Button
              variant="default"
              size="sm"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              <Check className="h-4 w-4 mr-2" />
              {isConfirming ? "Đang xác nhận..." : "Xác nhận"}
            </Button>
          )}
          {isSuperuser && onApprove && (
            <Button
              variant="success"
              size="sm"
              onClick={onApprove}
              disabled={isApproving}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {isApproving ? "Đang phê duyệt..." : "Phê duyệt"}
            </Button>
          )}
          {isSuperuser && onReject && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onReject}
              disabled={isRejecting}
            >
              <ShieldX className="h-4 w-4 mr-2" />
              {isRejecting ? "Đang từ chối..." : "Từ chối"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={currentSampleIndex <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium flex items-center gap-2">
            {isSwitching && <Loader2 className="h-3 w-3 animate-spin" />}
            {currentSampleIndex} / {numSamples}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentSampleIndex >= numSamples}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
}
