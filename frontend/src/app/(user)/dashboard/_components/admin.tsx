"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { useApi } from "@/hooks/use-api";
import { projectsGetDashboard } from "@/client";
import {
  Loader2,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const STATUS_COLORS = ["#FFBB28", "#00C49F", "#0088FE", "#FF8042"];

export default function DashboardAdminPage() {
  const { client, headers } = useApi();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      projectsGetDashboard({
        client,
        headers,
      }),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnMount: true, // Refetch when component mounts
    staleTime: 0, // Data is always considered stale
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải dữ liệu dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 text-center py-8">
              Có lỗi xảy ra khi tải dữ liệu dashboard: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData?.data || dashboardData.data.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có dữ liệu thống kê.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tính toán tổng quan
  const totalProjects = dashboardData.data.length;
  const totalSamples = dashboardData.data.reduce(
    (sum, project) => sum + project.num_samples,
    0,
  );
  const totalUsers = new Set(
    dashboardData.data.flatMap((project) =>
      project.user_task_summary.map((user) => user.user_id),
    ),
  ).size;

  // Dữ liệu cho biểu đồ tổng quan
  const overviewData = [
    {
      name: "Dự án",
      value: totalProjects,
      icon: FileText,
      color: "#0088FE",
    },
    {
      name: "Mẫu dữ liệu",
      value: totalSamples,
      icon: FileText,
      color: "#00C49F",
    },
    {
      name: "Người dùng",
      value: totalUsers,
      icon: Users,
      color: "#FFBB28",
    },
  ];

  // Dữ liệu cho biểu đồ trạng thái tổng hợp
  const statusData = dashboardData.data
    .flatMap((project) =>
      project.user_task_summary.flatMap((user) => [
        {
          name: "Chờ xử lý",
          value: user.unlabeled,
          project: project.project_name,
          user: user.full_name,
        },
        {
          name: "Hoàn thành",
          value: user.confirmed,
          project: project.project_name,
          user: user.full_name,
        },
        {
          name: "Đã duyệt",
          value: user.approved,
          project: project.project_name,
          user: user.full_name,
        },
        {
          name: "Lỗi",
          value: user.rejected,
          project: project.project_name,
          user: user.full_name,
        },
      ]),
    )
    .reduce(
      (acc, item) => {
        const existing = acc.find((x) => x.name === item.name);
        if (existing) {
          existing.value += item.value;
        } else {
          acc.push({ name: item.name, value: item.value });
        }
        return acc;
      },
      [] as { name: string; value: number }[],
    );

  // Dữ liệu cho biểu đồ cột theo dự án
  const projectData = dashboardData.data.map((project) => {
    const totalTasks = project.user_task_summary.reduce(
      (sum, user) => sum + user.task_count,
      0,
    );
    const totalConfirmed = project.user_task_summary.reduce(
      (sum, user) => sum + user.confirmed,
      0,
    );
    const totalApproved = project.user_task_summary.reduce(
      (sum, user) => sum + user.approved,
      0,
    );
    const totalRejected = project.user_task_summary.reduce(
      (sum, user) => sum + user.rejected,
      0,
    );

    return {
      name: project.project_name,
      "Tổng số": totalTasks,
      "Hoàn thành": totalConfirmed,
      "Đã duyệt": totalApproved,
      Lỗi: totalRejected,
      "Chờ xử lý": totalTasks - totalConfirmed - totalApproved - totalRejected,
    };
  });

  // Dữ liệu cho biểu đồ cột theo người dùng
  const userData = dashboardData.data.flatMap((project) =>
    project.user_task_summary.map((user) => ({
      name: user.full_name,
      "Tổng số": user.task_count,
      "Hoàn thành": user.confirmed,
      "Đã duyệt": user.approved,
      Lỗi: user.rejected,
      "Chờ xử lý": user.unlabeled,
      project: project.project_name,
    })),
  );

  // Dữ liệu cho biểu đồ đường tiến độ
  const progressData = dashboardData.data.map((project) => {
    const totalTasks = project.user_task_summary.reduce(
      (sum, user) => sum + user.task_count,
      0,
    );
    const completedTasks = project.user_task_summary.reduce(
      (sum, user) => sum + user.confirmed + user.approved,
      0,
    );
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      name: project.project_name,
      "Tiến độ (%)": Math.round(progress),
      "Tổng số": totalTasks,
      "Hoàn thành": completedTasks,
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Cập nhật tự động mỗi 30 giây
        </Badge>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overviewData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Biểu đồ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="projects">Theo dự án</TabsTrigger>
          <TabsTrigger value="users">Theo người dùng</TabsTrigger>
          <TabsTrigger value="progress">Tiến độ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biểu đồ tròn - Trạng thái tổng hợp */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái tổng hợp</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Biểu đồ cột - Số lượng mẫu theo dự án */}
            <Card>
              <CardHeader>
                <CardTitle>Số lượng mẫu theo dự án</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="num_samples" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Chờ xử lý" stackId="a" fill="#FFBB28" />
                  <Bar dataKey="Hoàn thành" stackId="a" fill="#00C49F" />
                  <Bar dataKey="Đã duyệt" stackId="a" fill="#0088FE" />
                  <Bar dataKey="Lỗi" stackId="a" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Chờ xử lý" stackId="a" fill="#FFBB28" />
                  <Bar dataKey="Hoàn thành" stackId="a" fill="#00C49F" />
                  <Bar dataKey="Đã duyệt" stackId="a" fill="#0088FE" />
                  <Bar dataKey="Lỗi" stackId="a" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biểu đồ đường - Tiến độ */}
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ hoàn thành</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Tiến độ (%)"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Biểu đồ vùng - So sánh hoàn thành */}
            <Card>
              <CardHeader>
                <CardTitle>So sánh hoàn thành</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Tổng số"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="Hoàn thành"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Chi tiết dự án */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.data.map((project) => (
              <div key={project.project_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {project.project_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {project.project_description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {project.num_samples.toLocaleString()} mẫu
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {project.user_task_summary.map((user) => {
                    const pieData = [
                      {
                        name: "Chờ xử lý",
                        value: user.unlabeled,
                      },
                      {
                        name: "Hoàn thành",
                        value: user.confirmed,
                      },
                      {
                        name: "Đã duyệt",
                        value: user.approved,
                      },
                      {
                        name: "Lỗi",
                        value: user.rejected,
                      },
                    ];
                    return (
                      <div
                        key={user.user_id}
                        className="border rounded p-3 flex items-center gap-3"
                      >
                        {/* Pie chart nhỏ */}
                        <div className="flex-shrink-0">
                          <PieChart width={60} height={60}>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={18}
                              outerRadius={28}
                              dataKey="value"
                              stroke="none"
                            >
                              {pieData.map((entry, idx) => (
                                <Cell
                                  key={`cell-${idx}`}
                                  fill={
                                    STATUS_COLORS[idx % STATUS_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </div>
                        {/* Số liệu */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{user.full_name}</h4>
                            <Badge variant="secondary">
                              {user.task_count} tasks
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                                Chờ xử lý
                              </span>
                              <span className="font-medium">
                                {user.unlabeled}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                Hoàn thành
                              </span>
                              <span className="font-medium">
                                {user.confirmed}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1 text-blue-500" />
                                Đã duyệt
                              </span>
                              <span className="font-medium">
                                {user.approved}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                                Lỗi
                              </span>
                              <span className="font-medium">
                                {user.rejected}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
