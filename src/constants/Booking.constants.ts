import {
  Search,
  HourglassEmpty,
  CheckCircle,
} from "@mui/icons-material";

export const BOOKING_STATS = [
  {
    label: "Tổng đơn thuê",
    icon: Search,
    color: "#2196f3",
    statusFilter: null,
  },
  {
    label: "Bản nháp",
    icon: HourglassEmpty,
    color: "#ff9800",
    statusFilter: "Bản nháp",
  },
  {
    label: "Đã xác nhận",
    icon: CheckCircle,
    color: "#4caf50",
    statusFilter: "Đã xác nhận",
  },
  {
    label: "Chờ duyệt",
    icon: CheckCircle,
    color: "#e0fd03ff",
    statusFilter: "Chờ duyệt",
  },
];

export const STAFF_LIST = [
  { id: "1", name: "Nhân viên A" },
  { id: "2", name: "Nhân viên B" },
  { id: "3", name: "Nhân viên C" },
];