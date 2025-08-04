"use client";

import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Trang không tồn tại
          </h2>
          <p className="text-gray-600">
            Trang bạn đang tìm kiếm không được tìm thấy.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full sm:w-auto ml-0 sm:ml-3"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
