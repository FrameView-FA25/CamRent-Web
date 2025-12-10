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
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusInfo = (statusText: string) => {
  const statusMap: Record<
    string,
    {
      label: string;
      color: "warning" | "info" | "primary" | "success" | "error" | "default";
    }
  > = {
    // Đã xác nhận: dùng màu xanh lá cho thống nhất với UI
    "Đã xác nhận": { label: "Đã xác nhận", color: "success" },
    "Đang thuê": { label: "Đang thuê", color: "primary" },
    "Hoàn thành": { label: "Hoàn thành", color: "success" },
    "Đã trả": { label: "Đã trả", color: "info" },
    "Đã hủy": { label: "Đã hủy", color: "error" },
    "Giỏ hàng": { label: "Giỏ hàng", color: "default" },
  };

  return (
    statusMap[statusText] || { label: statusText, color: "default" as const }
  );
};

export const getBookingType = (type: string): string => {
  const typeMap: Record<string, string> = {
    Rental: "Thuê",
    Purchase: "Mua",
  };
  return typeMap[type] || type;
};
