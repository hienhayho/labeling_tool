"use client";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface SampleHeaderProps {
  currentSampleIndex: number;
  numSamples: number;
  onPrevious: () => void;
  onNext: () => void;
  onConfirm?: () => void;
  isConfirming?: boolean;
  onApprove?: () => void;
  isApproving?: boolean;
  isSwitching?: boolean;
}

export function SampleHeader({
  currentSampleIndex,
  numSamples,
  onPrevious,
  onNext,
  onConfirm,
  isConfirming,
  onApprove,
  isApproving,
  isSwitching,
}: SampleHeaderProps) {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser || false;
  return (
    <CardHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b">
      <CardTitle className="flex items-center justify-between">
        <span>Xem trước mẫu</span>
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
              variant="secondary"
              size="sm"
              onClick={onApprove}
              disabled={isApproving}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isApproving ? "Đang phê duyệt..." : "Phê duyệt"}
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
