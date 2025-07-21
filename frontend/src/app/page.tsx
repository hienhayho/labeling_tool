"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Labelling Tool
                </h1>
                <p className="text-sm text-gray-600">
                  Công cụ gán nhãn dữ liệu AI
                </p>
              </div>
            </div>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Gán nhãn dữ liệu
              <span className="text-orange-500"> thông minh</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Công cụ mạnh mẽ giúp bạn gán nhãn dữ liệu hội thoại AI một cách
              hiệu quả và chính xác. Hỗ trợ đa người dùng, quản lý dự án và xuất
              dữ liệu dễ dàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
              >
                <Link href="/login">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Link href="#features">
                  Xem tính năng
                  <Play className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá những tính năng mạnh mẽ giúp việc gán nhãn dữ liệu trở
              nên dễ dàng và hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Conversation Labelling */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Gán nhãn theo đoạn hội thoại
                </h3>
                <p className="text-gray-600">
                  Gán nhãn từng tin nhắn trong cuộc hội thoại một cách chi tiết
                  và có cấu trúc. Hỗ trợ đa vai trò (user, assistant) và định
                  dạng đặc biệt.
                </p>
              </CardContent>
            </Card>

            {/* Multi-user Support */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Hỗ trợ đa người dùng
                </h3>
                <p className="text-gray-600">
                  Phân công công việc cho nhiều người dùng cùng lúc. Theo dõi
                  tiến độ và chất lượng công việc của từng thành viên.
                </p>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Quản lý dự án
                </h3>
                <p className="text-gray-600">
                  Tạo và quản lý nhiều dự án gán nhãn. Theo dõi trạng thái, tiến
                  độ và xuất dữ liệu dễ dàng.
                </p>
              </CardContent>
            </Card>

            {/* Quality Control */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Kiểm soát chất lượng
                </h3>
                <p className="text-gray-600">
                  Hệ thống phê duyệt và kiểm tra chất lượng. Đảm bảo dữ liệu
                  được gán nhãn chính xác và nhất quán.
                </p>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Báo cáo và thống kê
                </h3>
                <p className="text-gray-600">
                  Dashboard thống kê chi tiết với biểu đồ trực quan. Theo dõi
                  hiệu suất và tiến độ dự án theo thời gian thực.
                </p>
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Xuất dữ liệu nhanh chóng
                </h3>
                <p className="text-gray-600">
                  Xuất dữ liệu đã gán nhãn dưới định dạng JSONL. Lọc theo trạng
                  thái và giới hạn số lượng theo nhu cầu.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cách hoạt động
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quy trình gán nhãn dữ liệu đơn giản và hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tạo dự án
              </h3>
              <p className="text-gray-600">
                Tạo dự án mới và upload dữ liệu hội thoại cần gán nhãn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gán nhãn
              </h3>
              <p className="text-gray-600">
                Xem từng đoạn hội thoại và gán nhãn cho từng tin nhắn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Xuất dữ liệu
              </h3>
              <p className="text-gray-600">
                Xuất dữ liệu đã gán nhãn để sử dụng cho training AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-orange-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng chúng tôi để tạo ra những bộ dữ liệu chất lượng cao
            cho AI
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            <Link href="/login">
              Đăng nhập ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Labelling Tool</h3>
                  <p className="text-sm text-gray-400">
                    Công cụ gán nhãn dữ liệu AI
                  </p>
                </div>
              </div>
              <p className="text-gray-400">
                Công cụ mạnh mẽ giúp bạn gán nhãn dữ liệu hội thoại AI một cách
                hiệu quả và chính xác.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Tính năng</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Gán nhãn hội thoại</li>
                <li>Quản lý dự án</li>
                <li>Đa người dùng</li>
                <li>Xuất dữ liệu</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hướng dẫn sử dụng</li>
                <li>FAQ</li>
                <li>Liên hệ</li>
                <li>Báo lỗi</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@labelingtool.com</li>
                <li>Phone: +84 123 456 789</li>
                <li>Address: Hồ Chí Minh, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Labeling Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
