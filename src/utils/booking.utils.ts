export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export const getStatusInfo = (statusText: string) => {
  switch (statusText) {
    case "Bản nháp":
      return { label: "Bản nháp", color: "warning" as const };
    case "Đã xác nhận":
      return { label: "Đã xác nhận", color: "success" as const };
    default:
      return { label: statusText || "Không xác định", color: "default" as const };
  }
};

export const getBookingType = (type: number): string => {
  switch (type) {
    case 0:
      return "Camera";
    case 1:
      return "Phụ kiện";
    case 2:
      return "Combo";
    default:
      return "Khác";
  }
};