import {
  Search,
  HourglassEmpty,
  CheckCircle,
  Assignment,
} from "@mui/icons-material";

export const BOOKING_STATS = [
  {
    label: "Tổng đơn thuê",
    icon: Search,
    color: "#2196f3",
    statusFilter: null,
  },
  {
    label: "Chờ xác nhận",
    icon: HourglassEmpty,
    color: "#ff9800",
    statusFilter: 0,
  },
  {
    label: "Đang thuê",
    icon: CheckCircle,
    color: "#4caf50",
    statusFilter: 2,
  },
  {
    label: "Đã hoàn thành",
    icon: Assignment,
    color: "#9c27b0",
    statusFilter: 3,
  },
];

export const STAFF_LIST = [
  { id: "1", name: "Nhân viên A" },
  { id: "2", name: "Nhân viên B" },
  { id: "3", name: "Nhân viên C" },
];