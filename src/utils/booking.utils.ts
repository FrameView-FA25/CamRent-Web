export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export const getStatusInfo = (status: number) => {
  switch (status) {
    case 0:
      return { label: "Chờ xác nhận", color: "warning" as const };
    case 1:
      return { label: "Đang xử lý", color: "warning" as const };
    case 2:
      return { label: "Đã xác nhận", color: "info" as const };
    case 3:
      return { label: "Đang thực hiện", color: "success" as const };
    case 4:
      return { label: "Hoàn thành", color: "default" as const };
    case 5:
      return { label: "Đã hủy", color: "error" as const };
    case 8:
      return { label: "Quá hạn", color: "error" as const };
    default:
      return { label: "Không xác định", color: "default" as const };
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
