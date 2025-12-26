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

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

/**
 * Chuẩn hoá chuỗi trạng thái đầu vào (API có thể trả nhiều biến thể).
 * Trả về nhãn tiếng Việt chuẩn nếu có ánh xạ, ngược lại trả nguyên chuỗi.
 */
export const normalizeStatusText = (status?: string): string => {
  if (!status) return "";
  const s = status.toString().trim().toLowerCase();
  const map: Record<string, string> = {
    "hoàn tất": "Hoàn thành",
    "hoan tat": "Hoàn thành",
    completed: "Hoàn thành",
    returned: "Đã trả máy",
    "đã trả": "Đã trả máy",
    "đã trả máy": "Đã trả máy",
    pickedup: "Đã giao máy",
    "đã nhận máy": "Đã giao máy",
    "đã nhận": "Đã giao máy",
    "nhận máy": "Đã giao máy",
    confirmed: "Đã xác nhận",
    pendingapproval: "Chờ xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };
  return map[s] || status;
};

/**
 * Ánh xạ chuỗi trạng thái (tiếng Anh/Việt) sang chỉ số bước trên stepper.
 * Trả về -1 cho hủy, 0..4 cho các bước tương ứng.
 */
export const getStatusNumber = (statusText: string): number => {
  const key = (statusText || "").toString().trim().toLowerCase();
  const statusMap: Record<string, number> = {
    // Pending variants
    pending: 0,
    pendingapproval: 0,
    "chờ duyệt": 0,
    // Confirmed variants
    confirmed: 1,
    "đã xác nhận": 1,
    // Delivering / PickedUp / InProgress variants
    delivering: 2,
    pickedup: 2,
    "đã nhận máy": 2,
    "đã nhận": 2,
    inprogress: 2,
    "đang thuê": 2,
    "đang giao hàng": 2,
    // Delivered / Returned variants
    delivered: 3,
    returned: 3,
    "đã trả": 3,
    "đã trả máy": 3,
    // Completed
    completed: 4,
    "hoàn thành": 4,
    // Cancelled / Rejected
    cancelled: -1,
    rejected: -1,
    "đã hủy": -1,
  };

  return statusMap[key] ?? 0;
};

export const getBookingType = (type: string): string => {
  const typeMap: Record<string, string> = {
    Rental: "Thuê",
    Purchase: "Mua",
  };
  return typeMap[type] || type;
};
