import React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Truck,
} from "lucide-react";
import { colors } from "../theme/colors";

interface StatusInfo {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactElement;
}

export const getOrderStatusInfo = (
  status: string,
  statusText: string
): StatusInfo => {
  const statusMap: Record<string, StatusInfo> = {
    Pending: {
      label: statusText || "Chờ xác nhận",
      color: colors.status.warning,
      bgColor: colors.status.warningLight,
      icon: React.createElement(Clock, { size: 16 }),
    },
    Confirmed: {
      label: statusText || "Đã xác nhận",
      color: colors.accent.blue,
      bgColor: '#E3F2FD',
      icon: React.createElement(CheckCircle, { size: 16 }),
    },
    PickedUp: {
      label: statusText || "Đang thuê",
      color: colors.status.success,
      bgColor: '#E8F5E9',
      icon: React.createElement(Package, { size: 16 }),
    },
    Completed: {
      label: statusText || "Hoàn thành",
    color: '#2E7D32',
    bgColor: '#C8E6C9',
      icon: React.createElement(CheckCircle, { size: 16 }),
    },
    Cancelled: {
      label: statusText || "Đã hủy",
      color: colors.status.error,
      bgColor: colors.status.errorLight,
      icon: React.createElement(XCircle, { size: 16 }),
    },
     Returned: {
      label: statusText || "Đã trả",
      color: colors.primary.main,
      bgColor: colors.primary.lighter,
      icon: React.createElement(Truck, { size: 16 }),
    },
  };
  

  return (
    statusMap[status] || {
      label: statusText || status,
      color: colors.neutral[600],
      bgColor: colors.neutral[100],
      icon: React.createElement(AlertCircle, { size: 16 }),
    }
  );
};

export const ORDER_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "PendingApproval" },
  { label: "Đã xác nhận", value: "Confirmed" },
  { label: "Đang thuê", value: "InProgress" },
  { label: "Hoàn thành", value: "Completed" },
  { label: "Đã hủy", value: "Cancelled" },
] as const;