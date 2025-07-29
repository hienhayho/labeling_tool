// Mock data for the Vietnamese tax dashboard

export const monthlyRevenueData = [
  { date: "2024-01-01", doanhthu: 2.8, chiphi: 1.2, loinhuan: 1.6 },
  { date: "2024-02-01", doanhthu: 3.1, chiphi: 1.4, loinhuan: 1.7 },
  { date: "2024-03-01", doanhthu: 2.9, chiphi: 1.3, loinhuan: 1.6 },
  { date: "2024-04-01", doanhthu: 3.3, chiphi: 1.5, loinhuan: 1.8 },
  { date: "2024-05-01", doanhthu: 3.7, chiphi: 1.6, loinhuan: 2.1 },
  { date: "2024-06-01", doanhthu: 3.5, chiphi: 1.5, loinhuan: 2.0 },
  { date: "2024-07-01", doanhthu: 3.9, chiphi: 1.7, loinhuan: 2.2 },
  { date: "2024-08-01", doanhthu: 4.1, chiphi: 1.8, loinhuan: 2.3 },
  { date: "2024-09-01", doanhthu: 3.8, chiphi: 1.6, loinhuan: 2.2 },
  { date: "2024-10-01", doanhthu: 4.2, chiphi: 1.9, loinhuan: 2.3 },
  { date: "2024-11-01", doanhthu: 4.0, chiphi: 1.8, loinhuan: 2.2 },
  { date: "2024-12-01", doanhthu: 4.5, chiphi: 2.0, loinhuan: 2.5 },
];

export const recentInvoices = [
  {
    id: "HD001",
    type: "Hàng bán",
    customer: "Công ty Cổ phần Trung Nguyên",
    date: "15/12/2024",
    amount: 2500000,
    status: "active",
  },
  {
    id: "HD002",
    type: "Chi phí chung",
    customer: "Siêu thị CoopMart",
    date: "14/12/2024",
    amount: 450000,
    status: "processing",
  },
  {
    id: "HD003",
    type: "Hàng bán",
    customer: "Công ty TNHH Vinamilk",
    date: "13/12/2024",
    amount: 3200000,
    status: "active",
  },
  {
    id: "HD004",
    type: "Chi phí vận hành",
    customer: "Công ty Điện lực Miền Nam",
    date: "12/12/2024",
    amount: 890000,
    status: "processing",
  },
];

export const taxAlerts = [
  {
    id: 1,
    type: "urgent",
    title: "Sắp đến hạn nộp thuế VAT",
    description: "Thuế VAT tháng 12/2024 cần nộp trước ngày 20/01/2025",
    dueDate: "20/01/2025",
    amount: "4.52 triệu VND",
  },
  {
    id: 2,
    type: "warning",
    title: "Thiếu hóa đơn chi phí",
    description: "Phát hiện 3 giao dịch chưa có hóa đơn chứng từ",
    action: "Bổ sung hóa đơn",
  },
  {
    id: 3,
    type: "info",
    title: "Đề xuất tối ưu thuế",
    description: "Có thể giảm 15% thuế TNDN bằng cách phân bổ chi phí R&D",
    action: "Xem đề xuất chi tiết",
  },
];

// Chart configuration for the line chart
export const revenueChartConfig = {
  doanhthu: {
    label: "Doanh thu",
    color: "var(--chart-1)",
  },
  chiphi: {
    label: "Chi phí",
    color: "var(--chart-2)",
  },
  loinhuan: {
    label: "Lợi nhuận",
    color: "var(--chart-3)",
  },
} as const;
