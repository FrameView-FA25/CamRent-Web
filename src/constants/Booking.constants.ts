import {
  Search,
  HourglassEmpty,
  CheckCircle,
  Assignment,
  ErrorOutline,
} from "@mui/icons-material";

export const BOOKING_STATS = [
  {
    label: "Tổng đơn được gán",
    icon: Search,
    color: "#2196f3",
    statusFilter: null,
  },
  {
    label: "Đang xử lý",
    icon: HourglassEmpty,
    color: "#ff9800",
    statusFilter: 1,
  },
  {
    label: "Đã xác nhận",
    icon: CheckCircle,
    color: "#4caf50",
    statusFilter: 2,
  },
  {
    label: "Đã hoàn thành",
    icon: Assignment,
    color: "#9c27b0",
    statusFilter: 4,
  },
  {
    label: "Quá hạn",
    icon: ErrorOutline,
    color: "#f44336",
    statusFilter: 8,
  },
];

export const STAFF_LIST = [
  { id: "1", name: "Nhân viên A" },
  { id: "2", name: "Nhân viên B" },
  { id: "3", name: "Nhân viên C" },
];
