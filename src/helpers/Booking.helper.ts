import type { BookingItem } from "../types/booking.types";

export const getItemName = (item: BookingItem): string => {
  // Use the name fields from API response first
  if (item.cameraName) return item.cameraName;
  if (item.accessoryName) return item.accessoryName;
  if (item.comboName) return item.comboName;

  // Fallback to object details if available
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

  // Fallback to IDs
  if (item.cameraId) return `Camera ID: ${item.cameraId.slice(0, 8)}`;
  if (item.accessoryId) return `Accessory ID: ${item.accessoryId.slice(0, 8)}`;
  if (item.comboId) return `Combo ID: ${item.comboId.slice(0, 8)}`;
  return "Không xác định";
};
