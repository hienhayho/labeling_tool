"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { LineItemRead, projectsGetLineItems } from "@/client";
import toast from "react-hot-toast";

interface LineItemsTableProps {
  projectId: number;
  onViewSample: (lineItem: any) => void;
  selectedSampleIndex?: number;
}

type LineItemStatus = "UNLABELED" | "CONFIRMED" | "APPROVED" | "REJECTED";

export function LineItemsTable({
  projectId,
  onViewSample,
  selectedSampleIndex,
}: LineItemsTableProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<LineItemStatus | null>(null);
  const [isNavigatingToSample, setIsNavigatingToSample] = useState(false);
  const [isAutoPageChange, setIsAutoPageChange] = useState(false);
  const { client, headers } = useApi();
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});
  const isNavigatingRef = useRef(false);
  const lastSelectedSampleRef = useRef<number | null>(null);

  const {
    data: lineItemsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["line-items", projectId, page, limit, status],
    queryFn: () => {
      const result = projectsGetLineItems({
        client,
        headers,
        path: { project_id: projectId },
        query: {
          page,
          limit,
          status: status || undefined,
        },
      });
      toast.success("Tải dữ liệu thành công");
      return result;
    },
    refetchInterval: 10000,
  });

  // Reset navigation state when data changes
  useEffect(() => {
    if (lineItemsData && isNavigatingToSample) {
      setIsNavigatingToSample(false);
      isNavigatingRef.current = false;
    }
  }, [lineItemsData, isNavigatingToSample]);

  // Handle auto-navigation when selectedSampleIndex changes
  useEffect(() => {
    if (
      selectedSampleIndex &&
      lineItemsData?.data?.data &&
      !isNavigatingRef.current &&
      selectedSampleIndex !== lastSelectedSampleRef.current
    ) {
      lastSelectedSampleRef.current = selectedSampleIndex;

      // Check if selected sample is on current page
      const currentPageItems = lineItemsData.data.data;
      const isOnCurrentPage = currentPageItems.some(
        (item: any) => item.line_index === selectedSampleIndex,
      );

      if (isOnCurrentPage) {
        // Scroll to the row if it's on current page
        const rowElement = rowRefs.current[selectedSampleIndex];
        if (rowElement) {
          isNavigatingRef.current = true;
          setIsNavigatingToSample(true);
          setTimeout(() => {
            rowElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            setIsNavigatingToSample(false);
            isNavigatingRef.current = false;
          }, 100);
        }
      } else {
        // Calculate which page contains the selected sample
        const itemsPerPage = limit;
        const targetPage = Math.ceil(selectedSampleIndex / itemsPerPage);

        if (targetPage !== page && targetPage <= lineItemsData.data.num_pages) {
          setIsAutoPageChange(true);
          setPage(targetPage);
        }
      }
    }
  }, [selectedSampleIndex, lineItemsData, limit]);

  // Handle auto-selection of first sample when auto-navigating to new page
  useEffect(() => {
    if (
      isAutoPageChange &&
      lineItemsData?.data?.data &&
      lineItemsData.data.data.length > 0
    ) {
      const firstSampleIndex = lineItemsData.data.data[0].line_index;
      onViewSample(lineItemsData.data.data[0]);
      setIsAutoPageChange(false);
    }
  }, [isAutoPageChange, lineItemsData, onViewSample]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (lineItemsData?.data?.num_pages && page < lineItemsData.data.num_pages) {
      setPage(page + 1);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus === "all" ? null : (newStatus as LineItemStatus));
    setPage(1); // Reset về trang đầu khi thay đổi status
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNLABELED":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case "CONFIRMED":
        return <Badge variant="default">Hoàn thành</Badge>;
      case "APPROVED":
        return <Badge variant="success">Đã duyệt</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Lỗi</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mẫu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mẫu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-8">
            Có lỗi xảy ra khi tải danh sách: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Danh sách mẫu</span>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px]">
                  {status
                    ? status === "UNLABELED"
                      ? "Chờ xử lý"
                      : status === "CONFIRMED"
                        ? "Hoàn thành"
                        : status === "REJECTED"
                          ? "Lỗi"
                          : status === "APPROVED"
                            ? "Đã duyệt"
                            : "Tất cả"
                    : "Tất cả"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusChange("all")}>
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("UNLABELED")}
                >
                  Chờ xử lý
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CONFIRMED")}
                >
                  Hoàn thành
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("REJECTED")}
                >
                  Lỗi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                  ID
                </TableHead>
                <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                  Trạng thái
                </TableHead>
                <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                  Số tin nhắn
                </TableHead>
                <TableHead className="text-center sticky top-0 bg-white dark:bg-gray-950 z-10 font-bold">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItemsData?.data?.data?.map((item: LineItemRead) => (
                <TableRow
                  key={item.id}
                  ref={(el) => {
                    rowRefs.current[item.line_index] = el;
                  }}
                  className={
                    selectedSampleIndex === item.line_index
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }
                >
                  <TableCell className="font-medium text-center">
                    {item.id}
                    {isNavigatingToSample &&
                      selectedSampleIndex === item.line_index && (
                        <Loader2 className="h-3 w-3 animate-spin inline ml-2" />
                      )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(item.status ?? "UNLABELED")}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.line_messages?.length || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSample(item)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {lineItemsData?.data && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Hiển thị {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, lineItemsData.data.total_count)} trong số{" "}
              {lineItemsData.data.total_count} mẫu
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium flex items-center gap-2">
                {isAutoPageChange && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                Trang {page} / {lineItemsData.data.num_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= lineItemsData.data.num_pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
