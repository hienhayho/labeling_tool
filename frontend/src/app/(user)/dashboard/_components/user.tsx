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
import { projectsGetDashboardUser } from "@/client";
import { Loader2, FileText, CheckCircle } from "lucide-react";

const STATUS_COLORS = {
  UNLABELED: "#FFBB28",
  CONFIRMED: "#00C49F",
  APPROVED: "#0088FE",
  REJECTED: "#FF8042",
};

const STATUS_LABELS = {
  UNLABELED: "Chờ xử lý",
  CONFIRMED: "Hoàn thành",
  APPROVED: "Đã duyệt",
  REJECTED: "Lỗi",
};

export default function DashboardUserPage() {
  const { client, headers } = useApi();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-user"],
    queryFn: () =>
      projectsGetDashboardUser({
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
  const totalTasks = dashboardData.data.reduce(
    (sum: number, project: any) => sum + project.task_count,
    0,
  );

  // Tính tổng theo trạng thái
  const totalStatusCounts = dashboardData.data.reduce(
    (acc: Record<string, number>, project: any) => {
      Object.entries(project.status_counts).forEach(([status, count]) => {
        acc[status] = (acc[status] || 0) + (count as number);
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const completedTasks =
    (totalStatusCounts.CONFIRMED || 0) + (totalStatusCounts.APPROVED || 0);
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Dữ liệu cho biểu đồ tổng quan
  const overviewData = [
    {
      name: "Dự án",
      value: totalProjects,
      icon: FileText,
      color: "#0088FE",
    },
    {
      name: "Tổng task",
      value: totalTasks,
      icon: FileText,
      color: "#00C49F",
    },
    {
      name: "Hoàn thành",
      value: completedTasks,
      icon: CheckCircle,
      color: "#FFBB28",
    },
  ];

  // Dữ liệu cho biểu đồ tròn trạng thái tổng hợp
  const statusData = Object.entries(totalStatusCounts).map(
    ([status, count]) => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
      value: count,
      status,
    }),
  );

  // Dữ liệu cho biểu đồ cột theo dự án
  const projectData = dashboardData.data.map((project: any) => ({
    name: project.project_name,
    "Tổng số": project.task_count,
    "Chờ xử lý": project.status_counts.UNLABELED || 0,
    "Hoàn thành": project.status_counts.CONFIRMED || 0,
    "Đã duyệt": project.status_counts.APPROVED || 0,
    Lỗi: project.status_counts.REJECTED || 0,
  }));

  // Dữ liệu cho biểu đồ đường tiến độ
  const progressData = dashboardData.data.map((project: any) => {
    const total = project.task_count;
    const completed =
      (project.status_counts.CONFIRMED || 0) +
      (project.status_counts.APPROVED || 0);
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return {
      name: project.project_name,
      "Tiến độ (%)": Math.round(progress),
      "Tổng số": total,
      "Hoàn thành": completed,
    };
  });

  // Dữ liệu cho biểu đồ area chart
  const areaData = dashboardData.data.map((project: any) => ({
    name: project.project_name,
    "Chờ xử lý": project.status_counts.UNLABELED || 0,
    "Hoàn thành": project.status_counts.CONFIRMED || 0,
    "Đã duyệt": project.status_counts.APPROVED || 0,
    Lỗi: project.status_counts.REJECTED || 0,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Tổng quan dự án của bạn
        </Badge>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              {item.name === "Hoàn thành" && (
                <p className="text-xs text-muted-foreground">
                  {progressPercentage.toFixed(1)}% tiến độ
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Biểu đồ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="projects">Theo dự án</TabsTrigger>
          <TabsTrigger value="progress">Tiến độ</TabsTrigger>
          <TabsTrigger value="status">Trạng thái</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biểu đồ tròn trạng thái */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trạng thái</CardTitle>
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
                          fill={
                            STATUS_COLORS[
                              entry.status as keyof typeof STATUS_COLORS
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Biểu đồ cột dự án */}
            <Card>
              <CardHeader>
                <CardTitle>Task theo dự án</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Chờ xử lý"
                      fill={STATUS_COLORS.UNLABELED}
                      stackId="a"
                    />
                    <Bar
                      dataKey="Hoàn thành"
                      fill={STATUS_COLORS.CONFIRMED}
                      stackId="a"
                    />
                    <Bar
                      dataKey="Đã duyệt"
                      fill={STATUS_COLORS.APPROVED}
                      stackId="a"
                    />
                    <Bar
                      dataKey="Lỗi"
                      fill={STATUS_COLORS.REJECTED}
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết theo dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Chờ xử lý" fill={STATUS_COLORS.UNLABELED} />
                  <Bar dataKey="Hoàn thành" fill={STATUS_COLORS.CONFIRMED} />
                  <Bar dataKey="Đã duyệt" fill={STATUS_COLORS.APPROVED} />
                  <Bar dataKey="Lỗi" fill={STATUS_COLORS.REJECTED} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
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
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố trạng thái theo dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Chờ xử lý"
                    stackId="1"
                    stroke={STATUS_COLORS.UNLABELED}
                    fill={STATUS_COLORS.UNLABELED}
                  />
                  <Area
                    type="monotone"
                    dataKey="Hoàn thành"
                    stackId="1"
                    stroke={STATUS_COLORS.CONFIRMED}
                    fill={STATUS_COLORS.CONFIRMED}
                  />
                  <Area
                    type="monotone"
                    dataKey="Đã duyệt"
                    stackId="1"
                    stroke={STATUS_COLORS.APPROVED}
                    fill={STATUS_COLORS.APPROVED}
                  />
                  <Area
                    type="monotone"
                    dataKey="Lỗi"
                    stackId="1"
                    stroke={STATUS_COLORS.REJECTED}
                    fill={STATUS_COLORS.REJECTED}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bảng chi tiết */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.data.map((project: any) => (
              <div
                key={project.project_id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {project.project_name}
                  </h3>
                  <Badge variant="outline">{project.task_count} tasks</Badge>
                </div>
                {project.project_description && (
                  <p className="text-sm text-muted-foreground">
                    {project.project_description}
                  </p>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Thống kê trạng thái */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(project.status_counts).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                STATUS_COLORS[
                                  status as keyof typeof STATUS_COLORS
                                ],
                            }}
                          />
                          <span className="text-sm">
                            {
                              STATUS_LABELS[
                                status as keyof typeof STATUS_LABELS
                              ]
                            }
                            :
                          </span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Mini Pie Chart */}
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Chờ xử lý",
                                value: project.status_counts.UNLABELED || 0,
                                fill: STATUS_COLORS.UNLABELED,
                              },
                              {
                                name: "Hoàn thành",
                                value: project.status_counts.CONFIRMED || 0,
                                fill: STATUS_COLORS.CONFIRMED,
                              },
                              {
                                name: "Đã duyệt",
                                value: project.status_counts.APPROVED || 0,
                                fill: STATUS_COLORS.APPROVED,
                              },
                              {
                                name: "Lỗi",
                                value: project.status_counts.REJECTED || 0,
                                fill: STATUS_COLORS.REJECTED,
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                          />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
