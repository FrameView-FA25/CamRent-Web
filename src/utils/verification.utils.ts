import {
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { colors } from "../theme/colors";

interface StatusInfo {
  label: string;
  color: string;
  bgcolor: string;
  icon: LucideIcon; // ✅ Add icon type
}

export const getVerificationStatusInfo = (status: string): StatusInfo => {
  const statusMap: Record<string, StatusInfo> = {
    Pending: {
      label: "Pending",
      color: colors.status.warning,
      bgcolor: colors.status.warningLight,
      icon: Clock, // ✅ Add icon
    },
    Assigned: {
      label: "Assigned",
      color: colors.status.info,
      bgcolor: colors.status.infoLight,
      icon: UserCheck, // ✅ Add icon
    },
    Approved: {
      label: "Approved",
      color: colors.status.success,
      bgcolor: colors.status.successLight,
      icon: CheckCircle, // ✅ Add icon
    },
    Rejected: {
      label: "Rejected",
      color: colors.status.error,
      bgcolor: colors.status.errorLight,
      icon: XCircle, // ✅ Add icon
    },
  };

  return (
    statusMap[status] || {
      label: status,
      color: colors.neutral[600],
      bgcolor: colors.neutral[100],
      icon: AlertCircle, // ✅ Default icon
    }
  );
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getVerificationTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    Camera: "Camera",
    Accessory: "Accessory",
    Combo: "Combo",
  };
  return typeMap[type] || type;
};