import type { BookingItem } from "../types/booking.types";

export const getItemName = (item: BookingItem): string => {
  if (item.product) {
    return item.product.name || "Sản phẩm";
  }
  if (item.camera) {
    const parts = [item.camera.brand, item.camera.model];
    if (item.camera.variant) parts.push(item.camera.variant);
    return parts.join(" ");
  }
  if (item.accessory) {
    const parts = [item.accessory.brand, item.accessory.model];
    if (item.accessory.variant) parts.push(item.accessory.variant);
    return parts.join(" ");
  }
  if (item.combo) return item.combo.name || "Combo";
  if (item.productId) return `Product ID: ${item.productId.slice(0, 8)}`;
  if (item.cameraId) return `Camera ID: ${item.cameraId.slice(0, 8)}`;
  if (item.accessoryId) return `Accessory ID: ${item.accessoryId.slice(0, 8)}`;
  if (item.comboId) return `Combo ID: ${item.comboId.slice(0, 8)}`;
  return "Không xác định";
};
export const getBookingStatusText = (status: string): string => {
  // Tạm thời hiển thị "Đã Xác Nhận" nếu status là "Giỏ Hàng"
  if (status === "Giỏ Hàng") {
    return "Đã Xác Nhận";
  }

  return status;
};
