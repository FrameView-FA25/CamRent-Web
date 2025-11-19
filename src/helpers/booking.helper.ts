import type { BookingItem } from "../types/booking.types";

export const getItemName = (item: BookingItem): string => {
  return item.itemName || "Unknown Item";
};

export const getItemType = (item: BookingItem): string => {
  return item.itemType || "Unknown";
};
