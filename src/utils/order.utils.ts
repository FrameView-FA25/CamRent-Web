import React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
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
    PendingApproval: {
      label: statusText || "Chờ duyệt",
      color: colors.status.warning,
      bgColor: colors.status.warningLight,
      icon: React.createElement(Clock, { size: 16 }),
    },
    Confirmed: {
      label: statusText || "Đã xác nhận",
      color: colors.status.info,
      bgColor: colors.status.infoLight,
      icon: React.createElement(CheckCircle, { size: 16 }),
    },
    InProgress: {
      label: statusText || "Đang thuê",
      color: colors.accent.blue,
      bgColor: colors.accent.blueLight,
      icon: React.createElement(Truck, { size: 16 }),
    },
    Completed: {
      label: statusText || "Hoàn thành",
      color: colors.status.success,
      bgColor: colors.status.successLight,
      icon: React.createElement(CheckCircle, { size: 16 }),
    },
    Cancelled: {
      label: statusText || "Đã hủy",
      color: colors.status.error,
      bgColor: colors.status.errorLight,
      icon: React.createElement(XCircle, { size: 16 }),
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