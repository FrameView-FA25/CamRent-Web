export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const format = (decimal: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(decimal);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    // hour: "2-digit",
    // minute: "2-digit",
  });
};

export const getStatusInfo = (
  status: string
): {
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  bgColor?: string;
  textColor?: string;
} => {
  const statusMap: Record<string, any> = {
    PendingApproval: {
      label: "Chờ xác nhận",
      color: "warning" as const,
      bgColor: "#FFF7ED",
      textColor: "#F97316",
    },
    Confirmed: {
      label: "Đã xác nhận",
      color: "primary" as const,
      bgColor: "#DBEAFE",
      textColor: "#1D4ED8",
    },
    PickedUp: {
      label: "Đã giao máy",
      color: "info" as const,
      bgColor: "#FFFFFF",
      textColor: "#4F46E5",
    },
    Returned: {
      label: "Đã trả máy",
      color: "secondary" as const,
      bgColor: "#F3E8FF",
      textColor: "#7C3AED",
    },
    Completed: {
      label: "Hoàn thành",
      color: "success" as const,
      bgColor: "#D1FAE5",
      textColor: "#059669",
    },
    Cancelled: {
      label: "Đã hủy",
      color: "error" as const,
      bgColor: "#FEE2E2",
      textColor: "#DC2626",
    },
    Overdue: {
      label: "Quá hạn",
      color: "error" as const,
      bgColor: "#FEF2F2",
      textColor: "#991B1B",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      color: "default" as const,
      bgColor: "#F3F4F6",
      textColor: "#6B7280",
    }
  );
};

export const getBookingType = (type: string): string => {
  const typeMap: Record<string, string> = {
    Rental: "Thuê",
    Purchase: "Mua",
  };
  return typeMap[type] || type;
};
